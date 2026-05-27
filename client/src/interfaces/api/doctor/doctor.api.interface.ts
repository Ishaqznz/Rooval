export interface IListDoctorsResponseDTO {
  doctors: IDoctorResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IListDoctorsRequestDTO {
  pagination: {
    page: number;
    limit: number;
  };
  sorting: {
    sortBy: string;
    order: string;
  };
  filter: {
    search?: string;
    specialization?: string[];
    city?: string;
    consultationType?: string;
    minExperience?: number;
    minFee?: number;
    maxFee?: number;
    minRating?: number;
    availableToday?: boolean;
  };
}

export interface IDoctorResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  profile: IDoctorProfile;
  profilePhoto: string;
  certificates: string[];
}

export interface IDoctorProfile {
    personal: {
        username: string
        gender: string
        phone: string
        country: string
        state: string
        experience: string
        bio: string
        specializations: [string]
        languages: [string]
        registrationNumber: string
        preferredMode: string
        profileVisibility: boolean
    }

    clinic: {
        name: string
        address: string
        phoneNumber: string
        country: string
        workingDays: string
    }

    consultationSettings: {
        type: string
        consultationModes: [string]
        consultationFee: string
        inPersonFee: string
        videoFee: string
        duration: string
        sessionBufferTime: string
        cancellationPolicy: string
    }
}