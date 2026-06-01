import { Injectable } from "@nestjs/common";
import { PaymentStatus } from "src/core/enums/appointments/appointment.enums";
import { IPaymentRepository } from "src/core/repositories/payment.repository.interface";
import { AppointmentDocument, AppointmentSchema } from "../schemas/doctor/appointment.schema";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { WithdrawUserMoney } from "src/core/entities/payment/withdrawUserMoney.entity";
import { WithdrawDoctorMoney } from "src/core/entities/payment/withdrawDoctorMoney.entity";
import { MongoWithdrawalRequestSchema, WithdrawalRequestDocument } from "../schemas/wallet/withdrawalRequest.schema";
import { Role } from "src/core/enums/user/role.enum";

@Injectable()
export class PaymentRepository implements IPaymentRepository {
    constructor(
        @InjectModel(AppointmentSchema.name)
        private readonly _appointmentModel: Model<AppointmentDocument>,

        @InjectModel(MongoWithdrawalRequestSchema.name)
        private readonly _withdrawalRequestModel: Model<WithdrawalRequestDocument>
    ) { }

    async changePaymentStatus(appointmentId: string, status: PaymentStatus): Promise<boolean> {
        const changeStatus = await this._appointmentModel.updateOne(
            { _id: appointmentId },
            { $set: { paymentStatus: status } }
        )
        return changeStatus.modifiedCount > 0
    }

    async withdrawUserMoney(
        entity: WithdrawUserMoney
    ): Promise<boolean> {
        const withdrawRequest =
            await this._withdrawalRequestModel.create({
                ownerId: new mongoose.Types.ObjectId(
                    entity.input.userId
                ),
                ownerType: Role.USER,

                amount: entity.input.amount,
                accountHolderName:
                    entity.input.accountHolderName,
                accountNumber:
                    entity.input.accountNumber.toString(),
                bankName: entity.input.bankName,
                ifscCode: entity.input.ifscCode,
                notes: entity.input.notes,
            });

        return !!withdrawRequest;
    }

    async withdrawDoctorMoney(
        entity: WithdrawDoctorMoney
    ): Promise<boolean> {
        const withdrawRequest =
            await this._withdrawalRequestModel.create({
                ownerId: new mongoose.Types.ObjectId(
                    entity.input.doctorId
                ),
                ownerType: Role.DOCTOR,

                amount: entity.input.amount,
                accountHolderName:
                    entity.input.accountHolderName,
                accountNumber:
                    entity.input.accountNumber.toString(),
                bankName: entity.input.bankName,
                ifscCode: entity.input.ifscCode,
                notes: entity.input.notes,
            });

        return !!withdrawRequest;
    }
}