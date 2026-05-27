"use client";

import DoctorGuard from "@/guards/doctorGuard";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      { children }
    </>
  );
}


  // <DoctorGuard>
    //   {children}
    // </DoctorGuard>