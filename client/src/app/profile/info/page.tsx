'use client';

import { Gender } from "@/common/enums";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { Textarea } from "@/components/reusable/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { userServiceApi } from "@/services/userApiService";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

export default function UserGeneralInfo() {
    const { user, setApi } = useAuth();
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
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
            const result = await userServiceApi.updateProfilePhoto({
                profilePhoto: file,
            });

            if (result?.data?.updateUserProfilePhoto) {
                toast.success('Profile photo updated!');
                setApi((prev) => prev + 1);
            } else {
                toast.error('Photo upload failed. Please try again.');
                setProfileImage(null); // revert preview on failure
            }
        } catch {
            toast.error('Something went wrong!');
            setProfileImage(null);
        } finally {
            setIsUploadingPhoto(false);
            // Reset input so same file can be re-selected if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const profilePreview = profileImage
        ? URL.createObjectURL(profileImage)
        : user?.profilePhoto ?? null;

    const placeholderLetter = user?.fullName?.[0]?.toUpperCase() ?? "?";

    const [formData, setFormData] = useState({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        phone: "",
        email: "",
        profilePhoto: ''
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userInfo = await userServiceApi.findOne({
                fields: `
                    fullName
                    email
                    profile {
                        personal {
                            profilePhoto
                            gender
                            address
                            phoneNumber
                        }
                    }
                `
            });

            setFormData({
                fullName: userInfo?.data?.findUser?.fullName ?? "",
                dateOfBirth: userInfo?.data?.findUser?.profile?.personal?.dateOfBirth ?? "",
                gender: userInfo?.data?.findUser?.profile?.personal?.gender ?? "",
                address: userInfo?.data?.findUser?.profile?.personal?.address ?? "",
                phone: userInfo?.data?.findUser?.profile?.personal?.phoneNumber ?? "",
                email: userInfo?.data?.findUser?.email ?? "",
                profilePhoto: userInfo?.data?.findUser?.profile?.personal?.profilePhoto ?? ''
            });
        };

        fetchUserInfo();
    }, [user]);

    const handleSave = async () => {
        const result = await userServiceApi.updateProfile({
            input: {
                fullName: formData.fullName,
                gender: (formData.gender).toUpperCase() as Gender || undefined,
                address: formData.address,
                phoneNumber: formData.phone,
            },
        });

        if (result?.errors?.[0]) {
            if (result?.errors?.[0]?.code !== 'BAD_USER_INPUT') {
                result?.errors?.[0]?.message;
                return;
            }
            toast.error("Something went wrong!");
            return;
        }

        if (result?.data?.updateUserProfile) {
            toast.success('Successfully updated!');
            setApi((prev) => prev + 1);
            return;
        }

        toast.error("Something went wrong!");
    };

    return (
        <div className="flex-1 p-8">
            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Profile Information</h1>
                </div>

                <div className="space-y-8">
                    {/* Profile Photo */}
                    <div className="flex gap-6 items-start">
                        <div className="flex flex-col items-center gap-3">
                            {/* Avatar */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                {profilePreview || formData.profilePhoto ? (
                                    <img
                                        src={profilePreview || formData.profilePhoto}
                                        alt="Profile"
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
                            <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload a professional photo. JPG or PNG, max 5MB.
                                This photo will be visible on your public profile.
                            </p>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            className="max-w-md"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                            id="gender"
                            name="gender"
                            className="max-w-md w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            name="address"
                            placeholder="Your full address"
                            className="max-w-2xl min-h-[120px]"
                            value={formData.address}
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
                            placeholder="+91 XXXXX XXXXX"
                            className="max-w-md"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            disabled
                            className="max-w-md bg-muted"
                            value={formData.email}
                        />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button onClick={handleSave}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}