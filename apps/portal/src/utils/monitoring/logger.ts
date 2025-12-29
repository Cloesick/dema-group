import pino from 'pino';
import { NextRequest } from 'next/server';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

interface LogContext {
  userId?: string;
  companyId?: string;
  action: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  duration?: number;
  statusCode?: number;
}

interface SecurityEvent {
  type: 'auth' | 'access' | 'data' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

export class AuditLogger {
  static async logAccess(req: NextRequest, context: Partial<LogContext>) {
    const startTime = Date.now();
    
    const logEntry = {
      ...context,
      ip: req.ip || req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
      method: req.method,
      path: req.nextUrl.pathname,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };

    logger.info(logEntry, 'Access Log');
  }

  static async logSecurity(event: SecurityEvent) {
    logger.warn({
      ...event,
      timestamp: new Date().toISOString()
    }, 'Security Event');

    // For high/critical events, trigger alerts
    if (['high', 'critical'].includes(event.severity)) {
      await this.triggerSecurityAlert(event);
    }
  }

  static async logError(error: Error, context: Partial<LogContext>) {
    logger.error({
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      timestamp: new Date().toISOString()
    }, 'Error Log');
  }

  static async logBusinessEvent(
    event: {
      type: string;
      details: Record<string, any>;
      userId: string;
      companyId?: string;
    }
  ) {
    logger.info({
      ...event,
      timestamp: new Date().toISOString()
    }, 'Business Event');
  }

  private static async triggerSecurityAlert(event: SecurityEvent) {
    // Implement alert notification (email, Slack, etc.)
    console.error('SECURITY ALERT:', event);
  }
}

// Middleware to track user actions
export async function auditMiddleware(
  req: NextRequest,
  handler: () => Promise<Response>
) {
  const startTime = Date.now();
  
  try {
    const response = await handler();
    
    await AuditLogger.logAccess(req, {
      statusCode: response.status,
      duration: Date.now() - startTime
    });

    return response;
  } catch (error) {
    await AuditLogger.logError(error as Error, {
      path: req.nextUrl.pathname,
      method: req.method,
      duration: Date.now() - startTime
    });
    throw error;
  }
}
