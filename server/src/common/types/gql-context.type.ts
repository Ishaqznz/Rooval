import { Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export interface GqlContext {
  req: AuthenticatedRequest;
  res: Response;
}
