import { Injectable } from "@nestjs/common";
import { Appointment } from "src/core/entities/appointment/appointment.entity";
import { IAppointmentRepository } from "src/core/repositories/appointment.repository";
import { AppointmentDocument, AppointmentSchema } from "../schemas/doctor/appointment.schema";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Mongoose } from "mongoose";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { ExtendedAppointment } from "src/core/entities/appointment/extendedAppointment.entity";
import { IMongoAppointmentDocument } from "../interfaces/documents/mongo.appointment.document";
import { AppointmentMapper } from "../mapper/appointment.mapper";
import { AppointmentOverlap } from "src/core/entities/appointment/getAppointment.entity";
import { CancelAppointment } from "src/core/entities/appointment/cancelAppointment.entity";
import { AppointmentStatus } from "src/core/enums/user/appointment.enums";
import { ListAppointments } from "src/core/entities/appointment/listAppointment.entity";
import { CancelAppointmentByDoctor } from "src/core/entities/appointment/cancelAppointmentByDoctor.entity";
import { ListAllAppointments } from "src/core/entities/appointment/listAllAppointment.entity";
import { ListUserAppointments } from "src/core/entities/appointment/listUserAppointments.entity";

@Injectable()
export class MongoAppointmentRepository implements IAppointmentRepository {
    constructor(
        @InjectModel(AppointmentSchema.name)
        private readonly _appointmentModel: Model<AppointmentDocument>
    ) { }

    async create(entity: Appointment): Promise<string> {
        const appointment = await this._appointmentModel.create({
            patientId: new mongoose.Types.ObjectId(entity.userId),
            doctorId: new mongoose.Types.ObjectId(entity.doctorId),
            session: entity.session,
            amount: entity.amount,
            type: entity.appointmentType,
            slotDuration: entity.slotDuration,
            bufferTime: entity.bufferTime
        })

        return appointment._id.toString();
    }

    async findById(appointmentId: string): Promise<ExtendedAppointment> {
        const appointment = await this._appointmentModel.findById(new mongoose.Types.ObjectId(appointmentId)).lean<IMongoAppointmentDocument>();
        return AppointmentMapper.toAppointmentEntity(appointment)
    }

    async findOverLapping(entity: AppointmentOverlap): Promise<ExtendedAppointment[]> {
        const appointments = await this._appointmentModel.find({
            doctorId: new mongoose.Types.ObjectId(entity.doctorId),
            "session.startTime": { $lt: entity.maxEnd },
            "session.endTime": { $gt: entity.minStart }
        }).lean<IMongoAppointmentDocument[]>();

        const availableAppointments = appointments.filter((app: IMongoAppointmentDocument) => app.status !== AppointmentStatus.CANCELLED)

        console.log('all the appointments in the findOverlapping method: ', appointments, 'available appointments: ', availableAppointments)

        return AppointmentMapper.toAppointmentEntities(availableAppointments);
    }

    async findUserAppointments(userId: string): Promise<ExtendedAppointment[]> {
        const userAppointments = await this._appointmentModel.find({ patientId: userId }).lean<IMongoAppointmentDocument[]>();
        return AppointmentMapper.toAppointmentEntities(userAppointments)
    }

    async cancelAppointment(entity: CancelAppointment): Promise<boolean> {
        const { appointmentId, reason } = entity;

        const appointment = await this._appointmentModel.findById(appointmentId);

        if (!appointment) {
            throw new BusinessRuleViolationError("Appointment not found");
        }

        if (appointment.status === "cancelled") {
            throw new BusinessRuleViolationError("Appointment already cancelled");
        }

        const now = new Date();
        const sessionStart = new Date(appointment.session.startTime);

        if (sessionStart.getTime() <= now.getTime()) {
            throw new BusinessRuleViolationError("Cannot cancel past appointment");
        }

        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancelReason = reason;
        appointment.cancelledBy = "user";

        const saved = await appointment.save();

        if (!saved) {
            throw new BusinessRuleViolationError("Failed to cancel appointment");
        }

        return true;
    }

