import { UserFullNameVO } from "src/core/valueOfObjects/user/userName.vo";
import { UserEmailVO } from "src/core/valueOfObjects/user/userEmail.vo";
import { UserPasswordVO } from "src/core/valueOfObjects/user/userPhone";
import { IUserProfile } from "src/core/interfaces/user/profile.interface";
import { Role } from "src/core/enums/user/role.enum";

export class User {
  constructor(
    public fullName: string,
    public email: string,
    public password: string,
    public id: string,
    public role: Role,
    public isAdmin: boolean,
    public isBlocked: boolean,
    public profile: IUserProfile,
  ) { }

  public static create(
    fullName: string,
    email: string,
    password: string,
    id?: string,
    role?: Role,
    isAdmin?: boolean,
    isBlocked?: boolean,
    profile?: IUserProfile
  ): { ok: true, value: User } | { ok: false, error: string } {

    const fullNameResult = UserFullNameVO.create(fullName);
    if (fullNameResult.ok == false) return { ok: false, error: fullNameResult.error };

    const emailResult = UserEmailVO.create(email);
    if (emailResult.ok == false) return { ok: false, error: emailResult.error };

    const passwordResult = UserPasswordVO.create(password);
    if (passwordResult.ok == false) return { ok: false, error: passwordResult.error };

    const user = new User(
      fullName,
      email,
      password,
      id ?? null,
      role,
      isAdmin ?? false,
      isBlocked ?? false,
      profile
    )

    return { ok: true, value: user }
  }

}