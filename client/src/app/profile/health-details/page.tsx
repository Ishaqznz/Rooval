'use client';

import { Button } from "@/components/reusable/ui/button";
import { Label } from "@/components/reusable/ui/label";
import { Textarea } from "@/components/reusable/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { userServiceApi } from "@/services/userApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserHealthDetails() {
  const { user, setApi } = useAuth();

  const [healthData, setHealthData] = useState({
    allergies: "",
    currentMedications: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHealthData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await userServiceApi.findOne({ fields: `
          profile {
            health {
              allergies
              currentMedication
            }
          }
        `})

      setHealthData({
        allergies: (userInfo?.data?.findUser?.profile?.health?.allergies).toString() ?? '',
        currentMedications: (userInfo?.data?.findUser?.profile?.health?.currentMedication).toString() ?? ''
      })
    }

    fetchUserInfo();
  }, [user]);

  const handleSave = async () => {
    const allergies = healthData.allergies
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const medications = healthData.currentMedications
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const result = await userServiceApi.updateProfile({
      input: {
        allergies: allergies,
        currentMedication: medications,
      },
    });

    if (result?.data?.updateUserProfile) {
      toast.success("successflly updated!");
      setApi((prev) => prev + 1);
      return;
    }

    toast.error("Something went wrong!");
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Health Details
        </h1>

        <div className="space-y-8">
          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              placeholder="List any allergies you have..."
              className="max-w-2xl min-h-[120px]"
              value={healthData.allergies}
              onChange={handleChange}
            />
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              name="currentMedications"
              placeholder="List any medications you are currently taking..."
              className="max-w-2xl min-h-[120px]"
              value={healthData.currentMedications}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave}>
              Save Health Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
