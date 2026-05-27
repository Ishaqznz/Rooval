'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/reusable/ui/select";
import { useAuth } from "@/context/AuthContext";
import { doctorServiceApi } from "@/services/doctorApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { countries } from "@/constants/countries";

export default function ClinicLocation() {
  const { user, setApi } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
    phoneNumber: "",
    workingDays: "",
  });

  useEffect(() => {
    if (user?.profile?.clinic) {
      setFormData({
        name: user.profile.clinic.name ?? "",
        address: user.profile.clinic.address ?? "",
        country: user.profile.clinic.country ?? "",
        phoneNumber: user.profile.clinic.phoneNumber ?? "",
        workingDays: user.profile.clinic.workingDays ?? "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const result = await doctorServiceApi.updateDoctorProfile({
      input: {
        clinic: {
          name: formData.name,
          address: formData.address,
          country: formData.country,
          phoneNumber: formData.phoneNumber,
          workingDays: formData.workingDays,
        }
      }
    });

    if (result?.data?.doctorProfileUpdate) {
      toast.success("Clinic details saved successfully!");
      setApi(prev => prev + 1);
      return;
    }

    toast.error("Something went wrong!");
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Manage Your Clinic Locations</h1>
        <p className="text-muted-foreground mb-8">
          Add your in-person consultation address so patients can reach you.
        </p>

        <div className="space-y-8">

          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              name="name"
              className="max-w-md"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              name="address"
              className="max-w-2xl"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, country: value }))
              }
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phoneNumber"
              className="max-w-md"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingDays">Working Days</Label>
            <Input
              id="workingDays"
              name="workingDays"
              className="max-w-md"
              value={formData.workingDays}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave}>
              Add Clinic
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
