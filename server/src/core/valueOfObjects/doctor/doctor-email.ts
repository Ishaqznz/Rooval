import { ValueObject } from '../value-object';

export class DoctorEmailVO extends ValueObject<{ email: string }> {
  private constructor(props: { email: string }) {
    super(props);
  }

  public static create(
    email: string,
  ): { ok: true; value: DoctorEmailVO } | { ok: false; error: string } {
    if (!DoctorEmailVO.isValid(email)) {
      return { ok: false, error: 'Invalid email address' };
    }
    return { ok: true, value: new DoctorEmailVO({ email }) };
  }

  private static isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  public get value(): string {
    return this.props.email;
  }
}
