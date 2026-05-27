import { ValueObject } from "../valueObject";

export class AppointmentAmountVO extends ValueObject<{ amount: number }> {
    private constructor(props: { amount: number }) {
        super(props);
    }

    public static create(amount: number) {
        if (amount <= 0) {
            return { ok: false, error: "Amount must be greater than 0" };
        }
        return { ok: true, value: new AppointmentAmountVO({ amount }) };
    }

    public get value(): number {
        return this.props.amount;
    }
}