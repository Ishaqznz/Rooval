import DataLoader = require('dataloader');
import { Doctor } from '../types/doctor/model/doctor.model';
import { Injectable, Inject } from "@nestjs/common";
import { IDoctorUseCase } from 'src/application/use-cases/interface/doctor.usecase.interface';

@Injectable()
export class DoctorLoader {
    constructor(
        @Inject('IDoctorUseCase')
        private readonly _doctorUseCase: IDoctorUseCase
    ) { }

    create() {
        return new DataLoader<string, Doctor>(async (doctorIds: readonly string[]) => {
            const doctors = await this._doctorUseCase.findByIds(doctorIds as string[]);

            const doctorMap = new Map<string, Doctor>();

            for (const doctor of doctors) {
                doctorMap.set(doctor.id, doctor);
            }

            return doctorIds.map((id) => doctorMap.get(id.toString())!);
        });
    }
}