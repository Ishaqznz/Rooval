import { Doctor } from "src/core/entities/doctor/profile/doctor.entity";
import { IMongoDoctorDocument } from "../interfaces/documents/mongo.doctor.document";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { UserErrorType } from "src/core/enums/user/user.enums";
import { ListDoctorsPayload } from "src/core/entities/doctor/profile/listDoctorsPayload.entity";

export class DoctorMapper {
  static toDoctorEntity(doctor: Partial<IMongoDoctorDocument>): Doctor {
    const doctorEntity = Doctor.create(
      doctor.fullName,
      doctor.email,
      doctor.status,
      'doctor',
      doctor.password,
      doctor.profile,
      doctor.profilePhoto,
      doctor.certificates,
      doctor._id.toString()
    )
    if (!doctorEntity.ok) throw new BusinessRuleViolationError(UserErrorType.ValidationFailed)
    return doctorEntity.value
  }

  static toDoctorEntities(doctors: IMongoDoctorDocument[]): Doctor[] {
    const doctorEntities = doctors.map((doctorDoc) => Doctor.create(
      doctorDoc.fullName,
      doctorDoc.email,
      doctorDoc.status,
      'doctor',
      doctorDoc.password,
      doctorDoc.profile,
      doctorDoc.profilePhoto,
      doctorDoc.certificates,
      doctorDoc._id.toString())
    )
    const mappedDoctorEntities = doctorEntities.map((doctorDoc) => {
      if (!doctorDoc.ok) throw new BusinessRuleViolationError(UserErrorType.ValidationFailed)
      return doctorDoc.value
    })
    return mappedDoctorEntities;
  }

  static toListDoctorsEntities(doctors: IMongoDoctorDocument[], doctorsCount: number): ListDoctorsPayload[] {
    const doctorEntities = doctors.map((doctorDoc) => ListDoctorsPayload.create(
      doctorDoc.fullName,
      doctorDoc.email,
      doctorDoc.status,
      'doctor',
      doctorDoc.password,
      doctorDoc.profile,
      doctorDoc.profilePhoto,
      doctorDoc.certificates,
      doctorsCount,
      doctorDoc._id.toString(),
     )
    )
    const mappedDoctorEntities = doctorEntities.map((doctorDoc) => {
      if (doctorDoc.ok == false) {
        throw new BusinessRuleViolationError(doctorDoc.error)
      }
      return doctorDoc.value
    })
    return mappedDoctorEntities;
  }
}