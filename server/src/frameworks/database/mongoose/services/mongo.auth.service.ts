import { v4 as uuidv4 } from 'uuid';

export class AuthMongoService {
  static generateToken(): string {
    return uuidv4();
  }
}
