import { ValueObject } from "../valueObject";

export class UserPasswordVO extends ValueObject<{ password: string }> {
    private constructor(props: { password: string }) {
        super(props)
    }

    public static create(password: string): { ok: true, value: UserPasswordVO } | { ok: false, error: string } {
        if (!this.isValid(password)) {
            return { ok: false, error: 'Invalid password!' }
        }
        return { ok: true, value: new UserPasswordVO({ password }) }
    }

    private static isValid(password: string): boolean {
        if (typeof password !== 'string') return false;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/.test(password);
    }

    public get value(): string {
        return this.props.password;
    }
}