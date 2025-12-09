export interface IFindDoctorsRequestDTO {
    page: number
    limit: number
    search?: string
    filter?: string
}