import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMyProfile(@Request() req: any) {
    return this.userService.getProfile(req.user.sub);
  }

  @Put('me')
  async updateMyProfile(
    @Request() req: any,
    @Body('name') name?: string,
    @Body('bio') bio?: string,
    @Body('skills') skills?: string[],
  ) {
    return this.userService.updateProfile(req.user.sub, {
      name,
      bio,
      skills,
    });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
