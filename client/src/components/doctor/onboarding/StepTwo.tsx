import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/reusable/ui/form";
import { Input } from "@/components/reusable/ui/input";
import { Checkbox } from "@/components/reusable/ui/checkbox";

const specializations = [
  "Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic Surgeon",
  "Psychiatrist", "General Physician", "Neurologist", "ENT Specialist"
];

const consultationModes = [
  { id: "video", label: "Video Consultation" },
  { id: "audio", label: "Audio Call" },
  { id: "chat", label: "Chat" },
];

const languages = [
  "English", "Spanish", "French", "German", "Chinese", "Hindi", "Arabic"
];

export const StepTwo = ({ form }: { form: any }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="specializations"
        render={() => (
          <FormItem>
            <FormLabel>Specializations</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {specializations.map((spec) => (
                <FormField
                  key={spec}
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(spec)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, spec]);
                            } else {
                              field.onChange(value.filter((v: string) => v !== spec));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {spec}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="consultationModes"
        render={() => (
          <FormItem>
            <FormLabel>Consultation Modes</FormLabel>
            <div className="space-y-2">
              {consultationModes.map((mode) => (
                <FormField
                  key={mode.id}
                  control={form.control}
                  name="consultationModes"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(mode.id)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, mode.id]);
                            } else {
                              field.onChange(value.filter((v: string) => v !== mode.id));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {mode.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="consultationFee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video Consultation Fee (USD)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="50" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="languages"
        render={() => (
          <FormItem>
            <FormLabel>Languages Spoken</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <FormField
                  key={lang}
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(lang)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, lang]);
                            } else {
                              field.onChange(value.filter((v: string) => v !== lang));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {lang}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="certificates"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>Upload Certifications/Licenses</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  onChange(files);
                }}
                {...field}
                value={undefined}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
