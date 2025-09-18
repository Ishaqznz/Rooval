// import React from 'react';
// import { Search, Calendar, MessageCircle, FileText, Bell, Shield, Lock, CheckCircle, Users } from 'lucide-react';

// const Homepage = () => {
//   const doctors = [
//     {
//       name: "Dr. Amelia Harper",
//       specialty: "Cardiologist",
//       image: "👩‍⚕️"
//     },
//     {
//       name: "Dr. Ethan Bennett",
//       specialty: "Dermatologist", 
//       image: "👨‍⚕️"
//     },
//     {
//       name: "Dr. Olivia Carter",
//       specialty: "Pediatrician",
//       image: "👩‍⚕️"
//     },
//     {
//       name: "Dr. Noah Davis",
//       specialty: "Orthopedic Surgeon",
//       image: "👨‍⚕️"
//     },
//     {
//       name: "Dr. Sophia Evans",
//       specialty: "Neurologist",
//       image: "👩‍⚕️"
//     },
//     {
//       name: "Dr. Liam",
//       specialty: "Psychiatrist",
//       image: "👨‍⚕️"
//     }
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Mitchell",
//       text: "DocEase has transformed how I manage my health. Booking appointments is a breeze, and the online consultations are so convenient.",
//       image: "👩"
//     },
//     {
//       name: "David Thompson", 
//       text: "I appreciate the ability to connect with doctors from anywhere. The platform is user-friendly, and the doctors are highly professional.",
//       image: "👨"
//     },
//     {
//       name: "Emily Clark",
//       text: "The health communities are a great resource for support and advice. It's comforting to know I'm not alone in my health journey.",
//       image: "👩"
//     }
//   ];

//   const features = [
//     {
//       icon: <MessageCircle className="w-6 h-6" />,
//       title: "Online Video Consultations"
//     },
//     {
//       icon: <Calendar className="w-6 h-6" />,
//       title: "Book Offline Visits"
//     },
//     {
//       icon: <Users className="w-6 h-6" />,
//       title: "Health Communities & Support"
//     },
//     {
//       icon: <FileText className="w-6 h-6" />,
//       title: "Digital Health & Medical Records"
//     },
//     {
//       icon: <MessageCircle className="w-6 h-6" />,
//       title: "Online Chat with Doctors"
//     },
//     {
//       icon: <Bell className="w-6 h-6" />,
//       title: "Reminders & Notifications"
//     }
//   ];

//   const steps = [
//     {
//       icon: <Search className="w-6 h-6" />,
//       title: "Search & Select a Doctor"
//     },
//     {
//       icon: <Calendar className="w-6 h-6" />,
//       title: "Book an Appointment"
//     },
//     {
//       icon: <MessageCircle className="w-6 h-6" />,
//       title: "Consult & Get a Prescription"
//     }
//   ];

//   const communities = [
//     {
//       title: "Anxiety Support",
//       color: "bg-orange-200"
//     },
//     {
//       title: "Diabetes Care", 
//       color: "bg-blue-200"
//     },
//     {
//       title: "PCOS Warriors",
//       color: "bg-yellow-200"
//     }
//   ];

