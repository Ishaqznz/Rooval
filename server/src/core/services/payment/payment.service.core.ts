export class PaymentDomainService {
    static deductPlatformCommission(amount: number): number {
        const platformCommission = Number(process.env.PLATFORM_COMMISSION)
        const finalAmount = Math.floor(amount - ((amount / 100) * platformCommission))
        return finalAmount
    }
}