import DataLoader = require('dataloader'); 
import { DoctorAvailability } from "../types/availability/model/availability.model";
import { Injectable, Inject } from "@nestjs/common";
import { IAvailabilityUseCase } from "src/application/use-cases/interface/availability.usecase.interface";

@Injectable()
export class AvailabilityLoader {
    constructor(
        @Inject('IAvailabilityUseCase')
        private readonly _availabilityUseCase: IAvailabilityUseCase
    ) {}

    create() {
        return new DataLoader<string, DoctorAvailability[]>(async (doctorIds: readonly string[]) => {
            const availabilities = await this._availabilityUseCase.getAvailabilities(doctorIds as string[]);

            return doctorIds.map((id) => {
                return availabilities.filter((a) => a.doctorId === id);
            });
        });
    }
}