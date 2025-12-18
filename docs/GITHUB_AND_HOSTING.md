# GitHub Limits & Hosting Considerations

## GitHub Repository Limits

### Size Limits

| Limit | Value | Notes |
|-------|-------|-------|
| **Repository size** | 5GB soft limit | Warning at 5GB, issues at 10GB+ |
| **Single file size** | 100MB max | Blocked on push |
| **Large file warning** | 50MB | Warning on push |
| **Push size** | 2GB max | Per push operation |
| **Git LFS storage** | 1GB free | Then $5/50GB/month |

### What Counts Toward Size

| Counts | Doesn't Count |
|--------|---------------|
| All committed files | Issues, PRs, wikis |
| Git history | GitHub Actions artifacts (separate) |
| All branches | Releases (separate, 2GB each) |
| LFS pointer files | Packages (separate) |

### Current Project Assessment

| Project | Estimated Size | Status |
|---------|---------------|--------|
| **dema-webshop** | ~800MB | ✅ OK |
| **dema-group** (with dema copy) | ~1.6GB | ⚠️ Watch |
| **Product images** | ~500MB | ⚠️ Consider LFS |
| **PDF catalogs** | ~200MB | ⚠️ Consider LFS |

## When GitHub Becomes a Problem

### Warning Signs

1. **Clone takes >5 minutes** - Repo too large
2. **Push fails** - File >100MB or push >2GB
3. **GitHub warning email** - Approaching limits
4. **Slow CI/CD** - Large repo = slow builds

### Our Risk Areas

| Content | Size | Risk | Solution |
|---------|------|------|----------|
| Product images | 500MB | Medium | Git LFS or external CDN |
| PDF catalogs | 200MB | Low | Git LFS or external storage |
| JSON data files | 100MB | Low | OK for now |
| node_modules | N/A | None | Already gitignored |
| Duplicate dema-webshop | 800MB | High | Remove, use single source |

---

## Hosting Options Analysis

### Option 1: GitHub + Vercel (Current)

```
GitHub (Code) → Vercel (Hosting)
     ↓              ↓
  Free tier     Free tier
```

**Pros:**
- Zero cost to start
- Automatic deployments
- Great developer experience
- No server management

**Cons:**
- GitHub size limits
- Vercel bandwidth limits (100GB/mo free)
- No control over infrastructure

**Best for:** Development, small-medium traffic

### Option 2: GitHub + Self-Hosted Server

```
GitHub (Code) → VPS (Hosting)
     ↓              ↓
  Free tier    €5-50/month
```

**Providers:**

| Provider | Starter | Mid | High |
|----------|---------|-----|------|
| **Hetzner** | €4/mo (CX11) | €9/mo (CX21) | €18/mo (CX31) |
| **DigitalOcean** | $6/mo | $12/mo | $24/mo |
| **Contabo** | €5/mo | €10/mo | €15/mo |
| **OVH** | €4/mo | €8/mo | €16/mo |

**Pros:**
- Full control
- No bandwidth limits
- Can host database, search, etc.
- Predictable costs

**Cons:**
- Requires DevOps knowledge
- Server maintenance
- Security responsibility
- Manual deployments (unless CI/CD setup)

### Option 3: Self-Hosted Git + Server

```
Gitea/GitLab (Code) → VPS (Hosting)
         ↓                  ↓
    Same server        Same server
```

**When to consider:**
- GitHub limits exceeded
- Need private repos without GitHub cost
- Want full control
- Compliance requirements

**Cost:** €10-30/month for combined server

### Option 4: Hybrid Approach (Recommended for Scale)

```
GitHub (Code) → Vercel (Frontend)
                     ↓
              Hetzner VPS (Backend services)
                     ↓
         ┌──────────┼──────────┐
         ↓          ↓          ↓
    PostgreSQL  Meilisearch  Redis
```

**Cost:** €20-50/month total

---

## Decision Matrix

### When to Use What

