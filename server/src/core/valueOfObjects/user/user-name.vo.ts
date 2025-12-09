import { ValueObject } from "../value-object";

export class UserFullNameVO extends ValueObject<{ fullName: string }>{
    private constructor(props: { fullName: string }) {
        super(props)
    }

    public static create(fullName: string): { ok: true, value: UserFullNameVO } | { ok: false, error: string } {
        if (!this.isValid(fullName)) {
            return { ok: false, error: 'Invalid full Name' }
        }

        return { ok: true, value: new UserFullNameVO({ fullName })}
    }

    private static isValid(fullName: string): boolean {
        if (typeof fullName !== 'string') return false;
        const trimmed = fullName.trim();
        const regex = /^[\p{L}\s'.-]{3,50}$/u;
        return regex.test(trimmed);
    }

    public get value(): string {
        return this.props.fullName;
    }
}