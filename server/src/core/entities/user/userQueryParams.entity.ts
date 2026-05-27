import { AuthFilter, RoleFilter, SortField, StatusFilter, SortOrder } from "src/core/enums/user/user.enums";
import { IUserQueryParams } from "src/core/interfaces/user/user.interface";

export class UserQueryParams {
  page: number;
  limit: number;
  search?: string;
  filter?: StatusFilter;
  role?: RoleFilter;
  authMethod?: AuthFilter;
  sortBy?: SortField;
  sortOrder?: SortOrder;

  constructor({
    page,
    limit,
    search,
    filter,
    role,
    authMethod,
    sortBy,
    sortOrder
  }: IUserQueryParams) {

    this.page = Number(page);
    this.limit = Number(limit);
    this.search = search?.trim();
    this.filter = filter;
    this.role = role;
    this.authMethod = authMethod;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  static fromRequest(query: IUserQueryParams): UserQueryParams {
    return new UserQueryParams({
      page: query.page,
      limit: query.limit,
      search: query.search,
      filter: query.filter,
      role: query.role,
      authMethod: query.authMethod,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}