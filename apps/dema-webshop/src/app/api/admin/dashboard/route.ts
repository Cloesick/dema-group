import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getAdminFirestore, COLLECTIONS } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Admin emails that can access the dashboard
const ADMIN_EMAILS = ['nicolas.cloet@gmail.com', 'info@demashop.be'];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (type) {
      case 'overview': {
        // Get counts and recent activity
        const [quotesSnap, contactsSnap] = await Promise.all([
          db.collection(COLLECTIONS.QUOTES).orderBy('createdAt', 'desc').limit(100).get(),
          db.collection(COLLECTIONS.CONTACTS).orderBy('createdAt', 'desc').limit(100).get(),
        ]);

        const quotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const contacts = contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const quotesToday = quotes.filter(q => {
          const date = q.createdAt?.toDate?.() || new Date(q.createdAt);
          return date >= today;
        }).length;

        const quotesThisWeek = quotes.filter(q => {
          const date = q.createdAt?.toDate?.() || new Date(q.createdAt);
          return date >= thisWeek;
        }).length;

        const quotesThisMonth = quotes.filter(q => {
          const date = q.createdAt?.toDate?.() || new Date(q.createdAt);
          return date >= thisMonth;
        }).length;

        const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

        const contactsToday = contacts.filter(c => {
          const date = c.createdAt?.toDate?.() || new Date(c.createdAt);
          return date >= today;
        }).length;

        const newContacts = contacts.filter(c => c.status === 'new').length;

        // Top requested products
        const productCounts: Record<string, { name: string; count: number; sku: string }> = {};
        quotes.forEach((q: any) => {
          q.items?.forEach((item: any) => {
            if (!productCounts[item.sku]) {
              productCounts[item.sku] = { name: item.name, count: 0, sku: item.sku };
            }
            productCounts[item.sku].count += item.quantity;
          });
        });
        const topProducts = Object.values(productCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return NextResponse.json({
          success: true,
          stats: {
            quotes: {
              total: quotes.length,
              today: quotesToday,
              thisWeek: quotesThisWeek,
              thisMonth: quotesThisMonth,
              pending: pendingQuotes,
            },
            contacts: {
              total: contacts.length,
              today: contactsToday,
              new: newContacts,
            },
            topProducts,
          },
          recentQuotes: quotes.slice(0, 5),
          recentContacts: contacts.slice(0, 5),
        });
      }

      case 'quotes': {
        const status = searchParams.get('status');
        let query = db.collection(COLLECTIONS.QUOTES).orderBy('createdAt', 'desc');
        
        if (status) {
          query = query.where('status', '==', status);
        }
        
        const snapshot = await query.limit(limit).get();
        const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({
          success: true,
          quotes,
          total: quotes.length,
        });
      }

      case 'contacts': {
        const status = searchParams.get('status');
        let query = db.collection(COLLECTIONS.CONTACTS).orderBy('createdAt', 'desc');
        
        if (status) {
          query = query.where('status', '==', status);
        }
        
        const snapshot = await query.limit(limit).get();
        const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({
          success: true,
          contacts,
          total: contacts.length,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// Update quote or contact status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { collection, id, updates } = body;

    if (!collection || !id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const collectionName = collection === 'quotes' ? COLLECTIONS.QUOTES : COLLECTIONS.CONTACTS;
    
    await db.collection(collectionName).doc(id).update({
      ...updates,
      updatedAt: new Date(),
      updatedBy: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}
