import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/products?catalog=products-all');
}

