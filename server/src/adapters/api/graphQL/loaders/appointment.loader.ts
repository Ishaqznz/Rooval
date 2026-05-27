import DataLoader = require('dataloader'); 
import { Appointment } from '../types/appointment/model/appointment.model';
import { Injectable, Inject } from "@nestjs/common";
import { IAppointmentUseCase } from 'src/application/use-cases/interface/appointment.usecase.interface';

@Injectable()
export class AppointmentLoader {
    constructor(
        @Inject('IAppointmentUseCase')
        private readonly _appointmentUseCase: IAppointmentUseCase
    ) {}

    byUserId() {
        return new DataLoader<string, Appointment[]>(async (userIds: readonly string[]) => {
            const appointments = await this._appointmentUseCase.getUserAppointments(userIds as string[]);
            return userIds.map((id) => appointments.filter((a) => a.patientId.toString() === id));
        });
    }

    byDoctorId() {
        return new DataLoader<string, Appointment[]>(async (doctorIds: readonly string[]) => {
            const appointments = await this._appointmentUseCase.getDoctorAppointments(doctorIds as string[]);
            return doctorIds.map((id) => appointments.filter((a) => a.doctorId.toString() === id));
        });
    }
}