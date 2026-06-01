export enum WalletTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum ListTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  ALL = 'all'
}

export enum WalletTransactionReason {
  APPOINTMENT_PAYMENT = 'Appointment Payment',
  APPOINTMENT_REFUND = 'Appointment Refund',
  DOCTOR_PAYOUT = 'Doctor Payout',
  PLATFORM_COMMISSION = 'Platform Commission',
  WITHDRAWAL = 'Withdrawal',
  MANUAL_ADJUSTMENT = 'Manual Adjustment',
  USER_APPOINTMENT_CANCELLATION = 'User Appointment Cancelled'
}

export enum WalletErrorType {
    WALLET_NOT_FOUND = 'Wallet not found!'
}