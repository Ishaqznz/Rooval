import { ICreateUserRequestDTO } from "src/application/DTO/user/signup/signup.request.dto"
import { IUserResponseDTO } from "src/application/DTO/user/signup/singup.response.dto"
import { IDoctorResponseDTO } from "src/application/DTO/doctor/login/login.response.dto"
import { IUserLoginRequestDTO } from "src/application/DTO/user/login/login.request.dto"
import { IUserPasswordRequestDTO } from "src/application/DTO/user/forgotPassword/forgot-passwords.request.dto"
import { IGoogleLoginRequestDTO } from "src/application/DTO/user/googleLogin/googleLogin.request.dto"

export interface IAuthUseCase {
    signUp(input: ICreateUserRequestDTO): Promise<IUserResponseDTO>
    verifyEmail(token: string): Promise<IUserResponseDTO | IDoctorResponseDTO>
    generateJwt(userId: string, role: string): Promise<string>
    generateRefreshToken(userId: string, role: string): Promise<string>
    refreshTokens(refreshToken: string): Promise<string>
    login(userData: IUserLoginRequestDTO): Promise<IUserResponseDTO | IDoctorResponseDTO>
    forgotPassword(input: IUserPasswordRequestDTO): Promise<boolean>
    verifyResetToken(token: string): Promise<IUserResponseDTO>
    verifyResetPassword(userId: string, password: string): Promise<IUserResponseDTO | IDoctorResponseDTO>
    adminLogin(userData: IUserLoginRequestDTO): Promise<IUserResponseDTO>
    loginWithGoogle(input: IGoogleLoginRequestDTO): Promise<IUserResponseDTO | IDoctorResponseDTO>
}