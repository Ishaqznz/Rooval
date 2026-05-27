'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/reusable/ui/select";
import { useAuth } from "@/context/AuthContext";
import { userServiceApi } from "@/services/userApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserPreferences() {
  const { user, setApi } = useAuth();

  const [preferences, setPreferences] = useState({
    preferredLanguage: "",
    preferredDoctorGender: "",
    defaultAppointmentType: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (user) {
      setPreferences({
        preferredLanguage: user.profile?.preferences?.preferredLanguage ?? "",
        preferredDoctorGender: user.profile?.preferences?.preferredDoctorGender ?? "",
        defaultAppointmentType: user.profile?.preferences?.defaultAppointmentType ?? "",
      });
    }
  }, [user]);

//   const handleSave = async () => {
//     const result = await userServiceApi.updateUserPreferences({
//       input: {
//         preferredLanguage: preferences.preferredLanguage,
//         preferredDoctorGender: preferences.preferredDoctorGender,
//         defaultAppointmentType: preferences.defaultAppointmentType,
//       },
//     });

//     if (result?.data?.userPreferencesUpdate) {
//       toast.success("Preferences updated successfully!");
//       setApi((prev) => prev + 1);
//       return;
//     }

//     toast.error("Something went wrong!");
//   };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Preferences</h1>

        <div className="space-y-8">
          {/* Preferred Language */}
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Preferred Language</Label>
            <Input
              id="preferredLanguage"
              name="preferredLanguage"
              placeholder="English, Spanish, etc."
              className="max-w-md"
              value={preferences.preferredLanguage}
              onChange={handleChange}
            />
          </div>

          {/* Preferred Doctor Gender */}
          <div className="space-y-2">
            <Label htmlFor="preferredDoctorGender">Preferred Doctor Gender</Label>
            <Select
              value={preferences.preferredDoctorGender}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, preferredDoctorGender: value }))
              }
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="defaultAppointmentType">Default Appointment Type</Label>
            <Select
              value={preferences.defaultAppointmentType}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, defaultAppointmentType: value }))
              }
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select Appointment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button>Save Preferences</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
