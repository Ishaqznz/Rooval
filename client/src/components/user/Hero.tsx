'use client';

import { Button } from "@/components/reusable/ui/button";
import { ArrowRight, Calendar, Video, Shield } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.png";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter()
  return (
    <section className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-accent/30 rounded-full text-sm text-secondary font-medium">
              <Shield className="w-4 h-4 mr-2" />
              HIPAA Compliant & Secure
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Healthcare at Your{" "}
              <span className="text-primary">Fingertips</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
              Connect with certified doctors instantly. Get prescriptions, medical advice, 
              and comprehensive care from the comfort of your home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6" onClick={() => router.push('/doctors')}>
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 sm:gap-8 pt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">24/7 Availability</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Video Consultations</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <img
              src={heroDoctor.src}
              alt="Doctor consultation via video call"
              className="w-full max-w-2xl animate-in fade-in-50 duration-700 rounded-[15px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
