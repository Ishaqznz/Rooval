'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { Textarea } from "@/components/reusable/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { doctorServiceApi } from "@/services/doctorApiService";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

export default function GeneralInfo() {
  const { user, setApi } = useAuth();

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB.');
      return;
    }

    setProfileImage(file);
    setIsUploadingPhoto(true);

    try {
      const result = await doctorServiceApi.uplaodProfilePhoto({
        input: {
          file
        }
      })

      if (result?.data?.uploadDoctorProfilePhoto) {
        toast.success('Profile photo updated!');
        setApi((prev) => prev + 1);
      } else {
        toast.error('Photo upload failed. Please try again.');
        setProfileImage(null);
      }
    } catch {
      toast.error('Something went wrong!');
      setProfileImage(null);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const profilePreview = profileImage
    ? URL.createObjectURL(profileImage)
    : user?.profilePhoto ?? null;

  const placeholderLetter = user?.fullName?.[0]?.toUpperCase() ?? "?";

  const handleSave = async () => {
    const result = await doctorServiceApi.updateDoctorProfile({
      input: {
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        registrationNumber: formData.registrationNumber,
        bio: formData.bio,
      },
    });

    if (result?.data?.doctorProfileUpdate) {
      toast.success('Successfully saved the changes!');
      setApi((prev) => prev + 1);
      return;
    }

    toast.error('Something went wrong!');
  };

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
          {/* Profile Photo */}
          <div className="flex gap-6 items-start">
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              {/* Avatar */}
              <div className="relative w-32 h-32">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Doctor"
                    className="w-full h-full object-cover rounded-full border-2 border-border"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-4xl font-bold text-primary-foreground border-2 border-border">
                    {placeholderLetter}
                  </div>
                )}

                {/* Uploading spinner overlay */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Always-visible upload button */}
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Camera className="h-4 w-4" />
                {isUploadingPhoto ? 'Uploading...' : 'Change photo'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-semibold text-foreground mb-2">Profile Photo</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Recommended size: 500×500 pixels. JPG or PNG, max 5MB.
              </p>
              <p className="text-sm text-muted-foreground">
                Upload a professional photo of yourself. This photo will be displayed
                on your profile and used for identification purposes.
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
              value={formData.fullName}
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