import { cookies } from 'next/headers';

export async function auth() {
  const cookieStore = await cookies();

  return {
    token: cookieStore.get('token')?.value || null,
    userName: cookieStore.get('userName')?.value || null,
    email: cookieStore.get('email')?.value || null,
    phone: cookieStore.get('phone')?.value || null,
    role: cookieStore.get('role')?.value || null,
  };
  
}