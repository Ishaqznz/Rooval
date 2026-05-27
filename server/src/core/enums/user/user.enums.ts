export enum SortField {
  FULLNAME = "fullName",
  EMAIL = "email",
  CREATEDAT = "createdAt",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum StatusFilter {
  ALL = "all",
  ACTIVE = "active",
  BLOCKED = "blocked",
}

export enum RoleFilter {
  ALL = "all",
  ADMIN = "admin",
  USER = "user",
}

export enum AuthFilter {
  ALL = "all",
  GOOGLE = "google",
  PASSWORD = "password",
}


export enum UserErrorType {
  UserAlreadyExists = 'User already exists!',
  UserDoesNotExist = 'User does not exist!',
  UserNotFound = 'Users not found',
  UserBlocked = 'User is blocked!',
  NoAccountFound = 'No account found with this email!',
  PasswordMismatch = 'Password mismatch!',
  UserIsNotAnAdmin = 'user is not an admin!',
  ValidationFailed = 'Validation Failed!',
  ROLE_NOT_FOUND = 'Role Not Found!',
  INVALID_FILE = 'Invalid File',
  SYSTEM_ERROR = 'System Error',
  USER_HAVE_NO_ACCESS = 'User Have no access with this account!'
}