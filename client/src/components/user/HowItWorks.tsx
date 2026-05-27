import { UserPlus, Calendar, Video, FileCheck } from "lucide-react";
import workflowIllustration from "@/assets/workflow-illustration.png";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in minutes with your basic information",
    number: "01",
  },
  {
    icon: Calendar,
    title: "Book Appointment",
    description: "Choose your doctor and preferred time slot",
    number: "02",
  },
  {
    icon: Video,
    title: "Video Consultation",
    description: "Connect with your doctor via secure video call",
    number: "03",
  },
  {
    icon: FileCheck,
    title: "Get Treatment",
    description: "Receive prescriptions and personalized care plan",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-heading">
            Simple Steps to{" "}
            <span className="text-primary">Better Health</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting started with Rooval is quick and easy
          </p>
          <div className="flex justify-center mt-8">
            <img 
              src={workflowIllustration.src} 
              alt="Healthcare workflow" 
              className="w-full max-w-3xl animate-in fade-in duration-1000"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mt-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-accent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
