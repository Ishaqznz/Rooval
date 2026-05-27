import { AuthFilter, RoleFilter, SortField, StatusFilter, SortOrder } from "src/core/enums/user/user.enums"

export interface IFindUsersRequestDTO {
    page: number
    limit: number
    search?: string
    filter?: StatusFilter
    role?: RoleFilter
    authMethod?: AuthFilter
    sortBy?: SortField
    sortOrder?: SortOrder
}