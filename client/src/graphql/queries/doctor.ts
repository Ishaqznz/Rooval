export const FIND_DOCTORS_QUERY = {
  query: `#graphql
    query findDoctors {
      findDoctors {
        id
        fullName
        email
      }
    }
  `,
  variables: {}
};