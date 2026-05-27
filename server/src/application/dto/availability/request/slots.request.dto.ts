export interface IGetSlotsRequestDTO {
    doctorId: string
    date: string
}


// we will fetch all the appointments with doctorId and date
// we will create an array of objects having that appointment sessions
// we will compare those appointments array of objects with the already created slots
// we will return slots after comparing and removing