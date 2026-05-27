import { Socket } from "socket.io";
import * as jwt from 'jsonwebtoken';
import { MyJwtPayload } from "src/common/interfaces/jwt.interface";

export class SocketConnectionHandler {
    static authHandleConnection(client: Socket) {
        const cookieString = client?.handshake?.headers?.cookie
        const cookies = Object.fromEntries(
            cookieString.split('; ').map(cookie => {
                const [key, value] = cookie.split('=');
                return [key, value];
            })
        );

        const accessToken = cookies?.accessToken;
        if (!accessToken) return false;
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET) as MyJwtPayload
            client.data.user = decoded
            return true;
        } catch (error) {
            console.log('Error while verifying the token: ', error);
            return false;
        }
    }
}