import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';

export default async function HomePage() {
  const isAdmin = await validateSession();
  if (isAdmin) redirect('/admin');
  redirect('/admin/login');
}
