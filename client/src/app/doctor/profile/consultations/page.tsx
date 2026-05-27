'use client';

import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Label } from "@/components/reusable/ui/label";
import { Checkbox } from "@/components/reusable/ui/checkbox";
import { Textarea } from "@/components/reusable/ui/textarea";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doctorServiceApi } from "@/services/doctorApiService";
import { toast } from "sonner";

export default function ConsultationSettings() {
  const { user, setApi } = useAuth();

  const [formData, setFormData] = useState({
    inPersonEnabled: true,
    videoEnabled: true,
    inPersonFee: "",
    videoFee: "",
    duration: "30",
    defaultMode: "in-person",
    sessionBufferTime: "",
    cancellationPolicy: "",
  });

  useEffect(() => {
    if (user?.profile?.consultationSettings) {
      const settings = user.profile.consultationSettings;

      setFormData({
        inPersonEnabled: settings.inPersonEnabled ?? true,
        videoEnabled: settings.videoEnabled ?? true,
        inPersonFee: settings.inPersonFee?.toString() ?? "",
        videoFee: settings.videoFee?.toString() ?? "",
        duration: settings.duration ?? "30",
        defaultMode: settings.defaultMode ?? "in-person",
        sessionBufferTime: settings.sessionBufferTime ?? "",
        cancellationPolicy: settings.cancellationPolicy ?? "",
      });
    }
  }, [user]);

  /* 🔹 Save settings */
  const handleSave = async () => {
    const result = await doctorServiceApi.updateDoctorProfile({
      input: {
        consultationSettings: {
          type: formData.inPersonEnabled  === true ? 'IN_PERSON': 'VIDEO',
          inPersonFee: Number(formData.inPersonFee),
          videoFee: Number(formData.videoFee),
          duration: Number(formData.duration),
          sessionBufferTime: formData.sessionBufferTime,
          cancellationPolicy: formData.cancellationPolicy,
        }
      }
    });

    if (result?.data?.doctorProfileUpdate) {
      toast.success("Consultation settings saved!");
      setApi(prev => prev + 1);
      return;
    }

    toast.error("Something went wrong!");
  };

  const durations = ["10", "15", "20", "25", "30"];
  const modes = [
    { value: "in-person", label: "In-Person" },
    { value: "video", label: "Video" },
  ];

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Consultation Settings</h1>
        <p className="text-muted-foreground mb-8">
          Configure how patients can consult with you.
        </p>

        <div className="space-y-8">

          {/* Consultation Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Consultation Types Offered</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.inPersonEnabled}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, inPersonEnabled: Boolean(checked) }))
                }
              />
              <Label className="font-normal">In-Person Consultation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.videoEnabled}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, videoEnabled: Boolean(checked) }))
                }
              />
              <Label className="font-normal">Video Consultation</Label>
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Set Your Fees</h3>

            <div className="space-y-2">
              <Label>Fee for In-Person</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={formData.inPersonFee}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, inPersonFee: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Fee for Video</Label>
              <Input
                type="number"
                className="max-w-xs"
                value={formData.videoFee}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, videoFee: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Consultation Duration</h3>
            <div className="flex gap-3">
              {durations.map((d) => (
                <Button
                  key={d}
                  variant={formData.duration === d ? "default" : "outline"}
                  onClick={() =>
                    setFormData(prev => ({ ...prev, duration: d }))
                  }
                >
                  {d} minutes
                </Button>
              ))}
            </div>
          </div>

          {/* Buffer Time */}
          <div className="space-y-2">
            <Label>Session Buffer Time</Label>
            <Input
              className="max-w-md"
              value={formData.sessionBufferTime}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, sessionBufferTime: e.target.value }))
              }
            />
          </div>

          {/* Cancellation */}
          <div className="space-y-2">
            <Label>Cancellation Policy</Label>
            <Textarea
              className="max-w-2xl min-h-[120px]"
              value={formData.cancellationPolicy}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))
              }
            />
          </div>

          {/* Save */}
          <div className="pt-4">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
