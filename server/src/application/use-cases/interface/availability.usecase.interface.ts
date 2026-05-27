import { IGetSlotsRequestDTO } from "src/application/dto/availability/request/slots.request.dto";
import { IUpsertAvailabilityRequestDTO } from "src/application/dto/availability/request/upsert.request.dto";
import { IAvailabilityResponseDTO } from "src/application/dto/availability/response/availability.response.dto";
import { ISlotResponseDTO } from "src/application/dto/availability/response/slots.response.dto";

export interface IAvailabilityUseCase {
    upsertAvailability(input: IUpsertAvailabilityRequestDTO[]): Promise<boolean>
    deleteAvailabilities(doctorId: string): Promise<boolean>
    getSlotsBydate(input: IGetSlotsRequestDTO): Promise<ISlotResponseDTO[]>
    getAvailabilities(doctorIds: string[]): Promise<IAvailabilityResponseDTO[]>
}