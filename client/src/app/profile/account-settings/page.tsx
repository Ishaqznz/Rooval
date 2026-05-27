'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { useAuth } from "@/context/AuthContext";
import { userServiceApi } from "@/services/userApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user, setApi } = useAuth();

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

//   const handleSaveEmail = async () => {
//     const result = await userServiceApi.updateUserEmail({ input: { email } });

//     if (result?.data?.userEmailUpdate) {
//       toast.success("Email updated successfully!");
//       setApi((prev) => prev + 1);
//       return;
//     }

//     toast.error("Something went wrong!");
//   };

//   const handleExportData = async () => {
//     try {
//       const result = await userServiceApi.exportUserData();

//       if (result?.data?.exportData) {
//         // Download as JSON file
//         const dataStr = JSON.stringify(result.data.exportData, null, 2);
//         const blob = new Blob([dataStr], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "user_data.json";
//         a.click();
//         URL.revokeObjectURL(url);
//         toast.success("Data exported successfully!");
//         return;
//       }

//       toast.error("No data available to export!");
//     } catch (err) {
//       toast.error("Something went wrong while exporting data!");
//     }
//   };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* Change Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter new email"
              className="max-w-md"
            />
            <Button>Change Email</Button>
          </div>

          {/* Export All Data */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Export All Data</h3>
            <p className="text-sm text-muted-foreground">
              Download a copy of all your account data.
            </p>
            <Button>Export Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
