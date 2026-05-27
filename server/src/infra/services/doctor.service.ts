import { IDoctorService } from "src/application/services/doctor.service.interface";
import * as bycrypt from 'bcrypt';

export class DoctorService implements IDoctorService {
    private readonly saltRounds = 10
    async hashPassword(password: string): Promise<string> {
        return bycrypt.hash(password, this.saltRounds)
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bycrypt.compare(password, hash)
    }
}