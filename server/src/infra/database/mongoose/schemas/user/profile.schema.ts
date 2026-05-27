import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender, AppointmentType } from 'src/core/enums/user/profile.enum';

@Schema({ _id: false })
export class PersonalProfile {

  @Prop({ default: '' })
  profilePhoto: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({
    type: String,
    enum: Object.values(Gender),
  })
  gender: Gender;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  phoneNumber: string;
}

export const PersonalProfileSchema =
  SchemaFactory.createForClass(PersonalProfile);
PersonalProfileSchema.set('_id', false);


@Schema({ _id: false })
export class HealthProfile {

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  currentMedication: string[];

  @Prop({ default: 'english' })
  preferredLanguage: string;

  @Prop({
    type: String,
    enum: Object.values(Gender),
  })
  gender: Gender;

  @Prop({
    type: String,
    enum: Object.values(AppointmentType),
  })
  defaultAppointmentType: AppointmentType;
}

export const HealthProfileSchema =
  SchemaFactory.createForClass(HealthProfile);
HealthProfileSchema.set('_id', false);


@Schema({ _id: false })
export class Profile {

  @Prop({
    type: PersonalProfileSchema,
    default: () => ({})
  })
  personal: PersonalProfile;

  @Prop({
    type: HealthProfileSchema,
    default: () => ({})
  })
  health: HealthProfile;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
ProfileSchema.set('_id', false);
