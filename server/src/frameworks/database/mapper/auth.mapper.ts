import { SignUpOutputDto } from 'src/application/DTO/user/signup/singup.output.dto';
import { DoctorOutputDto } from 'src/application/DTO/doctor/login/login.output.dto';

export class AuthMapper {
  static toGetAllUsersDto(users: any[]): SignUpOutputDto[] {
    const outputDto = users.map((doc) => ({
      id: doc._id,
      fullName: doc.fullName,
      email: doc.email,
      isAdmin: doc.isAdmin,
      isBlocked: doc.isBlocked,
      password: doc.password,
    }));

    return outputDto;
  }

  static toGetAllDoctorsDto(users: any[]): DoctorOutputDto[] {
    const outputDto = users.map((doc) => ({
      id: doc._id,
      fullName: doc.fullName,
      email: doc.email,
      password: doc.password,
    }));

    return outputDto;
  }

  static toUserDto(user: any): SignUpOutputDto {
    const userDto = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isBlocked: user.isBlocked,
      isAdmin: user.isAdmin,
      password: user.password,
    };
    return userDto;
  }

  static toDoctorDto(user: any): DoctorOutputDto {
    const doctorDto = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      password: user.password,
    };
    return doctorDto;
  }
}
