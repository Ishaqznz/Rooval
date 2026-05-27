export enum DoctorErrorType {
    DoctorIsNotExisted = 'Doctor is not existed!',
    DoctorNotFound = 'Doctor Not Found!',
    PasswordMismatch = 'Password Mismatch!'
}

export enum ConsultationType {
  ONLINE = "ONLINE",
  IN_PERSON = "IN_PERSON"
}

export enum DoctorSortBy {
  RATING = 'rating',
  EXPERIENCE = 'experience',
  FEE = 'FEE',
  AVAILABILITY = 'availability'
}

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc'
}


export enum DoctorStatusFilter {
  ALL = "all",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum ConsultationFilter {
  ALL = "all",
  ONLINE = "ONLINE",
  IN_CLINIC = "IN_CLINIC",
  BOTH = "BOTH",
}

export enum DoctorSortField {
  FULLNAME = "fullName",
  EMAIL = "email",
  CREATEDAT = "createdAt",
  EXPERIENCE = "experience",
}

export enum DoctorSortOrder {
  ASC = "asc",
  DESC = "desc",
}