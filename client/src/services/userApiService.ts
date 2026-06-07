import { apiRequest } from "@/api";
import { Gender } from "@/common/enums";
import {
  FIND_USERS_QUERY,
  CHANGE_STATUS,
  DELETE_USER,
  FIND_USER_QUERY,
  COUNT_USERS_QUERY,
  UPDATE_PROFILE_PHOTO,
  UPDATE_PROFILE,
  FIND_USER_BY_ID,
  IS_CHAT_ENABLED,
  GET_ADMIN_DASHBOARD
} from "@/graphql/queries/user";
import { IFindUsers } from "@/interfaces/user/user.interface";

export const userServiceApi = {
  find: async (variables: { input: IFindUsers, fields: string }) => {
    const queryObj = FIND_USERS_QUERY(variables.fields)
    return apiRequest({ ...queryObj, variables: { input: variables.input } }, "user:findUsers");
  },

  findOne: async (variables: { fields: string }) => {
    const queryObj = FIND_USER_QUERY(variables.fields)
    return apiRequest({ ...queryObj }, "user:findUser");
  },

  findById: async (variables: { input: {userId: string } }, fields: string) => {
    const queryObj = FIND_USER_BY_ID(fields)
    return apiRequest({ ...queryObj, variables  })
  },  

  count: async (variables?: { input: { search?: string, status?: string } }) => {
    return apiRequest({ ...COUNT_USERS_QUERY, variables }, "user:countUsers");
  },

  changeStatus: async (variables: { input: { userId: string; status: boolean } }) => {
    return apiRequest({ ...CHANGE_STATUS, variables }, "user:changeStatus");
  },

  delete: async (variables: { input: { userId: string } }) => {
    return apiRequest({ ...DELETE_USER, variables }, "user:deleteUser");
  },

  updateProfilePhoto: async (variables: { profilePhoto: File }) => {
    const formData = new FormData();

    const operations = JSON.stringify({
      query: UPDATE_PROFILE_PHOTO().query,
      variables: {
        input: {
          profilePhoto: null,
        },
      },
    });

    formData.append("operations", operations);

    const map = {
      "0": ["variables.input.profilePhoto"],
    };

    formData.append("map", JSON.stringify(map));

    formData.append("0", variables.profilePhoto); 

    return apiRequest(
      {
        ...UPDATE_PROFILE_PHOTO(),
        formData,
      },
      "user:updateProfilePhoto"
    );
  },

  updateProfile: async (variables: {
    input: {
      fullName?: string,
      address?: string,
      gender?: Gender,
      phoneNumber?: string,
      allergies?: string[],
      currentMedication?: string[],
      preferredLanguage?: string
    }
  }) => {
    const queryObj = UPDATE_PROFILE();
    return apiRequest({...queryObj, variables })
  },

  isChatEnabled: async (variables: { input: { doctorId: string }}) => {
    const queryObj = IS_CHAT_ENABLED();
    return apiRequest({ ...queryObj, variables })
  },

  getAdminDashboard: async (fields: string) => {
    const queryObj = GET_ADMIN_DASHBOARD(fields)
    return apiRequest({ ...queryObj })
  }
}