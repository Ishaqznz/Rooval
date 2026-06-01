import { Injectable } from "@nestjs/common";
import { IAppointmentResponseDTO } from "src/application/dto/appointment/response/appointment.response.dto";
import { ICreateCheckoutSessionResponse } from "src/application/dto/checkout/request/create.request.dto";
import { IPaymentService } from "src/application/services/payment.service.interface";
import { stripe } from "src/config/stripe";

@Injectable()
export class PaymentService implements IPaymentService {
    async createCheckoutSession(
        appointment: IAppointmentResponseDTO
    ): Promise<ICreateCheckoutSessionResponse> {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],

            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Doctor Appointment",
                        },
                        unit_amount: Math.round(appointment.amount * 100),
                    },
                    quantity: 1,
                },
            ],

            success_url: `${process.env.FRONT_END_URL}/payment/success?appointmentId=${appointment.id}`,
            cancel_url: `${process.env.FRONT_END_URL}/payment/failure?appointmentId=${appointment.id}`,

            metadata: {
                appointmentId: appointment.id.toString(),
            },
        });

        return {
            url: session.url!,
        };
    }
}