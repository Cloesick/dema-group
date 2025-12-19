import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Details | DEMA Shop',
  description: 'View detailed product specifications, variants, and technical data. Request a quote for industrial pumps, fittings, hoses, and professional equipment.',
  openGraph: {
    title: 'Product Details | DEMA Shop',
    description: 'Professional industrial equipment - pumps, fittings, hoses, and tools. View specifications and request quotes.',
    type: 'website',
    siteName: 'DEMA Shop',
  },
};

export default function ProductGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
