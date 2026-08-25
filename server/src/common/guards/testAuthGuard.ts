import { CanActivate } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TestJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    const req = ctx.req;
    const token = req.cookies['accessToken'];
    console.log('the token in the test guard: ', token)
    if (!token) return false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('the decoded thing: ', decoded)
      req.user = decoded;
      return true;
    } catch (error) {
      console.log('Error while verifying the token: ', error);
      return false;
    }
  }
}