| Scenario | Recommendation | Monthly Cost |
|----------|---------------|--------------|
| **Development/MVP** | GitHub + Vercel free | €0 |
| **Launch (<1K users)** | GitHub + Vercel Pro | €20 |
| **Growth (1-10K users)** | GitHub + Vercel + Hetzner backend | €40-80 |
| **Scale (10K+ users)** | GitHub + dedicated infrastructure | €100-500 |
| **Enterprise** | Self-hosted everything | €200-1000 |

### Traffic-Based Recommendations

| Monthly Visitors | Bandwidth | Recommendation |
|-----------------|-----------|----------------|
| <10,000 | <50GB | Vercel free |
| 10-50,000 | 50-200GB | Vercel Pro |
| 50-200,000 | 200GB-1TB | Vercel Pro + CDN |
| >200,000 | >1TB | Self-hosted or enterprise |

---

## Large File Strategies

### Git LFS (Large File Storage)

For files >50MB (images, PDFs):

```bash
# Install LFS
git lfs install

# Track large files
git lfs track "*.pdf"
git lfs track "public/images/**/*.jpg"
git lfs track "public/images/**/*.png"

# Add .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS"
```

**Cost:** 
- Free: 1GB storage, 1GB bandwidth/month
- Data pack: $5/month for 50GB storage + 50GB bandwidth

### External Storage (Better for Scale)

Move large assets to external storage:

| Service | Free Tier | Paid | Best For |
|---------|-----------|------|----------|
| **Cloudflare R2** | 10GB | $0.015/GB | Images, static files |
| **AWS S3** | 5GB (12mo) | $0.023/GB | Everything |
| **Backblaze B2** | 10GB | $0.005/GB | Cheapest storage |
| **Supabase Storage** | 1GB | Included in plan | If using Supabase |

**Implementation:**

```typescript
// Instead of: /public/images/product.jpg
// Use: https://assets.demagroup.be/images/product.jpg

const imageUrl = `${process.env.NEXT_PUBLIC_CDN_URL}/images/${product.image}`;
```

---

## Recommended Architecture by Phase

### Phase 1: MVP (Now)

```
┌─────────────────────────────────────────┐
│              GitHub                      │
│         (Code repository)                │
│              ~1GB                        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              Vercel                      │
│         (Frontend hosting)               │
│           Free tier                      │
└─────────────────────────────────────────┘

Cost: €0/month
```

### Phase 2: Launch

```
┌─────────────────────────────────────────┐
│              GitHub                      │
│         (Code only, <2GB)                │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│    Vercel     │       │ Cloudflare R2 │
│   (Frontend)  │       │   (Assets)    │
│    €20/mo     │       │    €5/mo      │
└───────────────┘       └───────────────┘

Cost: €25/month
```

### Phase 3: Growth

```
┌─────────────────────────────────────────┐
│              GitHub                      │
│         (Code only, <2GB)                │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│  Vercel   │ │  Hetzner  │ │Cloudflare │
│ (Frontend)│ │   (VPS)   │ │(CDN+R2)   │
│  €20/mo   │ │  €18/mo   │ │  €10/mo   │
└───────────┘ └───────────┘ └───────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   PostgreSQL  Meilisearch    Redis

Cost: €50-80/month
```

### Phase 4: Scale

```
┌─────────────────────────────────────────┐
│         GitHub / GitLab                  │
│         (Code repository)                │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Kubernetes Cluster             │
│      (Hetzner / DigitalOcean / AWS)     │
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Frontend │ │   API   │ │ Workers │   │
│  │ Pods    │ │  Pods   │ │  Pods   │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│          Managed Services                │
│  PostgreSQL │ Elasticsearch │ Redis     │
└─────────────────────────────────────────┘

Cost: €200-500/month
```

---

## Immediate Actions

### 1. Clean Up Current Repo

```bash
# Check repo size
git count-objects -vH

# Find large files
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort -rnk2 | \
  head -20
```

### 2. Remove Duplicate dema-webshop

The `apps/dema/` folder is an 800MB duplicate. Options:
- Delete it (use dema-webshop as source)
- Or make dema-webshop the portal directly

