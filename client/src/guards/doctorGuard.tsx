'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doctorServiceApi } from '@/services/doctorApiService';

export default function DoctorGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isDoctor, setDoctor] = useState(false);

  useEffect(() => {
    const checkDoctor = async () => {
      try {
        const doctor = await doctorServiceApi.findOne({ fields: `
            fullName
            email
          `})
        if (doctor?.data?.findDoctor) {
          console.log('the data in the doctor side: ', doctor)
          setDoctor(true);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.log('the error: ', err)
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkDoctor();
  }, [router]);

  if (loading) return null; 

  if (!isDoctor) return null; 

  return <>{children}</>;
}
