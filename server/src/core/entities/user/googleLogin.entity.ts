import { UserFullNameVO } from "src/core/valueOfObjects/user/user-name.vo";
import { UserEmailVO } from "src/core/valueOfObjects/user/user-email.vo";

export class GoogleLogin {
  constructor(
    public fullName: string,
    public email: string,
    public googleId: string,
    public role: string
  ) { }

  public static create(
    fullName: string,
    email: string,
    googleId: string,
    role: string
  ): { ok: true, value: GoogleLogin } | { ok: false, error: string } {

    const fullNameResult = UserFullNameVO.create(fullName);
    if (fullNameResult.ok == false) return { ok: false, error: fullNameResult.error };

    const emailResult = UserEmailVO.create(email);
    if (emailResult.ok == false) return { ok: false, error: emailResult.error };

    const user = new GoogleLogin(
      fullName,
      email,
      googleId,
      role
    )

    return { ok: true, value: user }
  }
}