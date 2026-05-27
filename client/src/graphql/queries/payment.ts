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