import admin from 'firebase-admin';

let app: admin.app.App | undefined;

function getCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

export function getAdminApp() {
  if (app) return app;
  const creds = getCredentials();
  if (!admin.apps.length) {
    if (creds) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: creds.projectId,
          clientEmail: creds.clientEmail,
          privateKey: creds.privateKey as string,
        }),
      });
    } else {
      // Attempt default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS)
      app = admin.initializeApp();
    }
  } else {
    app = admin.app();
  }
  return app!;
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminFirestore() {
  return getAdminApp().firestore();
}

// Firestore Collections
export const COLLECTIONS = {
  QUOTES: 'quotes',
  CONTACTS: 'contacts',
  USERS: 'users',
  ANALYTICS: 'analytics',
} as const;

// Quote document interface
export interface QuoteDocument {
  id?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    vatNumber?: string;
    address?: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    category?: string;
    brand?: string;
    imageUrl?: string;
    properties?: Record<string, any>;
    notes?: string;
  }>;
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'rejected';
  totalItems: number;
  createdAt: admin.firestore.Timestamp | Date;
  updatedAt: admin.firestore.Timestamp | Date;
  notes?: string;
  assignedTo?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    source?: string;
  };
}

// Contact document interface
export interface ContactDocument {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  inquiryType?: string;
  message: string;
  budget?: string;
  timeline?: string;
  heardAbout?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: admin.firestore.Timestamp | Date;
  metadata?: {
    ip?: string;
    userAgent?: string;
  };
}

// User activity document interface
export interface UserActivityDocument {
  id?: string;
  sessionId: string;
  userId?: string;
  email?: string;
  events: Array<{
    type: 'page_view' | 'product_view' | 'add_to_quote' | 'quote_submit' | 'search';
    timestamp: Date;
    data?: Record<string, any>;
  }>;
  createdAt: admin.firestore.Timestamp | Date;
  lastActivity: admin.firestore.Timestamp | Date;
}
