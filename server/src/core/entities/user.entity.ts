export class UserEntity {
  constructor(
    public fullName: string,
    public email: string,
    public role: string,
    public password: string,
  ) {}

  static create(fullName: string, email: string, role: string, password: string): UserEntity {
    return new UserEntity(fullName, email, role, password);
  }
}
