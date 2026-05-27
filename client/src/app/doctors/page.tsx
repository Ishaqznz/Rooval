'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Calendar,
  Clock,
  Languages,
  DollarSign,
  Star,
  Video,
  Building2,
  Filter,
  Shield
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/reusable/ui/pagination";
import Navigation from '@/components/user/Navigation';
import { IDoctorResponseDTO } from '@/interfaces/api/doctor/doctor.api.interface';
import { IListDoctorsRequestDTO } from '@/interfaces/api/doctor/doctor.api.interface';
import { doctorServiceApi } from '@/services/doctorApiService';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounced';

interface IDoctorUI {
  id: string;
  name: string;
  avatar: string;
  specialization: string[];
  experience: number;
  languages: string[];
  bio: string;
  clinicName: string;
  clinicAddress: string;
  workingDays: string;
  consultationModes: string[];
  consultationFee: number;
  inPersonFee: number;
  videoFee: number;
  duration: string;
  rating: number;
  reviewCount: number;
}

const transformDoctor = (doctor: IDoctorResponseDTO): IDoctorUI => {
  const personal = doctor.profile?.personal;
  const clinic = doctor.profile?.clinic;
  const consult = doctor.profile?.consultationSettings;

  return {
    id: doctor.id,
    name: doctor.fullName,
    avatar: doctor.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.fullName}`,
    specialization: personal?.specializations || 'General Physician',
    experience: parseInt(personal?.experience, 10) || 0,
    languages: personal?.languages || ['English'],
    bio: personal?.bio || '',
    clinicName: clinic?.name || '',
    clinicAddress: clinic?.address || '',
    workingDays: clinic?.workingDays || '',
    consultationModes: consult?.consultationModes || [],
    consultationFee: parseFloat(consult?.consultationFee) || 0,
    inPersonFee: parseFloat(consult?.inPersonFee) || 0,
    videoFee: parseFloat(consult?.videoFee) || 0,
    duration: consult?.duration || '',
    rating: 0,
    reviewCount: 0,
  };
};

const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Psychiatrist',
  'General Physician',
  'Neurologist',
  'ENT Specialist'
];

const ITEMS_PER_PAGE = 4;

const DoctorListingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('');
  const [experienceRange, setExperienceRange] = useState([0, 30]);
  const [feeRange, setFeeRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [availableToday, setAvailableToday] = useState(false);
  const [sortBy, setSortBy] = useState('RELEVANCE');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [doctors, setDoctors] = useState<IDoctorResponseDTO[]>([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter()

  const debouncedFeeRange = useDebounce(feeRange, 800);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDoctors = async () => {
    const scrollY = window.scrollY
    setIsLoading(true);
    try {
      const requestBody: IListDoctorsRequestDTO = {
        pagination: {
          page: currentPage,
          limit: ITEMS_PER_PAGE
        },
        sorting: {
          sortBy: sortBy === 'RELEVANCE' ? 'EXPERIENCE' : sortBy,
          order: sortOrder
        },
        filter: {
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(selectedSpecializations.length > 0 && { specialization: selectedSpecializations }),
          ...(selectedCity && { city: selectedCity }),
          ...(consultationType && { consultationType }),
          ...(experienceRange[0] > 0 && { minExperience: experienceRange[0] }),
          ...(debouncedFeeRange[0] > 0 && { minFee: debouncedFeeRange[0] }),
          ...(debouncedFeeRange[1] <= 1000 && { maxFee: debouncedFeeRange[1] }),
          ...(minRating > 0 && { minRating }),
          ...(availableToday && { availableToday: true })
        }
      };

      const response = await doctorServiceApi.list({ input: requestBody }, `
        doctors {
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
          availability {
            id
            sessions {
              startTime
              endTime
            }
          }
      }
      doctorsCount
      `);

      setDoctors(response?.data?.listDoctors?.doctors ?? []);
      setTotalDoctors(response?.data?.listDoctors?.doctorsCount || 0)
      setTotalPages(Math.ceil(response?.data?.listDoctors?.doctorsCount / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [
    currentPage,
    debouncedSearch,
    selectedSpecializations,
    selectedCity,
    consultationType,
    experienceRange,
    debouncedFeeRange,
    minRating,
    availableToday,
    sortBy,
    sortOrder
  ]);

  // --- helpers ----------------------------------------------------------------
  const clearFilters = () => {
    setSelectedSpecializations([]);
    setSelectedCity('');
    setConsultationType('');
    setExperienceRange([0, 30]);
    setFeeRange([0, 1000]);
    setMinRating(0);
    setAvailableToday(false);
    setSortBy('RELEVANCE');
    setSortOrder('DESC');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev => {
      if (prev.includes(spec)) {
        const newSpecs = prev.filter((sp) => sp !== spec)
        return newSpecs;
      }
      return [...prev, spec]
    }
    );
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');

    setSortBy(sortBy);
    setSortOrder(sortOrder);
    setCurrentPage(1);
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#9b7ab8]" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-[#9b7ab8] hover:text-[#7d5d9a] transition-colors font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Specialization */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 text-sm">Specialization</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {SPECIALIZATIONS.map(spec => (
            <label key={spec} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedSpecializations.includes(spec)}
                onChange={() => toggleSpecialization(spec)}
                className="w-4 h-4 rounded border-gray-300 text-[#9b7ab8] focus:ring-[#9b7ab8] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                {spec}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Consultation Type */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 text-sm">Consultation Type</h4>
        <div className="space-y-2">
          {(['ONLINE', 'IN_PERSON', ''] as const).map((mode) => (
            <label key={mode || 'both'} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="consultationType"
                checked={consultationType === mode}
                onChange={() => {
                  setConsultationType(mode);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 border-gray-300 text-[#9b7ab8] focus:ring-[#9b7ab8] focus:ring-offset-0 cursor-pointer"
              />
              {mode === 'ONLINE' && <Video className="w-4 h-4 text-gray-400" />}
              {mode === 'IN_PERSON' && <Building2 className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                {mode === 'ONLINE' ? 'Online' : mode === 'IN_PERSON' ? 'In-Clinic' : 'Both'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Available Today */}

      {/*<div className="pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={availableToday}
            onChange={(e) => {
              setAvailableToday(e.target.checked);
              setCurrentPage(1);
            }}
            className="w-4 h-4 rounded border-gray-300 text-[#9b7ab8] focus:ring-[#9b7ab8] focus:ring-offset-0 cursor-pointer"
          />
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            Available Today
          </span>
        </label>
      </div>
      */}

      {/* Experience */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 text-sm">Minimum Experience (Years)</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="30"
            value={experienceRange[0]}
            onChange={(e) => {
              setExperienceRange([parseInt(e.target.value), 30]);
              setCurrentPage(1);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9b7ab8]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span className="font-medium text-[#9b7ab8]">{experienceRange[0]} years</span>
            <span>30+ years</span>
          </div>
        </div>
      </div>

      {/* Fee Range */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 text-sm">Consultation Fee Range</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="1000"
              value={feeRange[0]}
              onChange={(e) => {
                setFeeRange([parseInt(e.target.value) || 0, feeRange[1]]);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              placeholder="Min"
            />
            <input
              type="number"
              min="0"
              max="200"
              value={feeRange[1]}
              onChange={(e) => {
                setFeeRange([feeRange[0], parseInt(e.target.value) || 1000]);
                // setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              placeholder="Max"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>${feeRange[0]}</span>
            <span>${feeRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 text-sm">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 0].map(rating => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => {
                  setMinRating(rating);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 border-gray-300 text-[#9b7ab8] focus:ring-[#9b7ab8] focus:ring-offset-0 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                {rating > 0 ? (
                  <>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-gray-600">{rating}+ Stars</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-600">All Ratings</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 text-sm">Sort By</h4>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-[#9b7ab8] focus:border-transparent transition-all"
        >
          <option value="RELEVANCE-DESC">Relevance</option>
          <option value="EXPERIENCE-DESC">Experience (High to Low)</option>
          <option value="FEE-ASC">Fee (Low to High)</option>
          <option value="FEE-DESC">Fee (High to Low)</option>
          <option value="RATING-DESC">Rating (High to Low)</option>
        </select>
      </div>
    </div>
  );

  const DoctorCard = ({ doctor: backendDoctor }: { doctor: IDoctorResponseDTO }) => {
    const doctor = transformDoctor(backendDoctor);

    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
        <div className="p-6">
          {/* Header */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-20 h-20 rounded-full border-3 border-purple-200 object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-[#9b7ab8] transition-colors">
                {doctor.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {doctor?.specialization?.map((spec, index) => (
                  <span
                    key={index}
                    className="text-sm text-[#9b7ab8] font-medium bg-[#f3e8ff] px-2 py-1 rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {doctor.experience} {doctor.experience === 1 ? 'year' : 'years'}
                </span>
                {doctor.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {doctor.rating} ({doctor.reviewCount})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-2.5 mb-4 pb-4 border-b border-gray-100">
            {/* Clinic name + address */}
            {doctor.clinicName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  {doctor.clinicName}{doctor.clinicAddress ? ` – ${doctor.clinicAddress}` : ''}
                </span>
              </div>
            )}

            {/* Languages */}
            {doctor.languages.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Languages className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{doctor.languages.join(', ')}</span>
              </div>
            )}

            {/* Working days */}
            {doctor.workingDays && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{doctor.workingDays}</span>
              </div>
            )}

            {/* Session duration */}
            {doctor.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Session: {doctor.duration} min </span>
              </div>
            )}
          </div>

          {/* Consultation Mode Tags + Fee */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              {doctor.consultationModes.includes('ONLINE') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#9b7ab8] text-xs font-medium rounded-full">
                  <Video className="w-3 h-3" />
                  Online
                  {doctor.videoFee > 0 && (
                    <span className="text-[#7d5d9a]">– ${doctor.videoFee}</span>
                  )}
                </span>
              )}
              {doctor.consultationModes.includes('IN_CLINIC') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#9b7ab8] text-xs font-medium rounded-full">
                  <Building2 className="w-3 h-3" />
                  In-Clinic
                  {doctor.inPersonFee > 0 && (
                    <span className="text-[#7d5d9a]">– ${doctor.inPersonFee}</span>
                  )}
                </span>
              )}
            </div>

            {/* Base consultation fee */}
            <div className="flex items-center gap-1 text-lg font-bold text-gray-800">
              <DollarSign className="w-5 h-5" />
              {doctor.consultationFee}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2.5 border-2 border-[#9b7ab8] text-[#9b7ab8] rounded-lg font-medium text-sm hover:bg-purple-50 transition-all active:scale-95"
              onClick={() => router.push(`/doctor/${doctor.id}`)}>
              View Profile
            </button>
            <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white rounded-lg font-medium text-sm hover:shadow-lg hover:scale-105 transition-all active:scale-95">
              Book Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
      <div className="animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalDoctors);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-6">
            <Shield className="w-4 h-4 text-[#9b7ab8]" />
            <span className="text-sm text-[#9b7ab8] font-medium">HIPAA Compliant & Secure</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              <span className="text-gray-800">Healthcare at Your </span>
              <span className="text-[#9b7ab8]">Fingertips</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Connect with certified doctors instantly. Get prescriptions, medical advice, and comprehensive care from the comfort of your home.
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or symptom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#9b7ab8] focus:border-[#9b7ab8] transition-all text-base shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <FilterSection />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-purple-50 transition-all shadow-sm"
              >
                <Filter className="w-5 h-5" />
                Filters & Sort
                {(selectedSpecializations.length > 0 || consultationType) && (
                  <span className="px-2 py-0.5 bg-[#9b7ab8] text-white text-xs rounded-full font-semibold">
                    {selectedSpecializations.length + (consultationType ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-800">{totalDoctors > 0 ? startIndex + 1 : 0}-{endIndex}</span> of <span className="font-semibold text-gray-800">{totalDoctors}</span> doctors
              </p>
            </div>

            {/* Doctor Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} />)}
              </div>
            ) : doctors.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {doctors.map(doctor => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 5) page = i + 1;
                          else if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-[#9b7ab8]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find the perfect doctor for you
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <FilterSection />
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar        { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track  { background: #f5f2f8; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb  { background: #c4b5d4; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9b7ab8; }
      `}</style>
    </div>
  );
};

export default DoctorListingPage;