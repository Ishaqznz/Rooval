'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  accountSecuritySchema,
  type AccountSecurityFormData,
} from "@/lib/accountSecurity.schema";
import { doctorServiceApi } from "@/services/doctorApiService";
import { toast } from "sonner";

export default function AccountSecurity() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountSecurityFormData>({
    resolver: zodResolver(accountSecuritySchema),
  });

  const onSubmit = async (data: AccountSecurityFormData) => {
    const changePassword = await doctorServiceApi.changePassword({ input: { oldPassword: data.currentPassword, newPassword: data.newPassword } });
    if (changePassword?.data?.doctorChangePassword) {
      toast.success('Successfully changed the password!')
      return;
    }
    toast.error(changePassword?.errors?.[0]?.message || 'Something went wrong!')
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Account & Security
          </h1>
          <p className="text-muted-foreground">
            Manage your login credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Change Password */}
          <div className="space-y-4 pb-8 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              Change Password
            </h3>

            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="Enter your current password"
                className="max-w-md"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter your new password"
                className="max-w-md"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                className="max-w-md"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Save Changes */}
          <div className="pt-4 border-t border-border">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
