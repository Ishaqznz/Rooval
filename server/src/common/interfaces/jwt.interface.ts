import { JwtPayload} from 'jsonwebtoken'

export interface MyJwtPayload extends JwtPayload {
    userId: string
    role: string
    iat?: number
    exp?: number
}