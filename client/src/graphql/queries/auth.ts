import { Variable } from "lucide-react";

export const LOGIN_QUERY = {
  query: `#graphql
    mutation loginUser($input: LoginInput!) {
      loginUser(input: $input) {
        id
        email
      }
    }
  `,
  variables: {}
};

export const SIGNUP_QUERY = {
  query: `#graphql
    mutation createUser($input: SignUpInput!) {
      createUser(input: $input) {
        id
        email
      }
    }
  `,
  variables: {}
};

export const VERIFY_EMAIL_QUERY = {
  query: `#graphql
    mutation verifyEmail($input: TokenInput!) {
      verifyEmail(input: $input) {
        id
        email
      }
    }
  `,
  variables: {}
}

export const FORGOT_PASSWORD = {
  query: `#graphql
    mutation forgotPassword($input: EmailInput!) {
      forgotPassword(input: $input) 
    }
  `,
  variables: {}
}

export const VERIFY_RESET_TOKEN = {
  query: `#graphql
    mutation verifyResetToken($input: TokenInput!) {
      verifyResetToken(input: $input) {
        email
      }
    }
  `,
  variables: {}
}

export const VERIFY_RESET_PASSWORD = {
  query: `#graphql
    mutation verifyResetPassword($input: PasswordInput!) {
      verifyResetPassword(input: $input) {
        fullName
        email
      }
    }
  `,
  variables: {}
}

export const LOGOUT_USER_MUTATION = {
  query: `#graphql
    mutation {
      logout
    }
  `,
  variables: {}
};


export const REFRESH_TOKEN = {
  query: `#graphql
    mutation {
      refreshToken
    }
  `,
  variables: {}
}

export const GOOGLE_AUTH = {
  query: `#graphql
    mutation loginWithGoogle($input: GoogleLoginInput!) {
      loginWithGoogle(input: $input) {
        id
        email
      }
    }
  `,
  variables: {}
}