//   const securityFeatures = [
//     {
//       icon: <Shield className="w-6 h-6" />,
//       title: "Privacy First"
//     },
//     {
//       icon: <Lock className="w-6 h-6" />,
//       title: "Secure Consultations"
//     },
//     {
//       icon: <CheckCircle className="w-6 h-6" />,
//       title: "Verified Doctors"
//     },
//     {
//       icon: <FileText className="w-6 h-6" />,
//       title: "HIPAA Compliant"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center">
//               <div className="text-2xl font-bold text-gray-900">🏥 DocEase</div>
//             </div>
//             <nav className="hidden md:flex space-x-8">
//               <a href="#" className="text-gray-700 hover:text-gray-900">Home</a>
//               <a href="#" className="text-gray-700 hover:text-gray-900">Features</a>
//               <a href="#" className="text-gray-700 hover:text-gray-900">Doctors</a>
//               <a href="#" className="text-gray-700 hover:text-gray-900">Communities</a>
//               <a href="#" className="text-gray-700 hover:text-gray-900">About Us</a>
//             </nav>
//             <div className="flex items-center space-x-4">
//               <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
//                 Get Started
//               </button>
//               <button className="text-gray-700 hover:text-gray-900">
//                 Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             <div>
//               <h1 className="text-5xl font-bold text-gray-900 mb-6">
//                 Your Health,<br />
//                 One Click Away
//               </h1>
//               <p className="text-xl text-gray-600 mb-8">
//                 Book appointments, consult with expert doctors, and join health communities—all in one place.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
//                   Book a Doctor
//                 </button>
//                 <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50">
//                   Join for Free
//                 </button>
//               </div>
//             </div>
//             <div className="relative">
//               <div className="bg-teal-200 rounded-full w-96 h-96 mx-auto relative overflow-hidden">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="text-8xl">👨‍⚕️👩‍💼</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Search Bar */}
//       <section className="bg-white py-8 shadow-sm">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
//             <Search className="w-5 h-5 text-gray-400 mr-3" />
//             <input 
//               type="text" 
//               placeholder="Find doctors near you or available online"
//               className="bg-transparent flex-1 outline-none text-gray-700"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-12">What You Get with DocEase</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
//                 <div className="text-blue-600 mb-4">{feature.icon}</div>
//                 <h3 className="font-semibold text-gray-900">{feature.title}</h3>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-16 bg-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {steps.map((step, index) => (
//               <div key={index} className="text-center">
//                 <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
//                   {step.icon}
//                 </div>
//                 <h3 className="font-semibold text-gray-900">{step.title}</h3>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Top Doctors */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-12">Top Specialties/Doctors</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
//             {doctors.map((doctor, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
//                 <div className="w-16 h-16 bg-teal-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
//                   {doctor.image}
//                 </div>
//                 <h3 className="font-semibold text-gray-900 text-sm">{doctor.name}</h3>
//                 <p className="text-gray-600 text-xs mb-4">{doctor.specialty}</p>
//                 <button className="bg-blue-600 text-white px-4 py-1 rounded text-xs hover:bg-blue-700">
//                   Book Now
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Patient Testimonials */}
//       <section className="py-16 bg-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-12">Patient Testimonials</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
//                 <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
//                   {testimonial.image}
//                 </div>
//                 <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
//                 <p className="font-semibold text-gray-900">{testimonial.name}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Communities */}
//       <section className="py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-12">You're Not Alone</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
//             {communities.map((community, index) => (
//               <div key={index} className={`${community.color} rounded-lg p-8 text-center`}>
//                 <div className="w-24 h-24 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl">
//                   👥
//                 </div>
//                 <h3 className="font-semibold text-gray-900">{community.title}</h3>
//               </div>
//             ))}
//           </div>
//           <div className="text-center">
//             <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
//               Explore Communities
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Security */}
//       <section className="py-16 bg-gray-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-gray-900 mb-12">Security & Trust</h2>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             {securityFeatures.map((feature, index) => (
//               <div key={index} className="text-center">
//                 <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
//                   {feature.icon}
//                 </div>
//                 <h3 className="font-semibold text-gray-900">{feature.title}</h3>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 bg-blue-600">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-4xl font-bold text-white mb-8">
//             Ready to take control of your health?
//           </h2>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100">
//               Sign Up Now
//             </button>
//             <button className="border border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
//               Talk to a Doctor
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-white py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">About</h3>
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Terms of Service</h3>
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4">Privacy Policy</h3>
//             </div>
//           </div>
//           <div className="border-t border-gray-200 pt-8 flex justify-between items-center">
//             <p className="text-gray-600">© 2024 DocEase. All rights reserved.</p>
//             <div className="flex space-x-4 text-gray-400">
//               <span>📱</span>
//               <span>🐦</span>
//               <span>📧</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Homepage;


export default function Home() {
  return (
    <div>
      <p className="text-red-500">If this is red, Tailwind works!</p>
    </div>
  );
}
