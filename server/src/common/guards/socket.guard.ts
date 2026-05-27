import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Socket } from "socket.io";
import * as cookie from "cookie";
import * as jwt from "jsonwebtoken";
import { MyJwtPayload } from "../interfaces/jwt.interface";

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();

    const cookies = client.handshake.headers.cookie;
    if (!cookies) return false;

    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies["accessToken"]; 

    if (!token) return false;

    try {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET);
      client.data.user = payload;

      return true;
    } catch (err) {
      return false;
    }
  }
}