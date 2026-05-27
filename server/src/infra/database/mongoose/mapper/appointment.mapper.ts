import { IMongoAppointmentDocument } from "../interfaces/documents/mongo.appointment.document";
import { ExtendedAppointment } from "src/core/entities/appointment/extendedAppointment.entity";

export class AppointmentMapper {
    static toAppointmentEntities(input: IMongoAppointmentDocument[]): ExtendedAppointment[] {
        const entities: ExtendedAppointment[] = []

        for (const item of input) {
            const result = ExtendedAppointment.create({
                id: item._id,
                patientId: item.patientId,
                doctorId: item.doctorId,
                session: item.session,
                status: item.status,
                type: item.type,
                reason: item.reason,
                notes: item.notes,
                paymentStatus: item.paymentStatus,
                amount: item.amount,
                paymentId: item.paymentId,
                cancelledBy: item.cancelledBy,
                cancelReason: item.cancelReason,
                slotDuration: item.slotDuration,
                bufferTime: item.bufferTime,
                reminderSent: item.reminderSent,
                isCheckedIn: item.isCheckedIn,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            });

            entities.push(result);
        }

        console.log('entities in the mapper: ', entities)

        return entities;
    }

    static toAppointmentEntity(input: IMongoAppointmentDocument): ExtendedAppointment {
        const entity = ExtendedAppointment.create({
            id: input._id,
            patientId: input.patientId,
            doctorId: input.doctorId,
            session: input.session,
            status: input.status,
            type: input.type,
            reason: input.reason,
            notes: input.notes,
            paymentStatus: input.paymentStatus,
            amount: input.amount,
            paymentId: input.paymentId,
            cancelledBy: input.cancelledBy,
            cancelReason: input.cancelReason,
            slotDuration: input.slotDuration,
            bufferTime: input.bufferTime,
            reminderSent: input.reminderSent,
            isCheckedIn: input.isCheckedIn,
            createdAt: input.createdAt,
            updatedAt: input.updatedAt
        })

        return entity;
    }
}