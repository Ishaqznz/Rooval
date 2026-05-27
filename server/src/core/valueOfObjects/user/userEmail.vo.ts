import { ValueObject } from "../valueObject";

export class UserEmailVO extends ValueObject<{ email: string }> {
  private constructor(props: { email: string }) {
    super(props);
  }

  public static create(email: string): { ok: true; value: UserEmailVO } | { ok: false; error: string } {
    if (!UserEmailVO.isValid(email)) {
      return { ok: false, error: 'Invalid email address' };
    }
    return { ok: true, value: new UserEmailVO({ email }) };
  }

  private static isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  public get value(): string {
    return this.props.email;
  }
}
