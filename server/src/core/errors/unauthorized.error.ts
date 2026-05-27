export class UnAuthorizedError extends Error {
  constructor(
    message: string,
    public code: string = 'UN_AUTHORIZED',
  ) {
    super(message);
    this.name = 'Un Authorized Error';
  }
}
