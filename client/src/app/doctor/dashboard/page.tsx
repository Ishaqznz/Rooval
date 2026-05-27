// "use client";

// interface EarningRow {
//   label: string;
//   amount: string;
//   isTotal?: boolean;
// }

// interface NotificationItem {
//   text: React.ReactNode;
//   time: string;
//   unread?: boolean;
//   variant?: "default" | "danger";
// }

// interface RecentPatient {
//   name: string;
//   initials: string;
//   avatarColor: string;
//   condition: string;
//   when: string;
// }

// const SearchIcon = () => (
//   <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
//     <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L14 14" />
//   </svg>
// );
// const BellIcon = () => (
//   <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
//     <path d="M8 2a4 4 0 014 4v3l1 2H3l1-2V6a4 4 0 014-4z" /><path d="M6 13a2 2 0 004 0" />
//   </svg>
// );
// const CalendarIcon = () => (
//   <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <rect x="1" y="3" width="14" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M1 7h14" />
//   </svg>
// );
// const PatientsIcon = () => (
//   <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <circle cx="6" cy="5" r="3" /><path d="M1 14c0-3 2-5 5-5s5 2 5 5" />
//     <circle cx="12" cy="4" r="2" /><path d="M12 8c2 0 3 1.5 3 3.5" />
//   </svg>
// );
// const ClockIcon = () => (
//   <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
//   </svg>
// );
// const EarningsIcon = () => (
//   <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
//     <circle cx="8" cy="8" r="6" /><path d="M8 5v1.5M8 10.5V12" />
//     <path d="M5.8 6.5a2.2 1.5 0 104.4 0 2.2 1.5 0 00-4.4 0" />
//     <path d="M5.8 9.5a2.2 1.5 0 104.4 0" />
//   </svg>
// );
// const AvailabilityIcon = () => (
//   <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
//     <rect x="1" y="3" width="14" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M1 7h14" />
//     <path d="M5 10l2 2 4-4" />
//   </svg>
// );

// const todayAppointments = [
//   { id: "#PT-0041", name: "Priya Krishnan", initials: "PK", avatarColor: "bg-sky-400", time: "9:00 AM", type: "Consultation", status: "confirmed" as const },
//   { id: "#PT-0088", name: "Ravi Shankar", initials: "RS", avatarColor: "bg-amber-400", time: "10:15 AM", type: "Follow-up", status: "confirmed" as const },
//   { id: "#PT-0102", name: "Anita Menon", initials: "AM", avatarColor: "bg-purple-500", time: "11:30 AM", type: "ECG Review", status: "pending" as const },
//   { id: "#PT-0057", name: "Suresh Kumar", initials: "SK", avatarColor: "bg-emerald-500", time: "2:00 PM", type: "Video Call", status: "live" as const },
//   { id: "#PT-0073", name: "Nalini Patel", initials: "NP", avatarColor: "bg-rose-400", time: "3:45 PM", type: "Consultation", status: "cancelled" as const },
// ];

// const recentPatients: RecentPatient[] = [
//   { name: "Vijaya Ramesh", initials: "VR", avatarColor: "bg-sky-400", condition: "Hypertension · Stage 2", when: "Today" },
//   { name: "Mahesh Gupta", initials: "MG", avatarColor: "bg-amber-400", condition: "Arrhythmia · Under monitoring", when: "Yesterday" },
//   { name: "Saranya Thiyagarajan", initials: "ST", avatarColor: "bg-purple-500", condition: "Post-surgery · Recovery", when: "Apr 18" },
// ];

// const earningRows: EarningRow[] = [
//   { label: "Consultations (18)", amount: "₹27,000" },
//   { label: "Live Sessions (3)", amount: "₹12,600" },
//   { label: "Medical Reports (7)", amount: "₹8,600" },
//   { label: "Total this month", amount: "₹48,200", isTotal: true },
// ];

// const notifications: NotificationItem[] = [
//   { text: <><strong>Priya Krishnan</strong> confirmed her 9:00 AM appointment</>, time: "2 min ago", unread: true },
//   { text: <>New message from <strong>Mahesh Gupta</strong> about his medication</>, time: "18 min ago", unread: true },
//   { text: <>Lab report for <strong>Anita Menon</strong> is ready for review</>, time: "1 hr ago", unread: true },
//   { text: <>Nalini Patel cancelled her 3:45 PM appointment</>, time: "2 hr ago", variant: "danger" },
// ];

