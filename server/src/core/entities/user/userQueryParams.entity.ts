export interface IUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;  
  filter?: string;  
}

export class UserQueryParams {
  page: number;
  limit: number;
  search?: string;
  filter?: string;

  constructor({ page = 1, limit = 5, search, filter }: IUserQueryParams = {}) {
    this.page = Number(page) || 1;
    this.limit = Number(limit) || 5;
    this.search = search?.trim();
    this.filter = filter?.trim();
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
    });
  }
}
