'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Languages,
  Clock,
  Video,
  Building2,
  DollarSign,
  Shield,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  User,
  FileText,
  Award,
  Stethoscope,
  Globe,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import Navigation from '@/components/user/Navigation';
import { IDoctorResponseDTO } from '@/interfaces/api/doctor/doctor.api.interface';
import { doctorServiceApi } from '@/services/doctorApiService';
import { use } from 'react';
import { availabilityApiService } from '@/services/availabilityApiService';
import { AppointmentType } from '@/interfaces/user/appointment.interface';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { paymentServiceApi } from '@/services/paymentApiService';
import { appointmentServiceApi } from '@/services/appointmentApiService';

interface IDoctorUI {
  id: string;
  name: string;
  avatar: string;
  email: string;
  status: string;
  certificates: string[];
  // personal
  username: string;
  gender: string;
  phone: string;
  country: string;
  state: string;
  experience: number;
  bio: string;
  specializations: string[];
  languages: string[];
  registrationNumber: string;
  preferredMode: string;
  profileVisibility: boolean;
  // clinic
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicCountry: string;
  workingDays: string;
  // consultation
  consultationType: string;
  consultationModes: string[];
  consultationFee: number;
  inPersonFee: number;
  videoFee: number;
  duration: number;
  sessionBufferTime: string;
  cancellationPolicy: string;
}

interface DaySlot {
  date: Date;
  sessions: { startTime: string; endTime: string }[];
  isAvailable: boolean;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const getTimezoneForCountry = async (country: string): Promise<string> => {
  try {
    const countryTimezoneMap: { [key: string]: string } = {
      'United States': 'America/New_York',
      'USA': 'America/New_York',
      'United Kingdom': 'Europe/London',
      'UK': 'Europe/London',
      'India': 'Asia/Kolkata',
      'Australia': 'Australia/Sydney',
      'Canada': 'America/Toronto',
      'Germany': 'Europe/Berlin',
      'France': 'Europe/Paris',
      'Japan': 'Asia/Tokyo',
      'China': 'Asia/Shanghai',
      'Brazil': 'America/Sao_Paulo',
      'Mexico': 'America/Mexico_City',
      'Singapore': 'Asia/Singapore',
      'UAE': 'Asia/Dubai',
      'South Africa': 'Africa/Johannesburg',
    };

    const timezone = countryTimezoneMap[country];
    if (timezone) return timezone;

    const response = await fetch(`https://worldtimeapi.org/api/timezone`);
    const timezones = await response.json();

    const matchingTimezone = timezones.find((tz: string) =>
      tz.toLowerCase().includes(country.toLowerCase())
    );

    return matchingTimezone || 'UTC';
  } catch (error) {
    console.error('Error fetching timezone:', error);
    return 'UTC';
  }
};

const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const convertToUserTime = (date: Date, timezone: string): Date => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value || "0";

  return new Date(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );
};

const formatTimeWithTimezone = (date: Date, timezone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
};

const getTimezoneAbbreviation = (timezone: string): string => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || timezone;
  } catch (error) {
    return timezone;
  }
};

// ─── Safe date-only parser ────────────────────────────────────────────────────
// Parses both plain date strings ("2025-06-01") and full ISO timestamps
// ("2025-06-01T00:00:00.000Z") always as a LOCAL midnight date so there is
// never a timezone-induced day shift when comparing against selectedDate.
const parseDateOnly = (value: string | null | undefined): Date | null => {
  if (!value) return null;

  // Extract just the YYYY-MM-DD portion regardless of whether a time/tz is present
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  // Construct as local midnight — avoids UTC-to-local day shift
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0);
};

