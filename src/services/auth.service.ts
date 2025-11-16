import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name: string) {
    const existingUser = await this.em.findOne(User, { email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = new User();
    user.email = email;
    user.password = password;
    user.name = name;
    user.timeBalance = 0;
    user.completedTrades = 0;
    user.rating = 5.0;

    await this.em.persistAndFlush(user);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async signin(email: string, password: string) {
    const user = await this.em.findOne(User, { email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.em.findOne(User, { id: payload.sub });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user as any;
    return result;
  }
}
