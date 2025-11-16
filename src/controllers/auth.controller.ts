import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
  ) {
    return this.authService.signup(email, password, name);
  }

  @Post('signin')
  async signin(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.signin(email, password);
  }

  @Get('validate')
  @UseGuards(AuthGuard)
  async validate(@Request() req: any) {
    return { valid: true, user: req.user };
  }
}
