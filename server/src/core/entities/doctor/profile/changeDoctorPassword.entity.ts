import { UserPasswordVO } from "src/core/valueOfObjects/user/userPhone";

export class ChangeDoctorPassord {
  constructor(
    public userId: string,
    public password: string
  ) { }

  public static create(
    userId: string,
    password: string
  ): { ok: true, value: ChangeDoctorPassord } | { ok: false, error: string } {
    const passwordResult = UserPasswordVO.create(password);
    if (passwordResult.ok == false) return { ok: false, error: passwordResult.error };
    const user = new ChangeDoctorPassord(
      userId,
      password
    )
    return { ok: true, value: user }
  }
}