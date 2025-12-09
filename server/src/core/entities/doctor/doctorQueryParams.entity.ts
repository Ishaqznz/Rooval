export interface IDoctorQueryParams {
  page?: number;
  limit?: number;
  search?: string;  
  filter?: string;  
}

export class DoctorQueryParams {
  page: number;
  limit: number;
  search?: string;
  filter?: string;

  constructor({ page = 1, limit = 5, search, filter }: IDoctorQueryParams = {}) {
    this.page = Number(page) || 1;
    this.limit = Number(limit) || 5;
    this.search = search?.trim();
    this.filter = filter?.trim();
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  static fromRequest(query: IDoctorQueryParams): DoctorQueryParams {
    return new DoctorQueryParams({
      page: query.page,
      limit: query.limit,
      search: query.search,
      filter: query.filter, 
    });
  }
}