// const barHeights = [45, 60, 50, 75, 55, 90, 40];
// const barDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const statusMap = {
//   confirmed: "bg-emerald-100 text-emerald-700",
//   pending: "bg-amber-100 text-amber-700",
//   cancelled: "bg-rose-100 text-rose-700",
//   live: "bg-purple-100 text-purple-700",
// };

// export default function DoctorDashboardPage() {

//   return (
//     <>
//       {/* Topbar */}
//       <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between flex-shrink-0">
//         <div>
//           <p className="font-semibold text-base leading-tight">Good morning, Dr. Mehta 👋</p>
//           <p className="text-[11px] text-muted-foreground mt-0.5">Monday, 20 April 2026 · Cardiology Wing</p>
//         </div>
//         <div className="flex items-center gap-2.5">
//           <button className="w-[34px] h-[34px] border border-border rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
//             <SearchIcon />
//           </button>
//           <button className="relative w-[34px] h-[34px] border border-border rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
//             <BellIcon />
//             <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary border-2 border-white" />
//           </button>
//           <button className="flex items-center gap-1.5 bg-primary hover:bg-secondary text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors">
//             <AvailabilityIcon />
//             Set Availability
//           </button>
//         </div>
//       </header>

//       {/* Scrollable Content */}
//       <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

//         {/* Stat Cards */}
//         <div className="grid grid-cols-4 gap-3">
//           {[
//             { num: "24", label: "Today's Appointments", change: "↑ 3 more than yesterday", changeColor: "text-emerald-600", accent: "bg-primary", iconColor: "text-secondary", iconBg: "bg-purple-100", icon: <CalendarIcon /> },
//             { num: "182", label: "Active Patients", change: "↑ 7 new this week", changeColor: "text-emerald-600", accent: "bg-emerald-500", iconColor: "text-emerald-700", iconBg: "bg-emerald-100", icon: <PatientsIcon /> },
//             { num: "6", label: "Pending Reviews", change: "2 urgent", changeColor: "text-amber-600", accent: "bg-amber-400", iconColor: "text-amber-700", iconBg: "bg-amber-100", icon: <ClockIcon /> },
//           ].map((stat) => (
//             <div key={stat.label} className="bg-card border border-border rounded-xl p-4 relative overflow-hidden">
//               <div className={`absolute top-0 left-0 right-0 h-[3px] ${stat.accent} opacity-60`} />
//               <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center mb-2.5 ${stat.iconColor}`}>
//                 {stat.icon}
//               </div>
//               <p className="text-[22px] font-semibold leading-tight text-foreground">{stat.num}</p>
//               <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
//               <p className={`text-[10px] mt-1.5 ${stat.changeColor}`}>{stat.change}</p>
//             </div>
//           ))}
//         </div>

//         {/* Two-column */}
//         <div className="grid grid-cols-[1fr_320px] gap-3.5">

//           {/* Appointments Table */}
//           <div className="bg-card border border-border rounded-xl overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
//               <p className="font-semibold text-[13px]">Today&apos;s Appointments</p>
//               <div className="flex items-center gap-2.5">
//                 <span className="text-[11px] text-muted-foreground">Mon, 20 Apr</span>
//                 <a href="/doctor/dashboard/appointments" className="text-[11px] text-primary hover:text-secondary transition-colors">View all →</a>
//               </div>
//             </div>
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-purple-50/60">
//                   {["Patient", "Time", "Type", "Status"].map((h) => (
//                     <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {todayAppointments.map((a) => (
//                   <tr key={a.id} className="border-b border-purple-50 last:border-b-0 hover:bg-purple-50/30 transition-colors">
//                     <td className="px-4 py-2.5">
//                       <div className="flex items-center gap-2.5">
//                         <div className={`w-8 h-8 ${a.avatarColor} rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0`}>
//                           {a.initials}
//                         </div>
//                         <div>
//                           <p className="text-[12px] font-medium">{a.name}</p>
//                           <p className="text-[10px] text-muted-foreground">{a.id}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-2.5 text-[12px]">{a.time}</td>
//                     <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{a.type}</td>
//                     <td className="px-4 py-2.5">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusMap[a.status]}`}>
//                         {a.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Right Column */}
//           <div className="flex flex-col gap-3.5">
//             {/* Live Session */}
//             {/* <div className="rounded-xl p-4 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(277,44%,39%) 0%, hsl(277,50%,28%) 100%)" }}>
//               <div className="absolute bottom-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/5" />
//               <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-3">
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
//                 Live Now
//               </div>
//               <p className="font-semibold text-sm mb-0.5">Cardiology Community Session</p>
//               <p className="text-[11px] opacity-70 mb-3.5">Heart Failure — New Treatment Pathways</p>
//               <div className="flex items-center justify-between">
//                 <div className="text-center"><p className="text-lg font-semibold">47</p><p className="text-[10px] opacity-60 mt-0.5">Attendees</p></div>
//                 <div className="w-px h-8 bg-white/15" />
//                 <div className="text-center"><p className="text-lg font-semibold">32m</p><p className="text-[10px] opacity-60 mt-0.5">Elapsed</p></div>
//                 <button className="bg-white/15 border border-white/25 text-white text-[11px] font-medium px-3.5 py-1.5 rounded-lg hover:bg-white/25 transition-colors">
//                   Join Session
//                 </button>
//               </div>
//             </div> */}

