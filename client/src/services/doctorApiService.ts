import { apiRequest } from "@/api";
import {
  FIND_DOCTORS_QUERY,
  CHANGE_DOCTOR_STATUS,
  DELETE_DOCTOR,
  FIND_DOCTOR_QUERY,
  DOCTOR_ONBOARD,
  DOCTOR_FILE_UPLOAD,
  DOCTOR_FILE_RE_UPLOAD,
  COUNT_DOCTORS_QUERY,
  ADD_REJECTION_REASON,
  FIND_DOCTOR_BY_USERNAME,
  UPDATE_DOCTOR_PROFILE,
  CHANGE_DOCTOR_PASSWORD,
  GET_DOCTOR,
  GET_DOCTOR_DASHBOARD,
  UPLOAD_PROFILE_PHOTO,
} from "@/graphql/queries/doctor";
import { IUpdateDoctorProfile } from "@/interfaces/api/doctor/updateProfile.api.interface";
import { IListDoctorsRequestDTO } from "@/interfaces/api/doctor/doctor.api.interface";
import { LIST_DOCTORS } from "@/graphql/queries/doctor";
import { IFindDoctors } from "@/interfaces/doctor/doctor.interface";

export const doctorServiceApi = {
  find: async (variables: { input: IFindDoctors, fields: string }) => {
    const queryObj = FIND_DOCTORS_QUERY(variables.fields);
    return apiRequest({ ...queryObj, variables: { input: variables.input } }, "doctor:findDoctors");
  },

  findOne: async (variables: { fields: string }) => {
    const queryObj = FIND_DOCTOR_QUERY(variables.fields)
    return apiRequest({ ...queryObj }, "user:findDoctor");
  },

  count: async (variables?: { input: { search?: string, status?: string } }) => {
    return apiRequest({ ...COUNT_DOCTORS_QUERY, variables }, "doctor:countDoctors");
  },

  findByUsername: async (variables: { input: { Username: string } }) => {
    return apiRequest({ ...FIND_DOCTOR_BY_USERNAME, variables }, "doctor:findDoctorByUsername");
  },

  changeStatus: async (variables: { input: { userId: string; status: string } }) => {
    return apiRequest({ ...CHANGE_DOCTOR_STATUS, variables }, "doctor:changeStatus");
  },

  delete: async (variables: { input: { doctorId: string } }) => {
    return apiRequest({ ...DELETE_DOCTOR, variables }, "doctor:deleteDoctor");
  },

  onboard: async (variables: {
    input: {
      username: string;
      gender: string;
      phone: string;
      registrationNumber: string;
      country: string;
      state: string;
      experience: number;
      bio: string;
      specializations: string[];
      consultationModes: string[];
      consultationFee: number;
      languages: string[];
      consultationDuration: number;
      preferredMode: string;
      acceptingPatients: boolean;
      profileVisibility: boolean;
    };
  }) => {
    return apiRequest({ ...DOCTOR_ONBOARD, variables }, "doctor:onboard");
  },

  fileUpload: async (data: { profilePhoto: File; certificates: File[] }) => {
    const formData = new FormData();

    console.log('front end profilePhoto and also the certificates!', data.profilePhoto, data.certificates)
    const operations = JSON.stringify({
      query: DOCTOR_FILE_UPLOAD.query,
      variables: {
        input: {
          profilePhoto: null,
          certificates: [null],
        },
      },
    });

    formData.append("operations", operations);

    const map: Record<string, string[]> = {
      "0": ["variables.input.profilePhoto"],
    };

    data.certificates.forEach((_, index) => {
      map[`${index + 1}`] = [`variables.input.certificates.${index}`];
    });

    formData.append("map", JSON.stringify(map));

    formData.append("0", data.profilePhoto);
    data.certificates.forEach((file, index) => {
      formData.append(`${index + 1}`, file);
    });

    return apiRequest(
      {
        ...DOCTOR_FILE_UPLOAD,
        formData,
      },
      "doctor:fileUpload"
    );
  },

  fileReUpload: async (data: { certificates: File[] }) => {
    const formData = new FormData();

    const operations = JSON.stringify({
      query: DOCTOR_FILE_RE_UPLOAD.query,
      variables: {
        input: {
          certificates: data.certificates.map(() => null),
        },
      },
    });

    formData.append("operations", operations);

    const map: Record<string, string[]> = {};

    data.certificates.forEach((_, index) => {
      map[index] = [`variables.input.certificates.${index}`];
    });

    formData.append("map", JSON.stringify(map));

    data.certificates.forEach((file, index) => {
      formData.append(String(index), file);
    });

    return apiRequest(
      {
        ...DOCTOR_FILE_RE_UPLOAD,
        formData,
      },
      "doctor:fileReUpload"
    );
  },

  addRejectionReason: async (variables: { input: { doctorId: string, rejectionReason: string } }) => {
    return apiRequest(
      {
        ...ADD_REJECTION_REASON,
        variables
      },
      "doctor:RejectionReason"
    )
  },

  updateDoctorProfile: async (variables: { input: IUpdateDoctorProfile }) => {
    return apiRequest(
      {
        ...UPDATE_DOCTOR_PROFILE,
        variables
      },
      "doctor:updateDoctorProfile"
    )
  },

  changePassword: async (variables: { input: { oldPassword: string, newPassword: string } }) => {
    return apiRequest(
      {
        ...CHANGE_DOCTOR_PASSWORD,
        variables
      },
      "doctor:changePassword"
    )
  },

  list: async (variables: { input: IListDoctorsRequestDTO }, fields: string) => {
    const queryObj = LIST_DOCTORS(fields)
    return apiRequest(
      {
        ...queryObj,
        variables
      }
      ,
      "doctors:list"
    )
  },

  get: async (variables: { input: { doctorId: string } }, fields: string) => {
    const queryObj = GET_DOCTOR(fields)
    return apiRequest(
      {
        ...queryObj,
        variables
      }
      ,
      'doctor:get'
    )
  },

  getDashboardData: async (fields: string) => {
    const queryObj = GET_DOCTOR_DASHBOARD(fields);
    return apiRequest({ ...queryObj })
  },

  async uploadProfilePhoto(data: { file: File }) {
    const formData = new FormData();

    const operations = JSON.stringify({
      query: UPLOAD_PROFILE_PHOTO().query,
      variables: {
        input: {
          file: null,
        },
      },
    });

    formData.append("operations", operations);

    formData.append(
      "map",
      JSON.stringify({
        "0": ["variables.input.file"],
      })
    );

    formData.append("0", data.file);

    return apiRequest(
      {
        ...UPLOAD_PROFILE_PHOTO(),
        formData,
      },
      "doctor:uploadProfilePhoto"
    );
  }
};