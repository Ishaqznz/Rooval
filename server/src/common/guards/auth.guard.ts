import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    const req = ctx.req;
    const token = req.cookies['token'];
    console.log('token of the user: ', token);
    if (!token) return false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('decoded token of the user: ', req.user);
      return true;
    } catch (error) {
      console.log('Error while verifying the token: ', error);
      return false;
    }
  }
}
