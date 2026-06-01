export const CREATE_CHECKOUT_SESSION = (fields: string) => ({
    query: `
        mutation createPaymentSession($input: CreatePaymentSessionInput!) {
            createPaymentSession(input: $input) {
                ${ fields }
            }
        }
     `,

    variables: {}
})

export const WITHDRAW_USER_MONEY = () => ({
    query: `
        mutation withdrawUserMoney($input: WithdrawUserMoneyInput!) {
            withdrawUserMoney(input: $input) 
        }
    `
})

export const WITHDRAW_DOCTOR_MONEY = () => ({
    query: `
        mutation withdrawDoctorMoney($input: WithdrawDoctorMoneyInput!) {
            withdrawDoctorMoney(input: $input)
        }
    `
})