import { UserFullNameVO } from "src/core/valueOfObjects/user/user-name.vo";
import { UserEmailVO } from "src/core/valueOfObjects/user/user-email.vo";
import { UserPasswordVO } from "src/core/valueOfObjects/user/user-phone";

export class User {
  constructor(
    public fullName: string,
    public email: string,
    public password: string,
    public id: string,
    public role: string,
    public isAdmin: boolean,
    public isBlocked: boolean
  ) { }

  public static create(
    fullName: string,
    email: string,
    password: string,
    id?: string,
    role?: string, 
    isAdmin?: boolean,
    isBlocked?: boolean
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
      role ?? 'user',
      isAdmin ?? false,
      isBlocked ?? false
    )

    return { ok: true, value: user }
  }

}