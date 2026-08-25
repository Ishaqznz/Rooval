import { IGetSlotsRequestDTO } from "../../dto/availability/request/slots.request.dto";
import { IUpsertAvailabilityRequestDTO } from "../../dto/availability/request/upsert.request.dto";
import { IAvailabilityResponseDTO } from "../../dto/availability/response/availability.response.dto";
import { ISlotResponseDTO } from "../../dto/availability/response/slots.response.dto";

export interface IAvailabilityUseCase {
    upsertAvailability(input: IUpsertAvailabilityRequestDTO[]): Promise<boolean>
    deleteAvailabilities(doctorId: string): Promise<boolean>
    getSlotsBydate(input: IGetSlotsRequestDTO): Promise<ISlotResponseDTO[]>
    getAvailabilities(doctorIds: string[]): Promise<IAvailabilityResponseDTO[]>
    getDoctorTimezone(doctorId: string): Promise<string>
}