    async cancelAppointmentByDoctor(
        entity: CancelAppointmentByDoctor
    ): Promise<boolean> {
        const { input: { appointmentId, reason } } = entity;

        const appointment = await this._appointmentModel.findById(appointmentId);

        if (!appointment) {
            throw new BusinessRuleViolationError("Appointment not found");
        }

        if (appointment.status === "cancelled") {
            throw new BusinessRuleViolationError("Appointment already cancelled");
        }

        const now = new Date();
        const sessionStart = new Date(appointment.session.startTime);

        if (sessionStart.getTime() <= now.getTime()) {
            throw new BusinessRuleViolationError("Cannot cancel past appointment");
        }

        appointment.status = AppointmentStatus.CANCELLED;
        appointment.cancelReason = reason;
        appointment.cancelledBy = "doctor";

        const saved = await appointment.save();

        if (!saved) {
            throw new BusinessRuleViolationError("Failed to cancel appointment");
        }

        return true;
    }

    async getByUserIds(userIds: string[]): Promise<ExtendedAppointment[]> {
        const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id))
        const appointments = await this._appointmentModel.find({
            patientId: { $in: objectIds }
        }).lean<IMongoAppointmentDocument[]>()
        return AppointmentMapper.toAppointmentEntities(appointments)
    }

    async getByDoctorIds(doctorIds: string[]): Promise<ExtendedAppointment[]> {
        const ObjectIds = doctorIds.map((id) => new mongoose.Types.ObjectId(id))
        const appointments = await this._appointmentModel.find({
            doctorId: { $in: ObjectIds }
        }).lean<IMongoAppointmentDocument[]>();
        return AppointmentMapper.toAppointmentEntities(appointments)
    }

    async listAppointments(entity: ListAppointments): Promise<ExtendedAppointment[]> {
        const { doctorId, page, limit, search, appointmentType, appointmentStatus } = entity.input;

        const query: any = { doctorId: new mongoose.Types.ObjectId(doctorId) };

        if (appointmentType) {
            query.type = appointmentType;
        }

        if (appointmentStatus) {
            query.status = appointmentStatus;
        }

        if (search) {
            query.$or = [
                { 'patientName': { $regex: search, $options: 'i' } },
                { 'notes': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const appointments = await this._appointmentModel
            .find(query)
            .sort({ 'session.startTime': -1 })
            .skip(skip)
            .limit(limit)
            .lean<IMongoAppointmentDocument[]>()
            .exec();

        return AppointmentMapper.toAppointmentEntities(appointments)
    }

    async listUserAppointments(entity: ListUserAppointments): Promise<ExtendedAppointment[]> {
        const { userId, page, limit, search, appointmentType, appointmentStatus } = entity.input;

        const query: any = { patientId: new mongoose.Types.ObjectId(userId) };

        if (appointmentType) {
            query.type = appointmentType;
        }

        if (appointmentStatus) {
            query.status = appointmentStatus;
        }

        if (search) {
            query.$or = [
                { 'patientName': { $regex: search, $options: 'i' } },
                { 'notes': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const appointments = await this._appointmentModel
            .find(query)
            .sort({ 'session.startTime': -1 })
            .skip(skip)
            .limit(limit)
            .lean<IMongoAppointmentDocument[]>()
            .exec();

        return AppointmentMapper.toAppointmentEntities(appointments)
    }

    async listAllAppointments(entity: ListAllAppointments): Promise<ExtendedAppointment[]> {
        const {
            page,
            limit,
            search,
            appointmentType,
            appointmentStatus,
        } = entity.input;

        const query: any = {};

        if (appointmentType) {
            query.type = appointmentType;
        }

        if (appointmentStatus) {
            query.status = appointmentStatus;
        }

        if (search) {
            query.$or = [
                { patientName: { $regex: search, $options: "i" } },
                { notes: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        const appointments = await this._appointmentModel
            .find(query)
            .sort({ "session.startTime": -1 })
            .skip(skip)
            .limit(limit)
            .lean<IMongoAppointmentDocument[]>()
            .exec();

        return AppointmentMapper.toAppointmentEntities(appointments);
    }

    async countByDoctorId(doctorId: string): Promise<number> {
        const ObjectId = new mongoose.Types.ObjectId(doctorId)
        const count = await this._appointmentModel.find({ doctorId: ObjectId }).countDocuments()
        return count;
    }

    async countByUserId(userId: string): Promise<number> {
        return await this._appointmentModel.find({ patientId: new mongoose.Types.ObjectId(userId) })
            .countDocuments()
    }

    async countAll(): Promise<number> {
        return (await this._appointmentModel.find().countDocuments());
    }
}