import { ValueObject } from "../valueObject";

export class UserIdVO extends ValueObject<{ userId: string }> {
  private constructor(props: { userId: string }) {
    super(props);
  }

  public get value(): string {
    return this.props.userId
  }

  public static create(
    userId: string
  ): { ok: true; value: UserIdVO } | { ok: false; error: string } {
    if (!userId || typeof userId !== "string") {
      return { ok: false, error: "Invalid user id" };
    }

    return { ok: true, value: new UserIdVO({ userId }) };
  }
}
