
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const token = await cookieStore.get('token');
  
  if (!token) {
    redirect('/auth/login');
  } else {
    redirect('/carrier-management');
  }
}
