import { Response, CookieOptions } from 'express';

export class TokenUtil {
  private static getCookieOptions(includeExpiry = true): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const options: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    };

    if (includeExpiry && process.env.COOKIE_EXPIRY) {
      options.maxAge = Number(process.env.COOKIE_EXPIRY);
    }

    return options;
  }

  static sendAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ) {
    const options = this.getCookieOptions(true);

    res.cookie('accessToken', accessToken, options);
    res.cookie('refreshToken', refreshToken, options);
  }

  static sendAccessToken(res: Response, accessToken: string) {
    const options = this.getCookieOptions(true);

    res.cookie('accessToken', accessToken, options);
  }

  static clearAuthCookies(res: Response) {
    const options = this.getCookieOptions(false);

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
  }
}