### 3. Consider Git LFS for Assets

If keeping images/PDFs in repo:
```bash
git lfs install
git lfs track "*.pdf"
git lfs track "public/images/**/*"
```

### 4. Set Up .gitignore Properly

```gitignore
# Large generated files
public/data/input_pdfs_analysis*.json

# Build outputs
.next/
node_modules/
dist/

# Large assets (if using external storage)
# public/images/products/
# public/pdfs/
```

---

---

## Amazon Web Services (AWS) Analysis

### AWS Services Relevant to DEMA Group

| Service | Purpose | Monthly Cost | When to Use |
|---------|---------|--------------|-------------|
| **EC2** | Virtual servers | €20-200 | Self-hosted apps |
| **RDS** | Managed PostgreSQL | €15-150 | Production database |
| **S3** | File storage | €0.023/GB | Images, PDFs, backups |
| **CloudFront** | CDN | €0.085/GB | Global asset delivery |
| **Lambda** | Serverless functions | Pay per use | API endpoints |
| **Amplify** | Full-stack hosting | €0-50 | Alternative to Vercel |
| **ElastiCache** | Redis/Memcached | €15-100 | Caching |
| **OpenSearch** | Elasticsearch | €30-200 | Search (overkill for us) |
| **SES** | Email sending | €0.10/1000 | Transactional email |
| **Route 53** | DNS | €0.50/zone | Domain management |

### AWS vs Alternatives Comparison

| Factor | AWS | Vercel | Hetzner | Supabase |
|--------|-----|--------|---------|----------|
| **Complexity** | High | Low | Medium | Low |
| **Cost (small)** | €50-100 | €0-20 | €5-20 | €0-25 |
| **Cost (scale)** | €200-1000 | €150-400 | €50-200 | €100-400 |
| **Control** | Full | Limited | Full | Limited |
| **Learning curve** | Steep | Easy | Medium | Easy |
| **Enterprise ready** | Yes | Yes | Partial | Partial |
| **Belgium region** | No (Frankfurt) | Edge | Germany | US/EU |

### When AWS Makes Sense

**Use AWS if:**
- ✅ Need enterprise compliance (ISO, SOC2, HIPAA)
- ✅ Require specific AWS services (SageMaker, Rekognition)
- ✅ Have AWS expertise in-house
- ✅ Need multi-region deployment
- ✅ Budget >€500/month for infrastructure
- ✅ Expect >100K monthly users

**Don't use AWS if:**
- ❌ Small team without DevOps
- ❌ Budget <€100/month
- ❌ Want simple deployment
- ❌ Don't need enterprise features

### AWS Architecture for DEMA Group (If Chosen)

```
┌─────────────────────────────────────────────────────────────┐
│                      Route 53 (DNS)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CloudFront (CDN)                           │
│              Global edge distribution                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      S3 Bucket          │     │   Application Load      │
│   (Static assets)       │     │      Balancer           │
│   - Images              │     └─────────────────────────┘
│   - PDFs                │                   │
│   - JS/CSS              │     ┌─────────────┴─────────────┐
└─────────────────────────┘     ▼                           ▼
                        ┌─────────────┐             ┌─────────────┐
                        │    ECS      │             │    ECS      │
                        │ (Frontend)  │             │   (API)     │
                        │  Fargate    │             │  Fargate    │
                        └─────────────┘             └─────────────┘
                                                          │
                              ┌────────────────────────────┤
                              ▼                            ▼
                    ┌─────────────────┐          ┌─────────────────┐
                    │      RDS        │          │  ElastiCache    │
                    │  (PostgreSQL)   │          │    (Redis)      │
                    └─────────────────┘          └─────────────────┘
```

### AWS Cost Estimate for DEMA Group

#### Minimal Setup (Development)

| Service | Spec | Monthly |
|---------|------|---------|
| EC2 | t3.micro (free tier) | €0 |
| RDS | db.t3.micro | €15 |
| S3 | 10GB | €0.25 |
| CloudFront | 50GB | €4 |
| Route 53 | 1 zone | €0.50 |
| **Total** | | **~€20/month** |

