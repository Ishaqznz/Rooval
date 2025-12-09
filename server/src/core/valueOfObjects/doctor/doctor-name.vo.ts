import { ValueObject } from "../value-object";

export class DoctorFullNameVO extends ValueObject<{ fullName: string }>{
    private constructor(protected readonly props: { fullName: string }) {
        super(props)
    }

    public static create(fullName: string): { ok: true, value: DoctorFullNameVO } | { ok: false, error: string } {
        if (!this.isValid(fullName)) {
            return { ok: false, error: 'Invalid full Name' }
        }

        return { ok: true, value: new DoctorFullNameVO({ fullName })}
    }

    private static isValid(fullName: string): boolean {
        if (typeof fullName !== 'string') return false;
        const trimmed = fullName.trim();
        const regex = /^[\p{L}\s'.-]{3,50}$/u;
        return regex.test(trimmed);
    }
}