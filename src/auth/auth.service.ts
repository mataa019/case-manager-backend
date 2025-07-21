import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { AuthDto } from './Auth.dto';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

async register(Authdto: AuthDto): Promise<{ access_token: string; refresh_token: string }> {
  const existingEmail = await this.prisma.user.findUnique({ where: { email: Authdto.email } });
  if (existingEmail) throw new UnauthorizedException('Email already in use');

  const existingUsername = await this.prisma.user.findUnique({ where: { username: Authdto.username } });
  if (existingUsername) throw new UnauthorizedException('Username already in use');

  const hash = await bcrypt.hash(Authdto.password, 10);
  const user = await this.prisma.user.create({
    data: {
      email: Authdto.email,
      password: hash,
      username: Authdto.username, 
      fullname: Authdto.fullname,
      Gender: Authdto.Gender,
    },
  });
  return this.createTokensAndSave(user);
}

  async login(dto: AuthDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email, username: dto.username } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.createTokensAndSave(user);
  }

  async refresh(userId: number, refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.createTokensAndSave(user);
  }

  private async createTokensAndSave(user: User) {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '60m' });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refresh_token },
    });
    return { 
        userId: user.id,
        access_token, 
        refresh_token
     };
  }
  
async getAccountInfo(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      Gender: true,
    },
  });
  if (!user) throw new UnauthorizedException('User not found');
  return user;
}

}
