export const FIND_USERS_QUERY = {
  query: `#graphql
    query findUsers {
      findUsers {
        id
        fullName
        email
        isBlocked
        isAdmin
      }
    }
  `,
  variables: {}
};

export const CHANGE_STATUS = {
  query: `#graphql
    mutation changeStatus($input: ChangeStatusInput!) {
      changeStatus(input: $input) 
    }
  `,
  variables: {}
}
