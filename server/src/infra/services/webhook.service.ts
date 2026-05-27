import { IWebHookService } from "src/application/services/webhook.service.interface";
import { stripe } from "src/config/stripe";

export class WebHookService implements IWebHookService {
    async handleStripeEvent(payload: Buffer, signature: string): Promise<string> {
        let event
        try {
            event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!,
            );

        } catch (err: any) {
            console.error('❌ Stripe Error:', err?.message);
            throw err;
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                return session.metadata.appointmentId
            }

            default:
                console.log('Unhandled event:', event.type);
        }
    }
}