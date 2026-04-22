import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Cookies } from 'src/common/decorators/cookie.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ThrottleGuard } from 'src/common/guards/throttle.guard';
import { CoreApiResponse } from 'src/common/response/core-api.response';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { AuthUseCaseService } from 'src/use-cases/auth/auth.usecase.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authUseCaseService: AuthUseCaseService,
    private readonly reqContext: IRequestContextService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return CoreApiResponse.success(await this.authUseCaseService.register(registerDto));
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authUseCaseService.login(loginDto);
    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800') * 1000,
    });
    return CoreApiResponse.success(result);
  }

  @Post('logout')
  @UseGuards(AuthGuard, ThrottleGuard)
  async logout(@Cookies('sessionId') sessionId: string, @Res({ passthrough: true }) res: Response) {
    const accessid = this.reqContext.get<string>('accessId');
    if (sessionId) {
      await this.authUseCaseService.logout(sessionId, accessid);
      res.clearCookie('sessionId');
    }
    return CoreApiResponse.success({ message: 'Logged out successfully' });
  }

  @Post('refresh')
  async refreshToken(@Cookies('sessionId') sessionId: string, @Res({ passthrough: true }) res: Response) {
    return CoreApiResponse.success(await this.authUseCaseService.refreshToken(sessionId));
  }
}
