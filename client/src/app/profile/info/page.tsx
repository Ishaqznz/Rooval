'use client';

import { Gender } from "@/common/enums";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { Textarea } from "@/components/reusable/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { userServiceApi } from "@/services/userApiService";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserGeneralInfo() {
    const { user, setApi } = useAuth();
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setProfileImage(file);

        const result = await userServiceApi.updateProfilePhoto({
            profilePhoto: file,
        });

        if (result?.data?.updateUserProfilePhoto) {
            toast.success('Successfully updated!');
        } else {
            toast.error('Something went wrong!');
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
                `})

            setFormData({
                fullName: userInfo?.data?.findUser?.fullName ?? "",
                dateOfBirth: userInfo?.data?.findUser?.profile?.personal?.dateOfBirth ?? "",
                gender: userInfo?.data?.findUser?.profile?.personal?.gender ?? "",
                address: userInfo?.data?.findUser?.profile?.personal?.address ?? "",
                phone: userInfo?.data?.findUser?.profile?.personal?.phoneNumber ?? "",
                email: userInfo?.data?.findUser?.email ?? "",
                profilePhoto: userInfo?.data?.findUser?.profile?.personal?.profilePhoto ?? ''
            });
        }

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
                result?.errors?.[0]?.message
                return;
            }
            toast.error("Something went wrong!")
            return;
        }

        if (result?.data?.updateUserProfile) {
            toast.success('Successfully updated!')
            setApi((prev) => prev + 1)
            return;
        }

        toast.error("Something went wrong!")
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
                        <div className="flex-shrink-0 relative w-48 h-48 group">
                            {profilePreview || formData.profilePhoto ? (
                                <img
                                    src={profilePreview || formData.profilePhoto}
                                    alt="User"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-7xl font-bold text-primary-foreground shadow-lg">
                                    {placeholderLetter}
                                </div>
                            )}

                            <label className="absolute bottom-2 right-2 bg-primary hover:bg-secondary text-primary-foreground px-3 py-1.5 rounded-md cursor-pointer text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Upload
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload a professional photo of yourself. This photo will be visible on your public profile.
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
                    <select
                        id="gender"
                        name="gender"
                        className="max-w-md border border-input rounded-md px-3 py-2 text-sm bg-background"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>

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