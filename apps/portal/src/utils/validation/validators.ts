// VAT number validation
export function isValidVATNumber(vat: string): boolean {
  // Basic format validation for EU VAT numbers
  const vatRegex = {
    BE: /^BE[0-9]{10}$/,
    NL: /^NL[0-9]{9}B[0-9]{2}$/,
    FR: /^FR[A-Z0-9]{2}[0-9]{9}$/,
    DE: /^DE[0-9]{9}$/
  };

  const country = vat.substring(0, 2).toUpperCase();
  if (!vatRegex[country]) return false;
  
  return vatRegex[country].test(vat);
}

// IBAN validation
export function isValidIBAN(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // Basic format check
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}$/.test(cleanIBAN)) {
    return false;
  }

  // Move first 4 chars to end and convert letters to numbers
  const rearranged = cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);
  const converted = rearranged.split('').map(char => {
    if (/[0-9]/.test(char)) return char;
    return (char.charCodeAt(0) - 55).toString();
  }).join('');

  // Calculate checksum using mod-97
  let checksum = 0;
  for (let i = 0; i < converted.length; i++) {
    checksum = (checksum * 10 + parseInt(converted[i])) % 97;
  }

  return checksum === 1;
}

// Phone number validation
export function isValidPhoneNumber(phone: string, country: string): boolean {
  const phoneRegex = {
    BE: /^\+32[0-9]{9}$/,
    NL: /^\+31[0-9]{9}$/,
    FR: /^\+33[0-9]{9}$/,
    DE: /^\+49[0-9]{10,11}$/
  };

  return phoneRegex[country]?.test(phone) || false;
}

// Email domain validation
export function isValidEmailDomain(email: string, allowedDomains: string[]): boolean {
  const domain = email.split('@')[1].toLowerCase();
  return allowedDomains.includes(domain);
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Document validation
export function isValidDocument(
  fileType: string,
  fileSize: number,
  allowedTypes: string[],
  maxSize: number
): boolean {
  return allowedTypes.includes(fileType) && fileSize <= maxSize;
}

// Credit check validation
export interface CreditCheckResult {
  approved: boolean;
  limit: number;
  score: number;
  reasons: string[];
}

export function validateCreditWorthiness(
  data: {
    vatNumber: string;
    yearsFounded: number;
    annualRevenue: number;
    paymentHistory?: {
      onTimePayments: number;
      totalPayments: number;
    };
  }
): CreditCheckResult {
  const reasons: string[] = [];
  let score = 0;

  // Company age score (max 20 points)
  score += Math.min(data.yearsFounded * 2, 20);

  // Revenue score (max 30 points)
  const revenueScore = Math.log10(data.annualRevenue) * 10;
  score += Math.min(revenueScore, 30);

  // Payment history score (max 50 points)
  if (data.paymentHistory) {
    const paymentScore = (data.paymentHistory.onTimePayments / data.paymentHistory.totalPayments) * 50;
    score += paymentScore;
  } else {
    score += 25; // Default score for new customers
  }

  // Calculate credit limit based on score
  const baseLimit = 10000; // Base credit limit
  const limit = baseLimit * (score / 50); // Adjust based on score

  // Approval logic
  const approved = score >= 60;
  if (!approved) {
    if (score < 20) reasons.push('Company too new or unestablished');
    if (revenueScore < 15) reasons.push('Insufficient annual revenue');
    if (data.paymentHistory && (data.paymentHistory.onTimePayments / data.paymentHistory.totalPayments) < 0.8) {
      reasons.push('Poor payment history');
    }
  }

  return {
    approved,
    limit: Math.round(limit),
    score: Math.round(score),
    reasons
  };
}

// IP range validation
export function isIPInRange(ip: string, range: string): boolean {
  const [rangeIP, bits] = range.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  
  const ipParts = ip.split('.').map(part => parseInt(part));
  const rangeParts = rangeIP.split('.').map(part => parseInt(part));
  
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
  
  return (ipNum & mask) === (rangeNum & mask);
}
