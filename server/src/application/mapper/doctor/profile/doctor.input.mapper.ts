import { IDoctorOnboardingRequestDTO } from "src/application/dto/doctor/profile/request/onboarding.request";
import { IUpdateProfileRequestDTO } from "src/application/dto/doctor/profile/request/updateProfile.request.dto";
import { DoctorOnboarding } from "src/core/entities/doctor/profile/onboarding.entity";
import { DoctorProfileUpdate } from "src/core/entities/doctor/profile/updateProfile.entity";

export class DoctorInputMapper {
    static toOnboardingEntity(onboardingData: IDoctorOnboardingRequestDTO): DoctorOnboarding {
        return DoctorOnboarding.create(
            onboardingData.username,
            onboardingData.gender,
            onboardingData.phone,
            onboardingData.registrationNumber,
            onboardingData.country,
            onboardingData.state,
            onboardingData.experience,
            onboardingData.bio,
            onboardingData.specializations,
            onboardingData.consultationModes,
            onboardingData.consultationFee,
            onboardingData.languages,
            onboardingData.consultationDuration,
            onboardingData.preferredMode,
            onboardingData.acceptingPatients,
            onboardingData.profileVisibility,
            onboardingData.id,
        )
    }

    static toUpdateProfileEntity(updateProfile: IUpdateProfileRequestDTO): DoctorProfileUpdate {
        return DoctorProfileUpdate.create({
            fullName: updateProfile?.fullName,
            phoneNumber: updateProfile?.phoneNumber,
            registrationNumber: updateProfile?.registrationNumber,
            bio: updateProfile?.bio,
            clinic:
            {
                name: updateProfile?.clinic?.name,
                address: updateProfile?.clinic?.address,
                phoneNumber: updateProfile?.clinic?.phoneNumber,
                country: updateProfile?.clinic?.country,
                workingDays: updateProfile?.clinic?.workingDays
            },
            consultationSettings:
            {
                type: updateProfile?.consultationSettings?.type,
                inPersonFee: updateProfile?.consultationSettings?.inPersonFee,
                videoFee: updateProfile?.consultationSettings?.videoFee,
                duration: updateProfile?.consultationSettings?.duration,
                sessionBufferTime: updateProfile?.consultationSettings?.sessionBufferTime,
                cancellationPolicy: updateProfile?.consultationSettings?.cancellationPolicy
            }
        }
        )
    }
}