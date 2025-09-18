'use client';
import { useRouter } from "next/navigation";

import React from 'react';
import { Heart, Video, FileText, Users, MapPin, Star, Menu, X, ArrowRight, Shield, Clock, Award } from 'lucide-react';

const RoovalLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter()

  // Custom SVG Illustrations
  const HeroIllustration = () => (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#415A77" />
          <stop offset="100%" stopColor="#778DA9" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0E1DD" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      
      {/* Background waves */}
      <path d="M0,350 Q150,320 300,340 T600,330 L600,400 L0,400 Z" fill="#0D1B2A" opacity="0.1"/>
      <path d="M0,370 Q150,340 300,360 T600,350 L600,400 L0,400 Z" fill="#1B263B" opacity="0.15"/>
      
      {/* Doctor figure */}
      <circle cx="200" cy="180" r="40" fill="#415A77"/>
      <rect x="180" y="210" width="40" height="60" rx="5" fill="#1B263B"/>
      <circle cx="185" cy="190" r="8" fill="#E0E1DD"/>
      <circle cx="215" cy="190" r="8" fill="#E0E1DD"/>
      <path d="M190,200 Q200,210 210,200" stroke="#E0E1DD" strokeWidth="2" fill="none"/>
      
      {/* Stethoscope */}
      <path d="M170,230 Q160,240 160,250 Q160,260 170,260" stroke="#778DA9" strokeWidth="3" fill="none"/>
      <circle cx="170" cy="260" r="5" fill="#778DA9"/>
      
      {/* Computer screen */}
      <rect x="350" y="150" width="180" height="120" rx="8" fill="url(#screenGrad)" stroke="#415A77" strokeWidth="2"/>
      <rect x="360" y="160" width="160" height="90" fill="#0D1B2A" rx="4"/>
      
      {/* Patient on screen */}
      <circle cx="440" cy="190" r="25" fill="#778DA9"/>
      <rect x="425" y="210" width="30" height="35" rx="3" fill="#415A77"/>
      <circle cx="435" cy="185" r="4" fill="#E0E1DD"/>
      <circle cx="445" cy="185" r="4" fill="#E0E1DD"/>
      <path d="M437,195 Q440,200 443,195" stroke="#E0E1DD" strokeWidth="1" fill="none"/>
      
      {/* Connection lines */}
      <path d="M240,200 Q295,190 350,200" stroke="#778DA9" strokeWidth="2" fill="none" strokeDasharray="5,5">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite"/>
      </path>
      
      {/* Floating icons */}
      <g transform="translate(100,100)">
        <circle r="15" fill="#415A77" opacity="0.8">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="3s" repeatCount="indefinite"/>
        </circle>
        <path d="M-5,0 L0,-5 L5,0 L0,5 Z" fill="#E0E1DD"/>
      </g>
      
      <g transform="translate(480,100)">
        <circle r="12" fill="#778DA9" opacity="0.8">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <rect x="-4" y="-4" width="8" height="8" fill="#E0E1DD" rx="1"/>
      </g>
    </svg>
  );

  const AboutIllustration = () => (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#415A77" />
          <stop offset="100%" stopColor="#778DA9" />
        </linearGradient>
      </defs>
      
      {/* Healthcare team */}
      <g transform="translate(50,100)">
        <circle cx="0" cy="0" r="30" fill="#1B263B"/>
        <rect x="-20" y="20" width="40" height="50" rx="5" fill="#415A77"/>
        <circle cx="-8" cy="-8" r="6" fill="#E0E1DD"/>
        <circle cx="8" cy="-8" r="6" fill="#E0E1DD"/>
        <path d="M-5,5 Q0,12 5,5" stroke="#E0E1DD" strokeWidth="2" fill="none"/>
      </g>
      
      <g transform="translate(150,120)">
        <circle cx="0" cy="0" r="25" fill="#415A77"/>
        <rect x="-18" y="18" width="36" height="45" rx="4" fill="#778DA9"/>
        <circle cx="-6" cy="-6" r="5" fill="#E0E1DD"/>
        <circle cx="6" cy="-6" r="5" fill="#E0E1DD"/>
        <path d="M-4,4 Q0,9 4,4" stroke="#E0E1DD" strokeWidth="2" fill="none"/>
      </g>
      
      <g transform="translate(250,110)">
        <circle cx="0" cy="0" r="28" fill="#0D1B2A"/>
        <rect x="-19" y="19" width="38" height="48" rx="4" fill="#1B263B"/>
        <circle cx="-7" cy="-7" r="5" fill="#E0E1DD"/>
        <circle cx="7" cy="-7" r="5" fill="#E0E1DD"/>
        <path d="M-5,5 Q0,10 5,5" stroke="#E0E1DD" strokeWidth="2" fill="none"/>
      </g>
      
      {/* Medical cross */}
      <g transform="translate(320,50)">
        <circle r="20" fill="#778DA9" opacity="0.9"/>
        <rect x="-8" y="-2" width="16" height="4" fill="#E0E1DD"/>
        <rect x="-2" y="-8" width="4" height="16" fill="#E0E1DD"/>
      </g>
      
      {/* Floating particles */}
      <circle cx="80" cy="50" r="3" fill="#415A77" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="180" cy="60" r="2" fill="#778DA9" opacity="0.7">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,7; 0,0" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="300" cy="180" r="4" fill="#415A77" opacity="0.5">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,0" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{backgroundColor: '#E0E1DD'}}>
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#0D1B2A'}}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Poppins, sans-serif'}}>
                Rooval<span style={{color: '#415A77'}}></span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              <button className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg" style={{backgroundColor: '#415A77'}} onClick={() => router.push('/login')}>
                Sign In
              </button>
            </div>
            
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-700">Features</a>
              <a href="#about" className="block text-gray-700">About</a>
              <a href="#testimonials" className="block text-gray-700">Testimonials</a>
              <a href="#contact" className="block text-gray-700">Contact</a>
              <button className="w-full px-6 py-2 rounded-lg text-white font-medium" style={{backgroundColor: '#415A77'}}>
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight" style={{fontFamily: 'Poppins, sans-serif', color: '#0D1B2A'}}>
                  Your Health, Our Priority –
                  <span className="block" style={{color: '#415A77'}}>Consult Doctors Anytime, Anywhere</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl" style={{fontFamily: 'Inter, sans-serif'}}>
                  Experience secure video consultations, comprehensive patient dashboards, and community support all in one trusted platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 rounded-xl text-white font-semibold transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2" style={{backgroundColor: '#0D1B2A'}}>
                  Book a Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg border-2" style={{color: '#415A77', borderColor: '#415A77'}}>
                  Learn More
                </button>
              </div>
              
              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0D1B2A'}}>50K+</div>
                  <div className="text-gray-600 text-sm">Patients Served</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0D1B2A'}}>1000+</div>
                  <div className="text-gray-600 text-sm">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0D1B2A'}}>24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{fontFamily: 'Poppins, sans-serif', color: '#0D1B2A'}}>
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for modern healthcare delivery, all in one integrated platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Video,
                title: "Online Video Consultations",
                description: "Secure, HD video calls with certified doctors from the comfort of your home"
              },
              {
                icon: FileText,
                title: "Patient Dashboard & Records",
                description: "Complete health history, test results, and prescription management in one place"
              },
              {
                icon: Shield,
                title: "Doctor & Admin Controls",
                description: "Advanced tools for healthcare providers to manage patients and appointments"
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with other patients and find local healthcare resources easily"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:scale-110" style={{backgroundColor: '#415A77'}}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4" style={{color: '#0D1B2A'}}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#E0E1DD'}}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold" style={{fontFamily: 'Poppins, sans-serif', color: '#0D1B2A'}}>
                Transforming Healthcare Through Technology
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Rooval bridges the gap between patients and healthcare providers with innovative technology solutions. Our platform ensures quality care is accessible to everyone, anywhere, anytime.
              </p>
              <div className="space-y-4">
                {[
                  "HIPAA-compliant secure communications",
                  "AI-powered health insights and recommendations",
                  "Integration with major health systems",
                  "24/7 emergency support and triage"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{backgroundColor: '#415A77'}}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <AboutIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{fontFamily: 'Poppins, sans-serif', color: '#0D1B2A'}}>
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from patients who've experienced quality care through Rooval
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Working Mother",
                content: "docEase saved me so much time. I could consult with my doctor during lunch break without missing work. The video quality was perfect and my prescriptions were sent directly to my pharmacy.",
                rating: 5
              },
              {
                name: "Dr. Michael Chen",
                role: "Family Physician",
                content: "The admin dashboard makes patient management incredibly efficient. I can review patient history, schedule appointments, and even conduct group consultations seamlessly.",
                rating: 5
              },
              {
                name: "Robert Martinez",
                role: "Senior Patient",
                content: "As someone who's not very tech-savvy, I was surprised how easy docEase is to use. The support team helped me set up everything and now I have regular check-ups from home.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{color: '#415A77'}} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold" style={{color: '#0D1B2A'}}>
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#0D1B2A'}}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who trust docEase for quality, accessible healthcare.
          </p>
          <button className="px-12 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:shadow-2xl hover:scale-105 flex items-center gap-3 mx-auto" style={{backgroundColor: '#415A77'}}>
            Get Started with docEase Today
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: '#0D1B2A'}}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  doc<span style={{color: '#415A77'}}>Ease</span>
                </span>
              </div>
              <p className="text-gray-600 max-w-md mb-4">
                Making quality healthcare accessible to everyone through innovative technology and compassionate care.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{backgroundColor: '#E0E1DD'}}>
                    <div className="w-5 h-5 rounded bg-gray-400"></div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{color: '#0D1B2A'}}>Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Features</a></li>
                <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600">For Doctors</a></li>
                <li><a href="#" className="hover:text-blue-600">For Patients</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{color: '#0D1B2A'}}>Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600">About</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 docEase. All rights reserved. | Making healthcare accessible to all.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RoovalLanding;