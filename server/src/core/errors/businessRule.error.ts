export class BusinessRuleViolationError extends Error {
  constructor(
    message: string,
    public code: string = 'BUSINESS_RULE_FAILED',
  ) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}
