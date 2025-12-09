import { IDoctorOnboardingRequestDTo } from "src/application/DTO/doctor/onboarding/onboarding.request";
import { DoctorOnboarding } from "src/core/entities/doctor/onboarding.entity";

export class DoctorInputMapper {
    static toOnboardingEntity(onboardingData: IDoctorOnboardingRequestDTo): DoctorOnboarding {
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
}