'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userServiceApi } from '@/services/userApiService';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await userServiceApi.findOne({ fields: `
            fullName
            email
            isBlocked
            isAdmin
          `});

        if (response?.data?.findUser?.isAdmin) {
          console.log('the data in the admin: ', response)
          setIsAdmin(true);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        console.log('the error: ', err)
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) return null; 

  if (!isAdmin) return null; 

  return <>{children}</>;
}
