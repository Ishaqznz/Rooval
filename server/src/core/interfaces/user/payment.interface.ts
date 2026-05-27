export type IPaymentEventType = | 'payment_success' | 'payment_failed';

export interface IPaymentMetadata {
  appointmentId: string;
}

export interface IPaymentEvent {
  type: IPaymentEventType;
  externalId: string;
  amount?: number;
  metadata?: IPaymentMetadata;
}