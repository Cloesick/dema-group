terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "dema-group-terraform-state"
    key    = "portal/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "dema-portal"
      ManagedBy   = "terraform"
    }
  }
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "dema-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  single_nat_gateway = var.environment != "production"

  enable_vpn_gateway = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Terraform   = "true"
    Environment = var.environment
  }
}

# ECS Cluster
module "ecs" {
  source = "terraform-aws-modules/ecs/aws"

  cluster_name = "dema-${var.environment}"

  cluster_configuration = {
    execute_command_configuration = {
      logging = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = "/aws/ecs/dema-${var.environment}"
      }
    }
  }

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

# RDS
module "rds" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "dema-${var.environment}"

  engine               = "postgres"
  engine_version       = "14"
  family              = "postgres14"
  major_engine_version = "14"
  instance_class       = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100

  db_name  = "dema"
  username = "dema_admin"
  port     = 5432

  multi_az               = var.environment == "production"
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [module.security_groups.database_security_group_id]

  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"

  backup_retention_period = var.environment == "production" ? 30 : 7
  skip_final_snapshot    = var.environment != "production"

  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_name        = "dema-${var.environment}-rds-monitoring"
  create_monitoring_role      = true

  parameters = [
    {
      name  = "autovacuum"
      value = 1
    },
    {
      name  = "client_encoding"
      value = "utf8"
    }
  ]

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}

# ElastiCache Redis
module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"

  cluster_id           = "dema-${var.environment}"
  engine              = "redis"
  engine_version      = "6.x"
  node_type           = var.cache_node_type
  num_cache_nodes     = 1
  port                = 6379

  subnet_group_name    = module.vpc.elasticache_subnet_group
  security_group_ids   = [module.security_groups.redis_security_group_id]
  maintenance_window   = "tue:05:00-tue:06:00"
  notification_topic_arn = aws_sns_topic.cache_alerts.arn

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}

# CloudFront
module "cdn" {
  source = "terraform-aws-modules/cloudfront/aws"

  aliases = ["${var.environment == "production" ? "www" : var.environment}.dema-group.com"]

  comment             = "DEMA Portal CDN"
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"
  retain_on_delete    = false
  wait_for_deployment = false

  create_origin_access_identity = true
  origin_access_identities = {
    s3_bucket_one = "DEMA Portal CDN"
  }

  origin = {
    api = {
      domain_name = module.alb.lb_dns_name
      custom_origin_config = {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
    s3 = {
      domain_name = module.s3_bucket.s3_bucket_bucket_regional_domain_name
      s3_origin_config = {
        origin_access_identity = "s3_bucket_one"
      }
    }
  }

  default_cache_behavior = {
    target_origin_id       = "api"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]
    compress       = true
    query_string   = true

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    forwarded_values = {
      query_string = true
      headers      = ["*"]
      cookies = {
        forward = "all"
      }
    }
  }

  ordered_cache_behavior = [
    {
      path_pattern           = "/static/*"
      target_origin_id       = "s3"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress       = true

      min_ttl     = 0
      default_ttl = 86400
      max_ttl     = 31536000

      forwarded_values = {
        query_string = false
        headers      = ["Origin"]
        cookies = {
          forward = "none"
        }
      }
    }
  ]

  viewer_certificate = {
    acm_certificate_arn = module.acm.acm_certificate_arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}

# Route53
module "route53" {
  source = "terraform-aws-modules/route53/aws"

  zone_name = "dema-group.com"

  records = [
    {
      name    = var.environment == "production" ? "www" : var.environment
      type    = "A"
      alias = {
        name    = module.cdn.cloudfront_distribution_domain_name
        zone_id = module.cdn.cloudfront_distribution_hosted_zone_id
      }
    }
  ]
}

# Security Groups
module "security_groups" {
  source = "terraform-aws-modules/security-group/aws"

  vpc_id = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "HTTP"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "HTTPS"
      cidr_blocks = "0.0.0.0/0"
    }
  ]

  egress_with_cidr_blocks = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = "0.0.0.0/0"
    }
  ]

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}

# CloudWatch
module "cloudwatch" {
  source = "terraform-aws-modules/cloudwatch/aws"

  alarm_name          = "dema-${var.environment}-alarms"
  alarm_description   = "DEMA Portal monitoring alarms"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/ECS"
  period             = "120"
  statistic          = "Average"
  threshold          = "80"
  alarm_actions      = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = module.ecs.cluster_name
  }

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}

# SNS Topics
resource "aws_sns_topic" "alerts" {
  name = "dema-${var.environment}-alerts"

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}

resource "aws_sns_topic" "cache_alerts" {
  name = "dema-${var.environment}-cache-alerts"

  tags = {
    Environment = var.environment
    Project     = "dema-portal"
  }
}
