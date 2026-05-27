'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userServiceApi } from '@/services/userApiService';

export default function UserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await userServiceApi.findOne({
          fields: `
            id
            fullName
            email
          `
        });

        if (user?.data?.findUser) {
          setIsUser(true);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.log('User guard error:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div>Checking access...</div>;
  }

  if (!isUser) return null;

  return <>{children}</>;
}