
export interface IWebHookService {
    handleStripeEvent(payload: Buffer, signature: string): Promise<string>
}