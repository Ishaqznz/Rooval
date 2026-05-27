import { SortOrder, StatusFilter } from "@/types/user.types"
import { RoleFilter } from "@/types/user.types"
import { AuthFilter } from "@/types/user.types"
import { SortField } from "@/types/user.types"

export interface IFindUsers {
    page: number
    limit: number
    search?: string
    filter?: StatusFilter
    role?: RoleFilter
    authMethod?: AuthFilter
    sortBy?: SortField
    sortOrder?: SortOrder
}