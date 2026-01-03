import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import { compliance } from './compliance-monitor';

interface Vendor {
  id: string;
  name: string;
  description: string;
  category: 'software' | 'hardware' | 'service' | 'consulting' | 'infrastructure';
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  dataAccess: {
    personalData: boolean;
    sensitiveData: boolean;
    financialData: boolean;
    intellectualProperty: boolean;
  };
  compliance: {
    soc2?: {
      status: 'verified' | 'pending' | 'expired' | 'notApplicable';
      expiryDate?: string;
      reportUrl?: string;
    };
    iso27001?: {
      status: 'verified' | 'pending' | 'expired' | 'notApplicable';
      expiryDate?: string;
      certificateUrl?: string;
    };
    gdpr?: {
      status: 'compliant' | 'pending' | 'nonCompliant' | 'notApplicable';
      dpa?: {
        signed: boolean;
        date?: string;
        url?: string;
      };
    };
    hipaa?: {
      status: 'compliant' | 'pending' | 'nonCompliant' | 'notApplicable';
      baa?: {
        signed: boolean;
        date?: string;
        url?: string;
      };
    };
  };
  contracts: Array<{
    id: string;
    type: 'service' | 'license' | 'support' | 'consulting';
    startDate: string;
    endDate: string;
    value: number;
    currency: string;
    renewalType: 'automatic' | 'manual' | 'none';
    documents: Array<{
      type: string;
      url: string;
      uploadDate: string;
    }>;
  }>;
  contacts: Array<{
    name: string;
    role: string;
    email: string;
    phone?: string;
    primary: boolean;
  }>;
  reviews: Array<{
    id: string;
    date: string;
    type: 'security' | 'performance' | 'financial' | 'compliance';
    reviewer: string;
    score: number;
    findings: string[];
    recommendations?: string[];
  }>;
  incidents: Array<{
    id: string;
    date: string;
    type: 'security' | 'performance' | 'compliance' | 'other';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    resolution?: string;
    closedDate?: string;
  }>;
  metadata: Record<string, unknown>;
}

interface VendorAssessment {
  id: string;
  vendorId: string;
  type: 'initial' | 'annual' | 'adhoc';
  date: string;
  assessor: string;
  questionnaire: Array<{
    category: string;
    questions: Array<{
      id: string;
      question: string;
      response?: string;
      evidence?: string[];
      risk?: 'critical' | 'high' | 'medium' | 'low';
      notes?: string;
    }>;
  }>;
  findings: Array<{
    id: string;
    category: string;
    description: string;
    risk: 'critical' | 'high' | 'medium' | 'low';
    remediation?: string;
    dueDate?: string;
    status: 'open' | 'inProgress' | 'closed' | 'accepted';
  }>;
  score: number;
  decision: 'approved' | 'conditionallyApproved' | 'rejected' | 'pending';
  nextReviewDate?: string;
  metadata: Record<string, unknown>;
}

