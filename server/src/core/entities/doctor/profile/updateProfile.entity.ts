export class DoctorProfileUpdate {
  constructor(
    public readonly fullName?: string,
    public readonly phoneNumber?: string,
    public readonly registrationNumber?: string,
    public readonly bio?: string,
    public readonly clinic?: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      country?: string;
      workingDays?: string;
    },
    public readonly consultationSettings?: {
      type?: string;
      inPersonFee?: number;
      videoFee?: number
      duration?: number;
      sessionBufferTime?: string;
      cancellationPolicy?: string;
    }
  ) {}

  static create(data: {
    fullName?: string;
    phoneNumber?: string;
    registrationNumber?: string;
    bio?: string;
    clinic?: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      country?: string;
      workingDays?: string;
    };
    consultationSettings?: {
      type?: string;
      inPersonFee?: number;
      videoFee?: number
      duration?: number;
      sessionBufferTime?: string;
      cancellationPolicy?: string;
    };
  }): DoctorProfileUpdate {
    return new DoctorProfileUpdate(
      data.fullName,
      data.phoneNumber,
      data.registrationNumber,
      data.bio,
      data.clinic,
      data.consultationSettings
    );
  }
}
