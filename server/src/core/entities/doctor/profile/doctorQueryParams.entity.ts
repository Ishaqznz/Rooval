import { 
  ConsultationFilter, 
  DoctorSortField, 
  DoctorSortOrder, 
  DoctorStatusFilter 
} from "src/core/enums/doctor/doctor.enums";

import { IDoctorQueryParams } from "src/core/interfaces/doctor/doctor.interface";

export class DoctorQueryParams {
  page: number;
  limit: number;
  search?: string;
  filter?: DoctorStatusFilter;
  specialization?: string;
  consultationMode?: ConsultationFilter;
  minExperience?: number;
  maxExperience?: number;
  sortBy?: DoctorSortField;
  sortOrder?: DoctorSortOrder;

  constructor({
    page,
    limit,
    search,
    filter,
    specialization,
    consultationMode,
    minExperience,
    maxExperience,
    sortBy,
    sortOrder,
  }: IDoctorQueryParams) {

    this.page = Number(page);
    this.limit = Number(limit);
    this.search = search?.trim();

    this.filter = filter;
    this.specialization = specialization?.trim();
    this.consultationMode = consultationMode;

    this.minExperience = minExperience ? Number(minExperience) : undefined;
    this.maxExperience = maxExperience ? Number(maxExperience) : undefined;

    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
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
      specialization: query.specialization,
      consultationMode: query.consultationMode,
      minExperience: query.minExperience,
      maxExperience: query.maxExperience,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}