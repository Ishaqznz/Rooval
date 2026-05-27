'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/reusable/ui/button";
import Navigation from "@/components/user/Navigation";
import doctorVector from "@/assets/doctor-vector.png";
import patientVector from "@/assets/patient-vector.png";

const RoleSelection = () => {
  const router = useRouter()

  const handleDoctorClick = () => {
    localStorage.setItem('role', 'doctor')
    router.push("/signup");
  };

  const handlePatientClick = () => {
    localStorage.setItem('role', 'user')
    router.push("/signup"); 
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
          Get Started with Rooval
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          Select your role to continue
        </p>

        <div className="grid md:grid-cols-2 gap-0 max-w-5xl w-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Doctor Section */}
          <div className="bg-[hsl(40,40%,92%)] p-8 md:p-12 flex flex-col items-center text-center">
            <div className="mb-6">
              <img 
                src={doctorVector.src} 
                alt="Doctor" 
                className="w-48 h-64 object-cover rounded-lg"
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">I'm a Doctor</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Manage appointments, reach patients, write prescriptions, view analytics, host sessions
            </p>
            <Button 
              onClick={handleDoctorClick}
              variant="outline"
              size="lg"
              className="w-full max-w-xs bg-background hover:bg-background/90"
            >
              Continue as Doctor
            </Button>
          </div>

          {/* Patient Section */}
          <div className="bg-[hsl(180,35%,50%)] p-8 md:p-12 flex flex-col items-center text-center">
            <div className="mb-6">
              <img 
                src={patientVector.src} 
                alt="Patient" 
                className="w-48 h-64 object-cover rounded-lg"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">I'm a Patient</h2>
            <p className="text-sm text-white/90 mb-6 max-w-xs">
              Book consultations, access reports, join conveniently, chat with experts, search doctors
            </p>
            <Button 
              onClick={handlePatientClick}
              variant="outline"
              size="lg"
              className="w-full max-w-xs bg-white text-foreground hover:bg-white/90"
            >
              Continue as Patient
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
