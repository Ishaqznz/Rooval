import { Doctor } from "src/core/entities/doctor/doctor.entity";
import { IMongoDoctorDocument } from "../interfaces/documents/mongo.doctor.model";
import { BusinessRuleViolationError } from "src/core/errors/business-rule.error";
import { UserErrorType } from "src/core/enums/user.enums";

export class DoctorMapper {
  static toDoctorEntity(doctor: Partial<IMongoDoctorDocument>): Doctor {
    const doctorEntity = Doctor.create(
      doctor.fullName, 
      doctor.email, 
      doctor.status, 
      'doctor', 
      doctor.password, 
      doctor.onboarding, 
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
      doctorDoc.onboarding, 
      doctorDoc.profilePhoto, 
      doctorDoc.certificates, 
      doctorDoc._id.toString())
    )
    const mappedDoctorEntities = doctorEntities.map((doctorDoc) => {
      console.log('the doctor doc: ', doctorDoc)
      console.log("the error happened in the core layer: ", doctorDoc, doctorDoc.ok);
      if (!doctorDoc.ok) throw new BusinessRuleViolationError(UserErrorType.ValidationFailed)
      return doctorDoc.value
    })
    return mappedDoctorEntities;
  }
}