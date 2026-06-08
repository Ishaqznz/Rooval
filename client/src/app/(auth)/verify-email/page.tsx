'use client';
import { FullPageSpinner } from "@/components/reusable/ui/spinner";
import { Suspense, useEffect } from "react";
import { authServiceApi } from "@/services/authApiService";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const VerifyEmailInner = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const verifyEmail = async (token: string) => {
        try {
            console.log('the token:', token);

            const userData = JSON.parse(localStorage.getItem('req') as string);
            console.log('the user data:', userData);

            if (userData) {
                const response = await authServiceApi.verifyResetToken({
                    input: { token }
                });

                if (response?.errors || response?.data?.verifyResetToken?.success === false) {
                    router.push('/verification-failed');
                    return;
                }

                toast.success('Verification success!');
                router.push('/reset-password');
                return;
            }

            const response = await authServiceApi.verifyEmail({
                input: { token }
            });
            if (response?.errors) {
                router.push('/verification-failed');
                return;
            }

            router.push('/email-verified');
            localStorage.removeItem('userData');

        } catch (error: any) {
            router.push('/verification-failed');
            toast.error(error?.message || 'Something went wrong. Please try again.');
        }
    };

    useEffect(() => {
        const token = searchParams.get('token') || '';
        verifyEmail(token);
    }, []);

    return <FullPageSpinner />;
};

const VerifyEmail = () => {
    return (
        <Suspense fallback={<FullPageSpinner />}>
            <VerifyEmailInner />
        </Suspense>
    );
};

export default VerifyEmail;