export class VendorManager {
  private static instance: VendorManager;
  private readonly configPath: string;
  private readonly assessmentsPath: string;
  private readonly evidencePath: string;
  private vendors: Map<string, Vendor>;
  private assessments: Map<string, VendorAssessment[]>;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'vendors');
    this.assessmentsPath = join(rootPath, 'assessments', 'vendors');
    this.evidencePath = join(rootPath, 'evidence', 'vendors');
    this.vendors = new Map();
    this.assessments = new Map();
    this.initialize();
  }

  public static getInstance(): VendorManager {
    if (!VendorManager.instance) {
      VendorManager.instance = new VendorManager();
    }
    return VendorManager.instance;
  }

  private initialize(): void {
    // Create required directories
    [this.configPath, this.assessmentsPath, this.evidencePath].forEach(dir => {
      try {
        writeFileSync(join(dir, '.gitkeep'), '');
      } catch {
        // Directory already exists
      }
    });

    // Load vendors and assessments
    this.loadVendors();
    this.loadAssessments();

    // Start compliance monitoring
    this.startComplianceMonitoring();
  }

  private loadVendors(): void {
    try {
      const files = readFileSync(join(this.configPath, 'vendors.json'), 'utf8');
      const vendors = JSON.parse(files);
      for (const vendor of vendors) {
        this.vendors.set(vendor.id, vendor);
      }
      logger.info(`Loaded ${this.vendors.size} vendors`);
    } catch (error) {
      logger.error('Failed to load vendors', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  private loadAssessments(): void {
    try {
      const files = readFileSync(join(this.assessmentsPath, 'assessments.json'), 'utf8');
      const assessments = JSON.parse(files);
      for (const [vendorId, vendorAssessments] of Object.entries(assessments)) {
        this.assessments.set(vendorId, vendorAssessments as VendorAssessment[]);
      }
      logger.info(`Loaded assessments for ${this.assessments.size} vendors`);
    } catch (error) {
      logger.error('Failed to load vendor assessments', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  public async addVendor(vendor: Omit<Vendor, 'id'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendor,
      id: `vendor-${Date.now()}`
    };

    // Validate vendor
    this.validateVendor(newVendor);

    // Store vendor
    this.vendors.set(newVendor.id, newVendor);
    await this.saveVendors();

    // Create initial assessment if needed
    if (newVendor.riskLevel === 'critical' || newVendor.riskLevel === 'high') {
      await this.createAssessment({
        vendorId: newVendor.id,
        type: 'initial',
        date: new Date().toISOString(),
        assessor: 'system',
        questionnaire: [],
        findings: [],
        score: 0,
        decision: 'pending',
        metadata: {}
      });
    }

    // Update compliance evidence
    await this.updateComplianceEvidence(newVendor);

    logger.info('Added new vendor', {
      metadata: {
        vendorId: newVendor.id,
        name: newVendor.name,
        riskLevel: newVendor.riskLevel
      }
    });

    return newVendor;
  }

  public async updateVendor(
    id: string,
    updates: Partial<Omit<Vendor, 'id'>>
  ): Promise<Vendor> {
    const vendor = this.vendors.get(id);
    if (!vendor) {
      throw new Error(`Vendor not found: ${id}`);
    }

    const updatedVendor: Vendor = {
      ...vendor,
      ...updates
    };

    // Validate updated vendor
    this.validateVendor(updatedVendor);

    // Store updated vendor
    this.vendors.set(id, updatedVendor);
    await this.saveVendors();

    // Check if risk level increased
    if (
      updates.riskLevel &&
      this.getRiskScore(updates.riskLevel) > this.getRiskScore(vendor.riskLevel)
    ) {
      await this.createAssessment({
        vendorId: id,
        type: 'adhoc',
        date: new Date().toISOString(),
        assessor: 'system',
        questionnaire: [],
        findings: [{
          id: `finding-${Date.now()}`,
          category: 'risk',
          description: `Risk level increased from ${vendor.riskLevel} to ${updates.riskLevel}`,
          risk: updates.riskLevel,
          status: 'open'
        }],
        score: 0,
        decision: 'pending',
        metadata: {}
      });
    }

    // Update compliance evidence
    await this.updateComplianceEvidence(updatedVendor);

    logger.info('Updated vendor', {
      metadata: {
        vendorId: id,
        name: updatedVendor.name,
        changes: Object.keys(updates)
      }
    });

    return updatedVendor;
  }

  public async createAssessment(
    assessment: Omit<VendorAssessment, 'id'>
  ): Promise<VendorAssessment> {
    const vendor = this.vendors.get(assessment.vendorId);
    if (!vendor) {
      throw new Error(`Vendor not found: ${assessment.vendorId}`);
    }

    const newAssessment: VendorAssessment = {
      ...assessment,
      id: `assessment-${Date.now()}`
    };

    // Store assessment
    const vendorAssessments = this.assessments.get(assessment.vendorId) || [];
    vendorAssessments.push(newAssessment);
    this.assessments.set(assessment.vendorId, vendorAssessments);
    await this.saveAssessments();

    // Update compliance evidence
    await this.updateComplianceEvidence(vendor, newAssessment);

    logger.info('Created vendor assessment', {
      metadata: {
        vendorId: assessment.vendorId,
        assessmentId: newAssessment.id,
        type: assessment.type
      }
    });

    return newAssessment;
  }

  public async updateAssessment(
    vendorId: string,
    assessmentId: string,
    updates: Partial<Omit<VendorAssessment, 'id' | 'vendorId'>>
  ): Promise<VendorAssessment> {
    const assessments = this.assessments.get(vendorId);
    if (!assessments) {
      throw new Error(`No assessments found for vendor: ${vendorId}`);
    }

    const index = assessments.findIndex(a => a.id === assessmentId);
    if (index === -1) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    const updatedAssessment: VendorAssessment = {
      ...assessments[index],
      ...updates
    };

    // Update assessment
    assessments[index] = updatedAssessment;
    await this.saveAssessments();

    // Update vendor risk level if needed
    if (updates.decision === 'rejected') {
      await this.updateVendor(vendorId, { riskLevel: 'high' });
    }

    // Update compliance evidence
    const vendor = this.vendors.get(vendorId);
    if (vendor) {
      await this.updateComplianceEvidence(vendor, updatedAssessment);
    }

    logger.info('Updated vendor assessment', {
      metadata: {
        vendorId,
        assessmentId,
        changes: Object.keys(updates)
      }
    });

    return updatedAssessment;
  }

  public async getVendorRiskReport(vendorId: string): Promise<{
    vendor: Vendor;
    riskScore: number;
    assessments: VendorAssessment[];
    findings: Array<{
      id: string;
      date: string;
      type: string;
      risk: string;
      status: string;
      description: string;
    }>;
    recommendations: string[];
  }> {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor not found: ${vendorId}`);
    }

    const assessments = this.assessments.get(vendorId) || [];
    const findings: Array<{
      id: string;
      date: string;
      type: string;
      risk: string;
      status: string;
      description: string;
    }> = [];

    // Collect findings from assessments
    for (const assessment of assessments) {
      for (const finding of assessment.findings) {
        findings.push({
          id: finding.id,
          date: assessment.date,
          type: 'assessment',
          risk: finding.risk,
          status: finding.status,
          description: finding.description
        });
      }
    }

    // Add incidents as findings
    for (const incident of vendor.incidents) {
      findings.push({
        id: incident.id,
        date: incident.date,
        type: 'incident',
        risk: incident.severity,
        status: incident.closedDate ? 'closed' : 'open',
        description: incident.description
      });
    }

    // Calculate risk score
    const riskScore = this.calculateVendorRiskScore(vendor, assessments, findings);

    // Generate recommendations
    const recommendations = this.generateRecommendations(vendor, assessments, findings);

    return {
      vendor,
      riskScore,
      assessments,
      findings,
      recommendations
    };
  }

  private validateVendor(vendor: Vendor): void {
    if (!vendor.name) throw new Error('Vendor name is required');
    if (!vendor.category) throw new Error('Vendor category is required');
    if (!vendor.riskLevel) throw new Error('Vendor risk level is required');
    if (!vendor.dataAccess) throw new Error('Vendor data access information is required');
  }

  private getRiskScore(level: 'critical' | 'high' | 'medium' | 'low'): number {
    switch (level) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
    }
  }

  private calculateVendorRiskScore(
    vendor: Vendor,
    assessments: VendorAssessment[],
    findings: Array<{ risk: string; status: string }>
  ): number {
    let score = 0;

    // Base risk level
    score += this.getRiskScore(vendor.riskLevel) * 25;

    // Data access risk
    const dataAccessCount = Object.values(vendor.dataAccess).filter(v => v).length;
    score += dataAccessCount * 10;

    // Assessment scores
    if (assessments.length > 0) {
      const avgAssessmentScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;
      score += (100 - avgAssessmentScore) * 0.25;
    }

    // Open findings
    const openFindings = findings.filter(f => f.status === 'open');
    const criticalFindings = openFindings.filter(f => f.risk === 'critical').length;
    const highFindings = openFindings.filter(f => f.risk === 'high').length;

    score += criticalFindings * 20 + highFindings * 10;

    // Cap at 100
    return Math.min(Math.round(score), 100);
  }

  private generateRecommendations(
    vendor: Vendor,
    assessments: VendorAssessment[],
    findings: Array<{ risk: string; status: string }>
  ): string[] {
    const recommendations: string[] = [];

    // Check compliance status
    if (vendor.dataAccess.personalData && (!vendor.compliance.gdpr || vendor.compliance.gdpr.status !== 'compliant')) {
      recommendations.push('Obtain GDPR compliance verification');
    }

    if (vendor.riskLevel === 'critical' && (!vendor.compliance.soc2 || vendor.compliance.soc2.status !== 'verified')) {
      recommendations.push('Obtain SOC 2 report');
    }

    // Check assessment frequency
    const lastAssessment = assessments[assessments.length - 1];
    if (lastAssessment) {
      const daysSinceLastAssessment = Math.floor(
        (Date.now() - new Date(lastAssessment.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (vendor.riskLevel === 'critical' && daysSinceLastAssessment > 180) {
        recommendations.push('Conduct new vendor assessment (overdue)');
      } else if (vendor.riskLevel === 'high' && daysSinceLastAssessment > 365) {
        recommendations.push('Schedule annual vendor assessment');
      }
    }

    // Check open findings
    const openFindings = findings.filter(f => f.status === 'open');
    if (openFindings.length > 0) {
      recommendations.push(`Address ${openFindings.length} open security/compliance findings`);
    }

    return recommendations;
  }

  private async saveVendors(): Promise<void> {
    const vendorsPath = join(this.configPath, 'vendors.json');
    await retry.retry(async () => {
      writeFileSync(
        vendorsPath,
        JSON.stringify(Array.from(this.vendors.values()), null, 2)
      );
    });
  }

  private async saveAssessments(): Promise<void> {
    const assessmentsPath = join(this.assessmentsPath, 'assessments.json');
    await retry.retry(async () => {
      writeFileSync(
        assessmentsPath,
        JSON.stringify(Object.fromEntries(this.assessments), null, 2)
      );
    });
  }

  private async updateComplianceEvidence(
    vendor: Vendor,
    assessment?: VendorAssessment
  ): Promise<void> {
    await compliance.collectEvidence(
      'SEC-VEN-001',
      'log',
      Buffer.from(JSON.stringify({
        type: assessment ? 'assessment' : 'vendor',
        timestamp: new Date().toISOString(),
        vendor: {
          id: vendor.id,
          name: vendor.name,
          riskLevel: vendor.riskLevel,
          compliance: vendor.compliance
        },
        assessment
      }, null, 2))
    );
  }

  private startComplianceMonitoring(): void {
    // Check for expired certifications daily
    setInterval(() => {
      for (const vendor of this.vendors.values()) {
        this.checkCertificationExpiry(vendor);
      }
    }, 24 * 60 * 60 * 1000);

    // Check for overdue assessments weekly
    setInterval(() => {
      for (const vendor of this.vendors.values()) {
        this.checkAssessmentDue(vendor);
      }
    }, 7 * 24 * 60 * 60 * 1000);
  }

  private async checkCertificationExpiry(vendor: Vendor): Promise<void> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Check SOC 2
    if (
      vendor.compliance.soc2?.status === 'verified' &&
      vendor.compliance.soc2.expiryDate &&
      new Date(vendor.compliance.soc2.expiryDate) <= thirtyDaysFromNow
    ) {
      logger.warn('SOC 2 certification expiring soon', {
        metadata: {
          vendorId: vendor.id,
          name: vendor.name,
          expiryDate: vendor.compliance.soc2.expiryDate
        }
      });
    }

    // Check ISO 27001
    if (
      vendor.compliance.iso27001?.status === 'verified' &&
      vendor.compliance.iso27001.expiryDate &&
      new Date(vendor.compliance.iso27001.expiryDate) <= thirtyDaysFromNow
    ) {
      logger.warn('ISO 27001 certification expiring soon', {
        metadata: {
          vendorId: vendor.id,
          name: vendor.name,
          expiryDate: vendor.compliance.iso27001.expiryDate
        }
      });
    }
  }

  private async checkAssessmentDue(vendor: Vendor): Promise<void> {
    const assessments = this.assessments.get(vendor.id) || [];
    const lastAssessment = assessments[assessments.length - 1];

    if (lastAssessment?.nextReviewDate) {
      const reviewDate = new Date(lastAssessment.nextReviewDate);
      const now = new Date();

      if (reviewDate <= now) {
        logger.warn('Vendor assessment overdue', {
          metadata: {
            vendorId: vendor.id,
            name: vendor.name,
            lastAssessment: lastAssessment.date,
            reviewDate: lastAssessment.nextReviewDate
          }
        });
      }
    }
  }
}

export const vendors = VendorManager.getInstance();
