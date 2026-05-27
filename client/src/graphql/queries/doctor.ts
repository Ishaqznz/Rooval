export const FIND_DOCTORS_QUERY = (fields: string) => ({
  query: `#graphql
    query findDoctors($input: FindDoctorsInput!) {
      findDoctors(input: $input) {
        ${fields}   
      }
    }
  `,
  variables: {}
});


export const FIND_DOCTOR_QUERY = (fields: string) => ({
  query: `#graphql
    query findDoctor {
      findDoctor {
        ${fields}
      }
    }
  `,
  variables: {}
})

export const COUNT_DOCTORS_QUERY = {
  query: `#graphql 
    query countDoctors($input: CountDoctorsInput!) {
      countDoctors(input: $input)
    }
  `,
  variables: {}
}

export const CHANGE_DOCTOR_STATUS = {
  query: `#graphql
    mutation changeDoctorStatus($input: ChangeDoctorStatusInput!) {
      changeDoctorStatus(input: $input) 
    }
  `,
  variables: {}
}

export const DELETE_DOCTOR = {
  query: `#graphql
    mutation deleteDoctor($input: DeleteDoctorInput!) {
      deleteDoctor(input: $input)
    }
  `,
  variables: {}
}

export const DOCTOR_ONBOARD = {
  query: `#graphql
    mutation doctorOnboard($input: DoctorOnboardingInput!) {
      doctorOnboard(input: $input) 
    }
  `,
  variables: {}
};

export const DOCTOR_FILE_UPLOAD = {
  query: `#graphql
    mutation doctorFileUpload($input: DoctorFileUploadInput!) {
      doctorFileUpload(input: $input)
    }
  `,
  variables: {},
};

export const DOCTOR_FILE_RE_UPLOAD = {
  query: `#graphql
    mutation FileReUpload($input: DoctorFileUpdateInput!) {
      FileReUpload(input: $input)
    }
  `,
  variables: {},
};

export const ADD_REJECTION_REASON = {
  query: `#graphql
    mutation addRejectionReason($input: RejectionReasonInput!) {
      addRejectionReason(input: $input)
    }
  `,
  variables: {}
}

export const FIND_DOCTOR_BY_USERNAME = {
  query: `#graphql
    query findDoctorByUsername($input: FindByUsernameInput!) {
      findDoctorByUsername(input: $input) {
        fullName
        email
        onboarding {
          username
        }
      }
    }
  `,
  variables: {}
}

export const UPDATE_DOCTOR_PROFILE = {
  query: `#graphql
    mutation doctorProfileUpdate($input: UpdateDoctorProfileInput!) {
      doctorProfileUpdate(input: $input)
    }
  `,

  variables: {}
}

export const CHANGE_DOCTOR_PASSWORD = {
  query: `#graphql
    mutation doctorChangePassword($input: ChangePasswordInput!) {
      doctorChangePassword(input: $input)
    }
  `,
  variables: {}
}

export const LIST_DOCTORS = (fields: string) => ({
  query: `#graphql 
      query listDoctors($input: ListDoctorsInput!) {
        listDoctors(input: $input) {
          ${ fields }   
        }
      }
    `,
  variables: {}
})

export const GET_DOCTOR = (fields: string) => ({
  query: `#graphql
    query getDoctor($input: GetDoctorInput!) {
      getDoctor(input: $input) {
        ${ fields }
      }
    }
  `
})