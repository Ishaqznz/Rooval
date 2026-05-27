'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Award
} from 'lucide-react';

// Types and Interfaces
import { Doctor } from '@/interfaces/common/admin.interface';
import { DoctorListingProps } from '@/interfaces/common/admin.interface';
import { CHANGE_DOCTOR_STATUS, DELETE_DOCTOR } from '@/graphql/queries/doctor';
import { apiRequest } from '@/api';
import { doctorServiceApi } from '@/services/doctorApiService';


// Sample data
const sampleDoctors: Doctor[] = [
  {
    id: '1',
    fullName: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
  },
  {
    id: '2',
    fullName: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
  },
  {
    id: '3',
    fullName: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
  },
  {
    id: '4',
    fullName: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
  },
  {
    id: '6',
    fullName: 'Dr. Robert Davis',
    email: 'robert.davis@example.com',
  }
];

// DoctorListing Component
const DoctorListing: React.FC<DoctorListingProps> = ({ doctors = sampleDoctors }) => {
  console.log('doctors list in the Doctot Listing Component: ', doctors);
  const [doctorList, setDoctorList] = useState<Doctor[]>(doctors);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllDoctors = async () => {
      const response = await doctorServiceApi.findDoctors()
      console.log('the response from the server for all doctors: ', response)
      setDoctorList(response?.data?.findDoctors || doctors)
    }

    fetchAllDoctors()
  }, [doctors])

  console.log('Doctor list: ', doctorList);
  const filteredDoctors = doctorList.filter(doctor => {

    const fullName = doctor.fullName || '';
    const email = doctor.email || '';
    const specialization = doctor.specialization || '';
    const licenseNumber = doctor.licenseNumber || '';

    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    const matchesSpecialization = specializationFilter === 'all' || doctor.specialization === specializationFilter;

    return matchesSearch && matchesStatus && matchesSpecialization;
  });



  // Approve doctor
  const approveDoctor = async (doctorId: string): Promise<void> => {
    console.log('doctor id after clicking the approve: ', doctorId)
    setDoctorList(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === doctorId
          ? { ...doctor, status: 'accepted' }
          : doctor
      )
    );

    const QUERY = {
      query: CHANGE_DOCTOR_STATUS.query,
      variables: {
        input: {
          userId: doctorId,
          status: 'accepted'
        }
      }
    }

    const response = await apiRequest(QUERY, 'change_doctor_status!')
    console.log('resonse after approving doctor in front end: ', response)
    setDropdownOpen(null);
  };

  // Reject doctor
  const rejectDoctor = async (doctorId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to reject this doctor application?')) {
      setDoctorList(prevDoctors =>
        prevDoctors.map(doctor =>
          doctor.id === doctorId
            ? { ...doctor, status: 'rejected' }
            : doctor
        )
      );
    }

    const QUERY = {
      query: CHANGE_DOCTOR_STATUS.query,
      variables: {
        input: {
          userId: doctorId,
          status: 'rejected'
        }
      }
    }

    const response = await apiRequest(QUERY, 'change_doctor_status!')
    console.log('resonse after approving doctor in front end: ', response)
    setDropdownOpen(null);
  };

  // Allow reapply (change from rejected to pending)
  const allowReapply = async (doctorId: string): Promise<void> => {
    setDoctorList(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === doctorId
          ? { ...doctor, status: 'applied', applicationDate: new Date().toISOString().split('T')[0] }
          : doctor
      )
    );

    const QUERY = {
      query: CHANGE_DOCTOR_STATUS.query,
      variables: {
        input: {
          userId: doctorId,
          status: 'reapply'
        }
      }
    }

    const response = await apiRequest(QUERY, 'change_doctor_status!')
    console.log('resonse after approving doctor in front end: ', response)
    setDropdownOpen(null);
  };

  // Block/Unblock doctor
  const toggleDoctorStatus = (doctorId: string): void => {
    setDoctorList(prevDoctors =>
      prevDoctors.map(doctor =>
        doctor.id === doctorId
          ? {
            ...doctor,
            status: doctor.status === 'rejected' ? 'accepted' : 'rejected'
          }
          : doctor
      )
    );
    setDropdownOpen(null);
  };

  // Delete doctor
  const deleteDoctor = async (doctorId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctorList(prevDoctors => prevDoctors.filter(doctor => doctor.id !== doctorId));
    }

    const QUERY = {
      query: DELETE_DOCTOR.query,
      variables: {
        input: {
          userId: doctorId,
        }
      }
    }

    const response = await apiRequest(QUERY, 'delete_doctor_status!')
    console.log('resonse after approving doctor in front end: ', response)

    setDropdownOpen(null);
  };

  // Get avatar initials
  const getAvatarInitials = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique specializations for filter
  const uniqueSpecializations = Array.from(new Set(doctors.map(doctor => doctor.specialization)));

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      blocked: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle }, // 👈 added active
    };

    const normalizedStatus = status?.toLowerCase();

    const config =
      statusConfig[normalizedStatus as keyof typeof statusConfig] ??
      { bg: 'bg-gray-200', text: 'text-gray-700', icon: AlertCircle };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}
      >
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };


  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Doctor Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage doctor applications and profiles
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Specializations</option>
              {uniqueSpecializations.map(specialization => (
                <option key={specialization} value={specialization}>{specialization}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDoctors.length} of {doctorList.length} doctors
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact & Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialization
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patients
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor: Doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {doctor.avatar ? (
                          <img className="h-12 w-12 rounded-full object-cover" src={doctor.avatar} alt={doctor.fullName} />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {getAvatarInitials(doctor.fullName)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{doctor.fullName}</div>
                        <div className="text-xs text-gray-500">{doctor.qualification}</div>
                        <div className="text-xs text-gray-500">License: {doctor.licenseNumber}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Mail size={14} className="text-gray-400 mr-2" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <Phone size={14} className="text-gray-400 mr-2" />
                        {doctor.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="text-gray-400 mr-2" />
                        <span className="truncate">{doctor.location}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.specialization}</div>
                    {doctor.rating || 0 > 0 && (
                      <div className="flex items-center mt-1">
                        <Award size={14} className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{doctor.rating}/5.0</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doctor.status || '')}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.experience}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users size={14} className="text-gray-400 mr-2" />
                      {doctor.patientsCount}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar size={14} className="text-gray-400 mr-2" />
                      {formatDate(!doctor.applicationDate ? ' ' : doctor.applicationDate)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === doctor.id ? null : doctor.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {dropdownOpen === doctor.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                          <div className="py-1">
                            {/* <button
                              onClick={() => { Handle view }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye size={14} className="mr-2" />
                              View Profile
                            </button> */}

                            {/* <button
                              onClick={() => { Handle edit }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit size={14} className="mr-2" />
                              Edit Doctor
                            </button> */}

                            {doctor.status === 'applied' && (
                              <>
                                <button
                                  onClick={() => approveDoctor(doctor.id)}
                                  className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                >
                                  <CheckCircle size={14} className="mr-2" />
                                  Approve
                                </button>

                                <button
                                  onClick={() => rejectDoctor(doctor.id)}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <X size={14} className="mr-2" />
                                  Reject
                                </button>
                              </>
                            )}

                            {doctor.status === 'rejected' && (
                              <button
                                onClick={() => allowReapply(doctor.id)}
                                className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                              >
                                <RefreshCw size={14} className="mr-2" />
                                Allow Reapply
                              </button>
                            )}

                            {(doctor.status === 'accepted' || doctor.status === 'rejected') && (
                              <button
                                onClick={() =>
                                  doctor.status === 'accepted'
                                    ? rejectDoctor(doctor.id) // call reject
                                    : approveDoctor(doctor.id) // call approve
                                }
                                className={`flex items-center px-4 py-2 text-sm w-full text-left ${doctor.status === 'accepted'
                                  ? 'text-red-700 hover:bg-red-50'
                                  : 'text-green-700 hover:bg-green-50'
                                  }`}
                              >
                                {doctor.status === 'accepted' ? (
                                  <>
                                    <AlertCircle size={14} className="mr-2" />
                                    Reject Doctor
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} className="mr-2" />
                                    Approve Doctor
                                  </>
                                )}
                              </button>
                            )}


                            <button
                              onClick={() => deleteDoctor(doctor.id)}
                              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Doctor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No doctors found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setDropdownOpen(null)}
        ></div>
      )}
    </div>
  );
};

export default DoctorListing;