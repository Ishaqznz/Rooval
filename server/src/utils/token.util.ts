import { Response } from 'express';

export class TokenUtil {
  static sendAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ) {
  
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.COOKIE_EXPIRY),
    };

    res.cookie('accessToken', accessToken, options);
    res.cookie('refreshToken', refreshToken, options);
  }

  static sendAccessToken(res: Response, accessToken: string) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(process.env.COOKIE_EXPIRY),
    };

    res.cookie('accessToken', accessToken, options);
  }

  static clearAuthCookies(res: Response) {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
  }
}
