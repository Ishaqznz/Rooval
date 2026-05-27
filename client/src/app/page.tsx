import Navigation from "@/components/user/Navigation";
import Hero from "@/components/user/Hero";
import Features from "@/components/user/Features";
import HowItWorks from "@/components/user/HowItWorks";
import CTA from "@/components/user/CTA";
import Footer from "@/components/user/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
