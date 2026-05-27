import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/reusable/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/reusable/ui/radio-group";
import { Switch } from "@/components/reusable/ui/switch";

export const StepThree = ({ form }: { form: any }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="consultationDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Consultation Duration</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="15" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    15 minutes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="30" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    30 minutes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="45" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    45 minutes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="60" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    60 minutes
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferredMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Consultation Mode</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="video" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Video Consultation
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="audio" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Offline Consultation
                  </FormLabel>
                </FormItem>
                {/* <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="chat" />
                  </FormControl> */}
                  {/* <FormLabel className="font-normal cursor-pointer">
                    Chat
                  </FormLabel> */}
                {/* </FormItem> */}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="acceptingPatients"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Accepting New Patients</FormLabel>
              <div className="text-sm text-muted-foreground">
                Allow new patients to book consultations
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profileVisibility"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Profile Visibility</FormLabel>
              <div className="text-sm text-muted-foreground">
                Make your profile visible in search results
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};
