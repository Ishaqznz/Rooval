'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { userServiceApi } from '@/services/userApiService';

export default function MessageGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const doctorId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [isEnabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!doctorId) {
        router.push('/profile/appointments');
        return;
      }

      try {
        const response = await userServiceApi.isChatEnabled({
          input: { doctorId },
        });

        if (response?.data?.isChatEnabled) {
          setEnabled(true);
        } else {
          router.push('/profile/appointments');
        }
      } catch (err) {
        router.push('/profile/appointments');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [doctorId, router]);

  if (loading) return null;
  if (!isEnabled) return null;

  return <>{children}</>;
}