//             {/* Recent Patients */}
//             {/* <div className="bg-card border border-border rounded-xl overflow-hidden">
//               <div className="flex items-center justify-between px-4 py-3 border-b border-border">
//                 <p className="font-semibold text-[13px]">Recent Patients</p>
//                 <a href="/doctor/dashboard/patients" className="text-[11px] text-primary hover:text-secondary transition-colors">All patients →</a>
//               </div>
//               {recentPatients.map((p) => (
//                 <div key={p.name} className="flex items-center gap-2.5 px-4 py-3 border-b border-purple-50 last:border-b-0 hover:bg-purple-50/30 transition-colors cursor-pointer">
//                   <div className={`w-8 h-8 ${p.avatarColor} rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0`}>
//                     {p.initials}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[12px] font-medium truncate">{p.name}</p>
//                     <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.condition}</p>
//                   </div>
//                   <p className="text-[10px] text-muted-foreground flex-shrink-0">{p.when}</p>
//                 </div>
//               ))}
//             </div> */}
//           </div>
//         </div>

//         {/* Bottom Row */}
//         <div className="grid grid-cols-2 gap-3.5">

//           {/* Earnings */}
//           {/* <div className="bg-card border border-border rounded-xl overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
//               <p className="font-semibold text-[13px]">Earnings Overview</p>
//               <a href="/doctor/dashboard/earnings" className="text-[11px] text-primary hover:text-secondary transition-colors">Full report →</a>
//             </div>
//             <div className="px-4 pt-3.5 pb-2">
//               <p className="text-[11px] text-muted-foreground mb-2">Weekly consultation revenue</p>
//               <div className="flex items-end gap-1.5 h-12">
//                 {barHeights.map((h, i) => (
//                   <div key={i} className={`flex-1 rounded-t-sm ${i === 5 ? "bg-primary" : "bg-muted"} ${i === 6 ? "opacity-40" : ""}`} style={{ height: `${h}%` }} />
//                 ))}
//               </div>
//               <div className="flex gap-1.5 mt-1">
//                 {barDays.map((d) => (<p key={d} className="flex-1 text-center text-[9px] text-muted-foreground">{d}</p>))}
//               </div>
//             </div>
//             {earningRows.map((row) => (
//               <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 border-b border-purple-50 last:border-b-0 ${row.isTotal ? "bg-purple-50/60" : ""}`}>
//                 <span className={`text-[12px] ${row.isTotal ? "font-medium" : ""}`}>{row.label}</span>
//                 <span className={`text-[13px] font-semibold ${row.isTotal ? "text-primary" : "text-secondary"}`}>{row.amount}</span>
//               </div>
//             ))}
//           </div> */}

//           {/* Notifications */}
//           <div className="bg-card border border-border rounded-xl overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
//               <p className="font-semibold text-[13px]">Notifications</p>
//               <span className="text-[10px] text-white bg-primary px-2 py-0.5 rounded-full font-semibold">3 new</span>
//             </div>
//             {notifications.map((n, i) => (
//               <div key={i} className="flex items-start gap-2.5 px-4 py-3 border-b border-purple-50 last:border-b-0">
//                 <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${n.variant === "danger" ? "bg-rose-100 text-rose-600" : "bg-purple-100 text-secondary"}`}>
//                   <BellIcon />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-[11px] leading-relaxed text-foreground">{n.text}</p>
//                   <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
//                 </div>
//                 {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
//               </div>
//             ))}
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }



export default function DoctorDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] px-6 text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3h18v18H3z" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Dashboard Coming Soon
        </h1>

        <p className="text-muted-foreground text-sm">
          We're working on a powerful dashboard experience for doctors.
          Stay tuned for upcoming updates.
        </p>
      </div>
    </div>
  );
}