#### Production Setup

| Service | Spec | Monthly |
|---------|------|---------|
| ECS Fargate | 2 tasks, 0.5vCPU, 1GB | €30 |
| RDS | db.t3.small, Multi-AZ | €50 |
| S3 | 100GB + requests | €5 |
| CloudFront | 500GB | €40 |
| ElastiCache | cache.t3.micro | €15 |
| Route 53 | 1 zone | €0.50 |
| ALB | 1 load balancer | €20 |
| **Total** | | **~€160/month** |

#### Scale Setup

| Service | Spec | Monthly |
|---------|------|---------|
| ECS Fargate | 4 tasks, 1vCPU, 2GB | €120 |
| RDS | db.r5.large, Multi-AZ | €300 |
| S3 | 500GB + requests | €20 |
| CloudFront | 2TB | €150 |
| ElastiCache | cache.r5.large | €150 |
| OpenSearch | 2 nodes | €200 |
| Route 53 | 2 zones | €1 |
| ALB | 1 load balancer | €20 |
| **Total** | | **~€960/month** |

### AWS Free Tier (12 months)

| Service | Free Amount |
|---------|-------------|
| EC2 | 750 hours t2.micro |
| RDS | 750 hours db.t2.micro |
| S3 | 5GB storage |
| CloudFront | 50GB transfer |
| Lambda | 1M requests |
| SES | 62,000 emails |

### Recommendation for DEMA Group

| Phase | Recommendation | Why |
|-------|---------------|-----|
| **Phase 1-2** | **Don't use AWS** | Overkill, complex, expensive |
| **Phase 3** | Consider AWS S3 + CloudFront | For assets only |
| **Phase 4** | Evaluate full AWS | If enterprise requirements |

### Hybrid Approach (Best of Both)

```
Vercel (Frontend)     ← Simple, fast deploys
       │
       ├── AWS S3 (Assets)      ← Cheap storage
       │
       ├── AWS CloudFront (CDN) ← Global delivery
       │
       └── Supabase (Database)  ← Simple, managed
```

**Cost:** ~€50-80/month
**Complexity:** Low
**Scalability:** High

---

## Final Hosting Recommendation

### For DEMA Group Specifically

| Criteria | Winner | Notes |
|----------|--------|-------|
| **Simplicity** | Vercel + Supabase | Best DX |
| **Cost (small)** | Vercel free | €0 |
| **Cost (medium)** | Hetzner | €20-50 |
| **Cost (large)** | AWS or Hetzner | Depends on needs |
| **Belgium proximity** | Hetzner (Germany) | Lowest latency |
| **Enterprise** | AWS | Compliance, SLA |

### Decision Tree

```
Do you need enterprise compliance (ISO, SOC2)?
├── Yes → AWS
└── No
    ├── Budget >€200/month?
    │   ├── Yes → AWS or dedicated Hetzner
    │   └── No
    │       ├── Need full control?
    │       │   ├── Yes → Hetzner VPS
    │       │   └── No → Vercel + Supabase
    └── Traffic >100K/month?
        ├── Yes → Consider AWS or Hetzner
        └── No → Vercel free/pro is fine
```

---

## Summary

| Question | Answer |
|----------|--------|
| **Max GitHub repo size?** | 5GB soft, 10GB hard limit |
| **Max single file?** | 100MB |
| **Should we use AWS?** | Not now - overkill for current phase |
| **When to use AWS?** | Enterprise requirements or >€500/mo budget |
| **Best for DEMA now?** | Vercel + Supabase (simple, cheap) |
| **Best for DEMA scale?** | Vercel + Hetzner backend or AWS |
| **Current risk?** | Duplicate files (800MB waste) |
| **Immediate action?** | Remove apps/dema duplicate, consider LFS for assets |

---

*Document Version: 1.1*
*Last Updated: December 2024*
