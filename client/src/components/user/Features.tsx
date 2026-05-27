import { Stethoscope, Clock, FileText, Shield, MessageCircle, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/reusable/ui/card";
import featuresIllustration from "@/assets/features-illustration.png";

const features = [
  {
    icon: Stethoscope,
    title: "Expert Doctors",
    description: "Access certified healthcare professionals across multiple specialties",
  },
  {
    icon: Clock,
    title: "Instant Access",
    description: "Connect with doctors in minutes, not days. 24/7 availability",
  },
  {
    icon: FileText,
    title: "Digital Prescriptions",
    description: "Receive electronic prescriptions sent directly to your pharmacy",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "HIPAA-compliant platform with end-to-end encryption",
  },
  {
    icon: MessageCircle,
    title: "Follow-up Care",
    description: "Message your doctor anytime for follow-up questions",
  },
  {
    icon: Pill,
    title: "Medication Management",
    description: "Track medications, refills, and health history in one place",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-heading">
            Everything You Need for{" "}
            <span className="text-primary">Complete Care</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive healthcare ecosystem designed around your needs
          </p>
          <div className="flex justify-center mt-8">
            <img 
              src={featuresIllustration.src} 
              alt="Healthcare features" 
              className="w-64 h-64 animate-in fade-in duration-1000"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6 sm:p-8">
                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
