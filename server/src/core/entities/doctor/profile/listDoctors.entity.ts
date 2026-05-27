import { ConsultationType, DoctorSortBy, OrderBy } from "src/core/enums/doctor/doctor.enums";
import { PageVO } from "src/core/valueOfObjects/doctor/page.vo";
import { LimitVO } from "src/core/valueOfObjects/doctor/limit.vo";
import { FeeRangeVO } from "src/core/valueOfObjects/doctor/feeRange.vo";
import { RatingVO } from "src/core/valueOfObjects/doctor/rating.vo";

export class ListDoctors {
  private constructor(
    public readonly pagination: {
      page: PageVO;
      limit: LimitVO;
    },
    public readonly sorting: {
      sortBy: DoctorSortBy;
      order: OrderBy;
    },
    public readonly filter: {
      search?: string;
      specialization?: string[];
      city?: string;
      consultationType?: ConsultationType;
      minExperience?: number;
      feeRange?: FeeRangeVO;
      rating?: RatingVO;
      availableToday?: boolean;
    }
  ) {}

  public static create(
    data: {
      pagination: {
        page: number;
        limit: number;
      };
      sorting: {
        sortBy: DoctorSortBy;
        order: OrderBy;
      };
      filter?: {
        search?: string;
        specialization?: string[];
        city?: string;
        consultationType?: ConsultationType;
        minExperience?: number;
        minFee?: number;
        maxFee?: number;
        minRating?: number;
        availableToday?: boolean;
      };
    }
  ): { ok: true; value: ListDoctors } | { ok: false; error: string } {

    const pageOrError = PageVO.create(data.pagination.page);
    if (pageOrError.ok == false) return pageOrError;

    const limitOrError = LimitVO.create(data.pagination.limit);
    if (limitOrError.ok == false) return limitOrError;

    let feeRange: FeeRangeVO | undefined;

    if (
      data.filter?.minFee !== undefined ||
      data.filter?.maxFee !== undefined
    ) {
      const feeRangeOrError = FeeRangeVO.create(
        data.filter?.minFee,
        data.filter?.maxFee
      );

      if (feeRangeOrError.ok == false) return feeRangeOrError;
      feeRange = feeRangeOrError.value;
    }

    let rating: RatingVO | undefined;
    if (data.filter?.minRating !== undefined) {
      const ratingOrError = RatingVO.create(data.filter.minRating);
      if (ratingOrError.ok == false) return ratingOrError;
      rating = ratingOrError.value;
    }

    if (
      data.filter?.minExperience !== undefined &&
      data.filter.minExperience < 0
    ) {
      return { ok: false, error: "Experience cannot be negative" };
    }

    return {
      ok: true,
      value: new ListDoctors(
        {
          page: pageOrError.value,
          limit: limitOrError.value,
        },
        data.sorting,
        {
          search: data.filter?.search,
          specialization: data.filter?.specialization,
          city: data.filter?.city,
          consultationType: data.filter?.consultationType,
          minExperience: data.filter?.minExperience,
          feeRange,
          rating,
          availableToday: data.filter?.availableToday,
        }
      ),
    };
  }
}
