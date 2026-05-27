export const ADMIN_LOGIN_QUERY = {
  query: `#graphql
    mutation adminLogin($input: LoginInput!) {
      adminLogin(input: $input) {
        id
        email
      }
    }
  `,
  variables: {} 
};