const transformDoctor = (d: IDoctorResponseDTO): IDoctorUI => {
  const p = d.profile?.personal;
  const c = d.profile?.clinic;
  const s = d.profile?.consultationSettings;
  return {
    id: d.id,
    name: d.fullName,
    avatar: d.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.fullName}`,
    email: d.email || '',
    status: d.status || '',
    certificates: d.certificates || [],
    username: p?.username || '',
    gender: p?.gender || '',
    phone: p?.phone || '',
    country: p?.country || '',
    state: p?.state || '',
    experience: parseInt(p?.experience, 10) || 0,
    bio: p?.bio || '',
    specializations: p?.specializations || [],
    languages: p?.languages || ['English'],
    registrationNumber: p?.registrationNumber || '',
    preferredMode: p?.preferredMode || '',
    profileVisibility: p?.profileVisibility ?? true,
    clinicName: c?.name || '',
    clinicAddress: c?.address || '',
    clinicPhone: c?.phoneNumber || '',
    clinicCountry: c?.country || '',
    workingDays: c?.workingDays || '',
    consultationType: s?.type || '',
    consultationModes: s?.consultationModes || [],
    consultationFee: parseFloat(s?.consultationFee) || 0,
    inPersonFee: parseFloat(s?.inPersonFee) || 0,
    videoFee: parseFloat(s?.videoFee) || 0,
    duration: parseInt(s?.duration, 10) || 30,
    sessionBufferTime: s?.sessionBufferTime || '',
    cancellationPolicy: s?.cancellationPolicy || '',
  };
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getMondayOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatTime12 = (time24: string): string => {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();


const DoctorProfilePage = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const doctorId = resolvedParams.id;
  const [rawDoctor, setRawDoctor] = useState<IDoctorResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorTimezone, setDoctorTimezone] = useState<string>('UTC');
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [timezoneLoading, setTimezoneLoading] = useState(true);

  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const response = await doctorServiceApi.get({ input: { doctorId } }, `
          id
          fullName
          email
          status
          profilePhoto
          certificates
          profile {
            personal {
              username
              gender
              phone
              country
              state
              experience
              bio
              specializations
              languages
              registrationNumber
              preferredMode
              profileVisibility
            }
            clinic {
              name
              address
              phoneNumber
              country
              workingDays
            }
            consultationSettings {
              type
              consultationModes
              consultationFee
              inPersonFee
              videoFee
              duration
              sessionBufferTime
              cancellationPolicy
            }
          }
        `);
        setRawDoctor(response?.data?.getDoctor);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [doctorId]);

  const doctor = useMemo(() => (rawDoctor ? transformDoctor(rawDoctor) : null), [rawDoctor]);

  useEffect(() => {
    const fetchTimezones = async () => {
      if (!doctor) return;

      setTimezoneLoading(true);
      try {
        const userTz = getUserTimezone();
        setUserTimezone(userTz);
        const doctorTz = await getTimezoneForCountry(doctor.country || doctor.clinicCountry);
        setDoctorTimezone(doctorTz);
      } catch (error) {
        console.error('Error setting timezones:', error);
      } finally {
        setTimezoneLoading(false);
      }
    };

    fetchTimezones();
  }, [doctor]);

  const [activeTab, setActiveTab] = useState<'overview' | 'appointment'>('overview');
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedMode, setSelectedMode] = useState<'ONLINE' | 'IN_CLINIC' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !doctor) return;

      setSlotsLoading(true);

      try {
        const response = await availabilityApiService.getSlotsBydate({
          input: { doctorId, date: selectedDate },
        });

        const slots: TimeSlot[] = response?.data?.getDoctorSlotsByDate || [];

        const availabilityResponse = await doctorServiceApi.get(
          { input: { doctorId } },
          `
        availabilities {
          startDate
          endDate
          timezone
        }
      `
        );

        const availability = availabilityResponse?.data?.getDoctor?.availabilities?.[0];

        // ─── FIX: Use parseDateOnly so "2025-06-01T00:00:00.000Z" or "2025-06-01"
        // are both treated as local-midnight dates, preventing a UTC→local day shift
        // that caused dates on the boundary to be incorrectly rejected.
        // When endDate is null/undefined the availability is open-ended (infinite).
        const startDate = parseDateOnly(availability?.startDate);
        const endDate   = parseDateOnly(availability?.endDate); // null when open-ended

        const isDateWithinRange = (date: Date): boolean => {
          // Normalise the selected date to local midnight for a pure date comparison
          const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

          // Must be on or after the start date
          if (startDate && d < startDate.getTime()) return false;

          // No endDate → open-ended availability, always in range
          if (!endDate) return true;

          // Must be on or before the end date
          return d <= endDate.getTime();
        };

        if (!isDateWithinRange(selectedDate)) {
          setAvailableSlots([]);
          setSlotsLoading(false);
          return;
        }

        const now = new Date();

        const convertedSlots = slots
          .map((slot) => {
            const start = convertToUserTime(new Date(slot.startTime), userTimezone);
            const end = convertToUserTime(new Date(slot.endTime), userTimezone);

            return {
              startTime: start,
              endTime: end,
            };
          })
          .filter((slot) => {
            const toDateString = (date: Date) => {
              return date.toISOString().split("T")[0];
            };
            const sameDay =
              toDateString(slot.startTime) === toDateString(selectedDate);
            const notExpired = slot.startTime.getTime() > now.getTime();
            return sameDay && notExpired;
          });

        setAvailableSlots(convertedSlots);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId, userTimezone]);

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentMonday);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentMonday]);

  const navigateWeek = (dir: -1 | 1) => {
    setCurrentMonday(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + dir * 7);
      return next;
    });
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleBooking = async () => {
    try {
      if (!selectedSlot || !selectedDate || !selectedMode) {
        toast.error("Please select all booking details");
        return;
      }

      const now = new Date();
      const slotStart = new Date(selectedSlot.startTime);
      const slotEnd = new Date(selectedSlot.endTime);

      const BUFFER_MINUTES = 0;
      const bufferMs = BUFFER_MINUTES * 60 * 1000;

      if (slotStart.getTime() <= now.getTime() + bufferMs) {
        toast.error("This time slot has already passed.");

        setShowConfirmModal(false);
        setSelectedSlot(null);

        const refreshedSlots = availableSlots.filter(
          slot => new Date(slot.startTime).getTime() > now.getTime()
        );

        setAvailableSlots(refreshedSlots);
        return;
      }

      const durationInMinutes =
        (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);

      const appointmentType =
        selectedMode === "ONLINE"
          ? AppointmentType.ONLINE
          : AppointmentType.OFFLINE;

      const payload = {
        doctorId: doctor?.id as string,
        session: {
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
        },
        appointmentType,
        amount: activeFee,
        slotDuration: durationInMinutes || 15,
        bufferTime: 5,
      };

      const result = await appointmentServiceApi.create({ input: payload });

      if (result?.errors?.[0]?.message === "Forbidden resource") {
        toast.error("Please log in...");
        router.push("/login");
        return;
      }

      if (result?.errors) {
        toast.error(result?.errors?.[0]?.message || "Internal Error");
        return;
      }

      const appointmentId = result?.data?.createAppointment
      console.log('the appointment id: ', appointmentId)

      const response = await paymentServiceApi.createCheckoutSession({
        input: { appointmentId }, fields: `
          url
        `})

      if (response?.errors) {
        toast.error('Failed to create a payment session!')
        return;
      }

      const checkoutUrl = response?.data?.createPaymentSession?.url
      console.log('the checkout url from the server: ', checkoutUrl)

      if (!checkoutUrl) {
        toast.error("Invalid checkout session");
        return;
      }

      window.location.href = checkoutUrl;

      setAppointmentBooked(true);

      setTimeout(() => {
        setShowConfirmModal(false);
        setAppointmentBooked(false);
        setSelectedSlot(null);
        setSelectedDate(null);
        setSelectedMode(null);
      }, 2800);

    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Something went wrong while booking.");
    }
  };

  const handleChat = async (doctorId: string) => {
    router.push(`/messages?id=${doctorId}`)
  }

  const activeFee = useMemo(() => {
    if (!doctor) return 0;
    if (selectedMode === 'ONLINE' && doctor.videoFee > 0) return doctor.videoFee;
    if (selectedMode === 'IN_CLINIC' && doctor.inPersonFee > 0) return doctor.inPersonFee;
    return doctor.consultationFee;
  }, [doctor, selectedMode]);

  const handleCertificateClick = (certificateUrl: string) => {
    setSelectedCertificate(certificateUrl);
    setCertificateModalOpen(true);
  };

  if (isLoading || !doctor) {
    return (
      <div className="min-h-screen bg-[#f8f6fb]">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 bg-gray-200 rounded-lg w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-9 bg-gray-200 rounded-lg w-32" />
                    <div className="h-9 bg-gray-200 rounded-lg w-32" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded-lg w-28" />
              <div className="h-10 bg-gray-200 rounded-lg w-40" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6fb]">
      <Navigation />

      {/* ── Back Bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#9b7ab8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-800 font-medium">{doctor.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {/* gradient banner */}
          <div className="h-36 bg-gradient-to-r from-[#9b7ab8] via-[#b399c9] to-[#7d5d9a] relative">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
            />
          </div>

          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              {/* avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-purple-100">
                  <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                {doctor.status === 'ACTIVE' && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full block" />
                )}
              </div>

              {/* name + meta */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{doctor.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                </div>
                <p className="text-[#9b7ab8] font-semibold text-lg mb-1">
                  {doctor.specializations.join(', ') || 'General Physician'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    {doctor.experience} {doctor.experience === 1 ? 'year' : 'years'} experience
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {doctor.clinicAddress || doctor.clinicCountry || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-gray-400" />
                    {doctor.languages.join(', ')}
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 flex-shrink-0 mt-2 sm:mt-0">
                <button
                  onClick={() => setActiveTab('appointment')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                >
                  Book Appointment
                </button>
                <button onClick={() => handleChat(doctor.id)} className="px-5 py-2.5 border-2 border-[#9b7ab8] text-[#9b7ab8] rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all active:scale-95">
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timezone info banner */}
        {!timezoneLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">Timezone Information</p>
              <p className="text-xs text-blue-700 mt-1">
                Doctor's timezone: <span className="font-semibold">{getTimezoneAbbreviation(doctorTimezone)}</span> ·
                Your timezone: <span className="font-semibold">{getTimezoneAbbreviation(userTimezone)}</span>
                {doctorTimezone !== userTimezone && (
                  <span className="block mt-1">All appointment times are shown in your local timezone.</span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {(['overview', 'appointment'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all',
                activeTab === tab
                  ? 'bg-[#9b7ab8] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#9b7ab8] hover:text-[#9b7ab8]'
              ].join(' ')}
            >
              {tab === 'appointment' ? 'Book Appointment' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left / Main ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* About */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#9b7ab8]" /> About
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {doctor.bio || 'No bio available at this time.'}
                </p>
              </div>

              {/* Specializations */}
              {doctor.specializations.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#9b7ab8]" /> Specializations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {doctor.specializations.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-purple-50 text-[#9b7ab8] text-sm font-medium rounded-full border border-purple-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {doctor.certificates.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#9b7ab8]" /> Certificates & Qualifications
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctor.certificates.map((cert, i) => (
                      <button
                        key={i}
                        onClick={() => handleCertificateClick(cert)}
                        className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 hover:shadow-md transition-all group text-left"
                      >
                        <div className="w-8 h-8 bg-[#9b7ab8] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-700 font-medium block mb-1">Certificate {i + 1}</span>
                          <span className="text-xs text-gray-500">Click to view</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {doctor.cancellationPolicy && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#9b7ab8]" /> Cancellation Policy
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{doctor.cancellationPolicy}</p>
                </div>
              )}
            </div>

            <div className="space-y-5">

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#9b7ab8]" /> Consultation Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Modes</span>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {doctor.consultationModes.includes('ONLINE') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#9b7ab8] text-xs font-semibold rounded-full border border-purple-200">
                          <Video className="w-3.5 h-3.5" /> Online – ${doctor.videoFee || doctor.consultationFee}
                        </span>
                      )}
                      {doctor.consultationModes.includes('IN_CLINIC') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#9b7ab8] text-xs font-semibold rounded-full border border-purple-200">
                          <Building2 className="w-3.5 h-3.5" /> In-Clinic – ${doctor.inPersonFee || doctor.consultationFee}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                    <span className="text-sm font-semibold text-gray-800">{doctor.duration} min</span>
                  </div>
                  {doctor.sessionBufferTime && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Buffer</span>
                      <span className="text-sm font-semibold text-gray-800">{doctor.sessionBufferTime} min</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Base Fee</span>
                    <span className="text-sm font-bold text-gray-800">${doctor.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Clinic Info card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#9b7ab8]" /> Clinic Info
                </h2>
                <div className="space-y-3">
                  {doctor.clinicName && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Clinic</span>
                      <p className="text-sm text-gray-700 font-medium mt-0.5">{doctor.clinicName}</p>
                    </div>
                  )}
                  {doctor.clinicAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{doctor.clinicAddress}, {doctor.clinicCountry}</p>
                    </div>
                  )}
                  {doctor.clinicPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{doctor.clinicPhone}</p>
                    </div>
                  )}
                  {doctor.workingDays && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{doctor.workingDays}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#9b7ab8]" /> Contact
                </h2>
                <div className="space-y-3">
                  {doctor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{doctor.email}</p>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{doctor.phone}</p>
                    </div>
                  )}
                  {doctor.registrationNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">Reg: {doctor.registrationNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">

              {/* Consultation Mode selector */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 mb-3">Select Consultation Mode</h2>
                <div className="flex gap-3 flex-wrap">
                  {doctor.consultationModes.map(mode => {
                    const isOnline = mode === 'ONLINE';
                    const fee = isOnline ? (doctor.videoFee || doctor.consultationFee) : (doctor.inPersonFee || doctor.consultationFee);
                    const active = selectedMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode as 'ONLINE' | 'IN_CLINIC')}
                        className={[
                          'flex-1 min-w-0 flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                          active
                            ? 'border-[#9b7ab8] bg-purple-50 shadow-sm'
                            : 'border-gray-200 hover:border-purple-300'
                        ].join(' ')}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#9b7ab8]' : 'bg-gray-100'}`}>
                          {isOnline
                            ? <Video className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                            : <Building2 className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{isOnline ? 'Online' : 'In-Clinic'}</p>
                          <p className="text-xs text-gray-500">${fee}</p>
                        </div>
                        {active && <Check className="w-5 h-5 text-[#9b7ab8] ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week calendar */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-gray-800">Select a Date</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateWeek(-1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-semibold text-gray-700 w-40 text-center">
                      {MONTHS[currentMonday.getMonth()]} {currentMonday.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateWeek(1)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((date, i) => {
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    const isWeekend = date.getDay() === 0;
                    const isAvailable = !isPast && !isWeekend;

                    return (
                      <button
                        key={i}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={[
                          'flex flex-col items-center p-2 rounded-xl transition-all',
                          isSelected
                            ? 'bg-[#9b7ab8] text-white shadow-md'
                            : isAvailable
                              ? 'hover:bg-purple-50 border border-gray-100'
                              : 'opacity-35 cursor-not-allowed'
                        ].join(' ')}
                      >
                        <span className={`text-xs font-semibold mb-1 ${isSelected ? 'text-purple-200' : 'text-gray-400'}`}>
                          {DAYS[date.getDay()]}
                        </span>
                        <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {date.getDate()}
                        </span>
                        {isToday && !isSelected && (
                          <span className="w-1.5 h-1.5 bg-[#9b7ab8] rounded-full mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-bold text-gray-800">
                      Available Time Slots
                    </h2>
                    {!timezoneLoading && doctorTimezone !== userTimezone && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {getTimezoneAbbreviation(userTimezone)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    {DAYS[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()} · {doctor.duration}-min sessions
                  </p>

                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b7ab8]" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {availableSlots.map((slot, i) => {
                        const active = selectedSlot?.startTime.getTime() === slot.startTime.getTime();
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'p-3 rounded-xl text-left transition-all border',
                              active
                                ? 'bg-[#9b7ab8] border-[#9b7ab8] text-white shadow-md'
                                : 'border-gray-200 hover:border-[#9b7ab8] hover:bg-purple-50'
                            ].join(' ')}
                          >
                            <p className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-800'}`}>
                              {formatTimeWithTimezone(slot.startTime, userTimezone)}
                            </p>
                            <p className={`text-xs ${active ? 'text-purple-200' : 'text-gray-400'}`}>
                              – {formatTimeWithTimezone(slot.endTime, userTimezone)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No slots available for this day.</p>
                      <p className="text-xs text-gray-400 mt-1">Please try another date.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: Booking summary ── */}
            <div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <h2 className="text-base font-bold text-gray-800 mb-4">Booking Summary</h2>

                <div className="space-y-3">
                  {/* Doctor mini */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-full object-cover border-2 border-purple-200" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{doctor.name}</p>
                      <p className="text-xs text-gray-400">{doctor.specializations[0] || 'General Physician'}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Mode</span>
                      <span className={`text-sm font-semibold ${selectedMode ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                        {selectedMode === 'ONLINE' ? '🎥 Online' : selectedMode === 'IN_CLINIC' ? '🏥 In-Clinic' : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Date</span>
                      <span className={`text-sm font-semibold ${selectedDate ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                        {selectedDate
                          ? `${DAYS[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Time</span>
                      <span className={`text-sm font-semibold ${selectedSlot ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                        {selectedSlot
                          ? `${formatTimeWithTimezone(selectedSlot.startTime, userTimezone)} – ${formatTimeWithTimezone(selectedSlot.endTime, userTimezone)}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Duration</span>
                      <span className="text-sm font-semibold text-gray-800">{doctor.duration} min</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                    <span className="text-sm font-semibold text-gray-600">Total Fee</span>
                    <span className="text-xl font-bold text-gray-800 flex items-center">
                      <DollarSign className="w-5 h-5" />{selectedMode ? activeFee : doctor.consultationFee}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!selectedMode || !selectedDate || !selectedSlot}
                  onClick={() => setShowConfirmModal(true)}
                  className={[
                    'w-full mt-5 px-4 py-3 rounded-xl font-semibold text-sm transition-all',
                    selectedMode && selectedDate && selectedSlot
                      ? 'bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  ].join(' ')}
                >
                  Confirm Appointment
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  {doctor.cancellationPolicy || 'Free cancellation up to 24 hours before.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CERTIFICATE MODAL */}
      {certificateModalOpen && selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setCertificateModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#9b7ab8]" />
                Certificate
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={selectedCertificate}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Download certificate"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                </a>
                <button
                  onClick={() => setCertificateModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={selectedCertificate}
                alt="Certificate"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {showConfirmModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !appointmentBooked && setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">

            {appointmentBooked ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Appointment Confirmed!</h3>
                <p className="text-sm text-gray-500">
                  Your appointment with {doctor.name} has been booked successfully.
                </p>
                <div className="mt-4 p-3 bg-purple-50 rounded-xl text-left text-sm text-gray-600 space-y-1">
                  <p><span className="font-semibold text-gray-800">Date:</span> {selectedDate && `${DAYS[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`}</p>
                  <p><span className="font-semibold text-gray-800">Time:</span> {formatTimeWithTimezone(selectedSlot.startTime, userTimezone)} – {formatTimeWithTimezone(selectedSlot.endTime, userTimezone)}</p>
                  <p><span className="font-semibold text-gray-800">Mode:</span> {selectedMode === 'ONLINE' ? 'Online' : 'In-Clinic'}</p>
                  <p><span className="font-semibold text-gray-800">Fee:</span> ${activeFee}</p>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>

                <h3 className="text-lg font-bold text-gray-800 mb-1">Confirm Your Appointment</h3>
                <p className="text-sm text-gray-500 mb-5">Please review the details below before confirming.</p>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Doctor</span>
                    <span className="text-sm font-semibold text-gray-800">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Mode</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedMode === 'ONLINE' ? 'Online' : 'In-Clinic'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedDate && `${DAYS[selectedDate.getDay()]}, ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatTimeWithTimezone(selectedSlot.startTime, userTimezone)} – {formatTimeWithTimezone(selectedSlot.endTime, userTimezone)}
                    </span>
                  </div>
                  {doctorTimezone !== userTimezone && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                      <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        Time shown in your timezone ({getTimezoneAbbreviation(userTimezone)})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-600">Total</span>
                    <span className="text-base font-bold text-[#9b7ab8]">${activeFee}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
                  >
                    Pay & Book
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfilePage;