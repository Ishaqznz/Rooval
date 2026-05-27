import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import * as jwt from 'jsonwebtoken';
import { MyJwtPayload } from "../interfaces/jwt.interface";

@Injectable()
export class JwtAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context).getContext()
        const req = ctx.req
        const token = req.cookies['accessToken']
        if (!token) return false;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as MyJwtPayload
            if (decoded?.role !== 'admin') return false
            req.admin = decoded
            return true;
        } catch (error) {
            console.log('Error while verifying the token: ', error);
            return false;
        }
    }
}