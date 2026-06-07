export const FIND_USERS_QUERY = (fields: string) => ({
  query: `#graphql
    query findUsers($input: FindUsersInput!) {
      findUsers(input: $input) {
        ${ fields }
      }
    }
  `,
  variables: {}
})

export const FIND_USER_QUERY = (fields: string) => ({
  query: `#graphql
    query findUser {
      findUser {
        ${ fields }
      }
    }
  `,
  variables: {}
})

export const FIND_USER_BY_ID = (fields: string) => ({
  query: `#graphql 
    query findUserById($input: FindUserByIdInput!) {
      findUserById(input: $input) {
        ${ fields }
      }
    }
  `
})

export const COUNT_USERS_QUERY = {
  query: `#graphql 
    query countUsers($input: CountUsersInput!) {
      countUsers(input: $input)
    }
  `,
  variables: {}
}

export const CHANGE_STATUS = {
  query: `#graphql
    mutation changeStatus($input: ChangeStatusInput!) {
      changeStatus(input: $input) 
    }
  `,
  variables: {}
}

export const DELETE_USER = {
  query: `#graphql 
    mutation deleteUser($input: deleteUserInput!) {
      deleteUser(input: $input) 
    }
  `,
  variables: {}
}

export const UPDATE_PROFILE_PHOTO = () => ({
  query: `#graphql
    mutation updateUserProfilePhoto($input: UserUpdateProfileInput!) {
      updateUserProfilePhoto(input: $input)
    }
  `
})

export const UPDATE_PROFILE = () => ({
  query: `#graphql
    mutation updateUserProfile($input: UpdateUserProfileInput!) {
      updateUserProfile(input: $input)
    }
  `
})

export const IS_CHAT_ENABLED = () => ({
  query: ` #graphql
    mutation isChatEnabled($input: IsChatEnabledInput!) {
      isChatEnabled(input: $input)
    } 
  `
})

export const GET_ADMIN_DASHBOARD = (fields: string) => ({
  query: `#graphql
    query getDashboardData {
      getDashboardData {  
        ${ fields }
      }
    }
  `
})