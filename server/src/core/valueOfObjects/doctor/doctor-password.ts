import { ValueObject } from "../value-object";

export class DoctorPasswordVO extends ValueObject<{ password: string }> {
    constructor(props: { password: string }) {
        super(props)
    }

    public static create(password: string): { ok: true, value: DoctorPasswordVO } | {ok: false, error: string} {
        if (!this.isValid(password)) {
            return { ok: false, error: 'Invalid password!' }
        }
        return { ok: true, value: new DoctorPasswordVO({ password })}
    }

    private static isValid(password: string): boolean {
        if (typeof password !== 'string') return false;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/.test(password);
    }

    public get value(): string {
        return this.props.password;
    }
}