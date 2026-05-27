'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { Textarea } from "@/components/reusable/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { doctorServiceApi } from "@/services/doctorApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function GeneralInfo() {
  const { user } = useAuth()
  const { setApi } = useAuth()

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    registrationNumber: "",
    bio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName ?? "",
        phone: user.profile?.personal?.phone ?? "",
        registrationNumber: user.profile?.personal?.registrationNumber ?? "",
        bio: user.profile?.personal?.bio ?? "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    const result = await doctorServiceApi.updateDoctorProfile({ input: { fullName: formData.fullName, phoneNumber: formData.phone, registrationNumber: formData.registrationNumber, bio: formData.bio }})
    if (result?.data?.doctorProfileUpdate) {
      toast.success('Successfully saved the changes!')
      setApi((prev) => prev + 1)
      return;
    } 

    toast.error('Something went wrong!')
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">General Info</h1>
          <Button variant="link" className="text-primary">
            View Public Profile
          </Button>
        </div>

        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <img
                src={user?.profilePhoto}
                alt="Doctor"
                className="w-72 h-56 object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">Profile Photo</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Recommended size: 500×500 pixels
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a professional photo of yourself. This photo will be displayed on your profile and used for identification purposes.
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Dr. John Doe"
              className="max-w-md"
              value={formData?.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="max-w-md"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="registration">Registration Number</Label>
            <Input
              id="registration"
              name="registrationNumber"
              placeholder="MED-12345"
              className="max-w-md"
              value={formData.registrationNumber}
              onChange={handleChange}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell patients about yourself, your experience, and specialization..."
              className="max-w-2xl min-h-[150px]"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
