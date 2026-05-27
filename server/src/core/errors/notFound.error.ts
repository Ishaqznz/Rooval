export class NotFoundError extends Error {
  constructor(
    message: string,
    public code: string = 'NOT_FOUND',
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}
