import { ICreateUserRequestDTO } from "src/application/dto/auth/request/signup.request.dto"
import { IUserResponseDTO } from "src/application/dto/auth/response/singup.response.dto"
import { IDoctorResponseDTO } from "src/application/dto/auth/response/login.response.dto"
import { IUserLoginRequestDTO } from "src/application/dto/auth/request/login.request.dto"
import { IUserPasswordRequestDTO } from "src/application/dto/auth/request/forgot-passwords.request.dto"
import { IGoogleLoginRequestDTO } from "src/application/dto/auth/request/googleLogin.request.dto"

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