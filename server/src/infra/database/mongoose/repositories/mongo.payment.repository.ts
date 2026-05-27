import { Injectable } from "@nestjs/common";
import { PaymentStatus } from "src/core/enums/user/appointment.enums";
import { IPaymentRepository } from "src/core/repositories/payment.repository.interface";
import { AppointmentDocument, AppointmentSchema } from "../schemas/doctor/appointment.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class PaymentRepository implements IPaymentRepository {
    constructor(
        @InjectModel(AppointmentSchema.name)
        private readonly _appointmentModel: Model<AppointmentDocument>
    ) { }

    async changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean> {
        const changeStatus = await this._appointmentModel.updateOne(
            { _id: appointmentId }, 
            { $set: { paymentStatus: status }}
        )
        return changeStatus.modifiedCount > 0
    }   
}