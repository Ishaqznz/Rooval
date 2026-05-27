'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/reusable/ui/button";
import { Progress } from "@/components/reusable/ui/progress";
import { Form } from "@/components/reusable/ui/form";
import { StepOne } from "@/components/doctor/onboarding/StepOne";
import { StepTwo } from "@/components/doctor/onboarding/StepTwo";
import { StepThree } from "@/components/doctor/onboarding/StepThree";
import { doctorServiceApi } from "@/services/doctorApiService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({

  profilePhoto: z.any().optional(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string().min(1, "Please select a gender"),
  phone: z.string().min(10, "Invalid phone number"),
  registrationNumber: z.string().min(3, "Registration number is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  experience: z.string().min(1, "Experience is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),

  specializations: z.array(z.string()).min(1, "Select at least one specialization"),
  consultationModes: z.array(z.string()).min(1, "Select at least one consultation mode"),
  consultationFee: z.string().min(1, "Consultation fee is required"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  certificates: z.any().optional(),

  consultationDuration: z.string().min(1, "Select consultation duration"),
  preferredMode: z.string().min(1, "Select preferred consultation mode"),
  acceptingPatients: z.boolean(),
  profileVisibility: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const DoctorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter()
  const { setApi } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      gender: "",
      phone: "",
      registrationNumber: "",
      country: "",
      state: "",
      experience: "",
      bio: "",
      specializations: [],
      consultationModes: [],
      consultationFee: "",
      languages: [],
      consultationDuration: "",
      preferredMode: "",
      acceptingPatients: true,
      profileVisibility: true,
    },
  });

  const validateStep = async (step: number) => {
    const fieldsToValidate: (keyof FormData)[] = [];

    if (step === 1) {
      fieldsToValidate.push("fullName", "gender", "phone", "registrationNumber", "country", "state", "experience", "bio");
    } else if (step === 2) {
      fieldsToValidate.push("specializations", "consultationModes", "consultationFee", "languages");
    } else if (step === 3) {
      fieldsToValidate.push("consultationDuration", "preferredMode");
    }

    return await form.trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    const profilePhoto = data.profilePhoto;
    const certificates = Array.from(data.certificates || []) as File[];

    const response = await doctorServiceApi.onboard({
      input: {
        username: data.fullName,
        gender: data.gender,
        phone: data.phone,
        registrationNumber: data.registrationNumber,
        country: data.country,
        state: data.state,
        experience: Number(data.experience),
        bio: data.bio,
        specializations: data.specializations.map((value) =>
          value.trim().replace(/\s+/g, '_').toUpperCase()
        ),
        consultationModes: data.consultationModes.map((value) => value === 'video' ? 'ONLINE' : 'IN_PERSON'),
        consultationFee: Number(data.consultationFee),
        languages: data.languages,
        consultationDuration: Number(data.consultationDuration),
        preferredMode: data.preferredMode === 'video' ? 'ONLINE' : 'IN_PERSON',
        acceptingPatients: data.acceptingPatients,
        profileVisibility: data.profileVisibility,
      },
    });

    if (response?.errors?.[0]?.code == 'BAD_USER_INPUT') {
      toast.message('something went wrong!')
      return;
    }

    const fileResponse = await doctorServiceApi.fileUpload({ profilePhoto, certificates })
    console.log('file response from the server: ', fileResponse)
    if (response.errors) {
      toast.error(response.errors[0].message || 'something went wrong!')
      return;
    }

    toast.success(`Completed your onboarding
      You will be verified soon!.
      `)


    router.push('/')
    setApi((value) => value + 1)
  };

  const stepTitles = [
    "Let's Get to Know You",
    "Tell us about your practice",
    "Set Your Availability & Preferences"
  ];

  const stepSubtitles = [
    "Please provide some basic information to get started",
    "Share details about your specializations and services",
    "Configure your consultation preferences"
  ];

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          {/* <img src={logo} alt="Rooval" className="h-8 w-auto" /> */}
          <h1 className="text-xl font-bold text-primary">rooval</h1>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">{stepTitles[currentStep - 1]}</h2>
              <p className="text-sm text-muted-foreground">{stepSubtitles[currentStep - 1]}</p>
            </div>

            <div className="bg-card p-6 rounded-lg border space-y-4">
              {currentStep === 1 && <StepOne form={form} />}
              {currentStep === 2 && <StepTwo form={form} />}
              {currentStep === 3 && <StepThree form={form} />}
            </div>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="flex-1">
                  Complete Onboarding
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
