import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { AuthDto } from './Auth.dto';

@Injectable()
export class AuthService {
    private prisma= new PrismaClient();
    constructor(private jwtService: JwtService) {}

    async register( AuthDto: AuthDto): Promise<{access_token: string; referesh_token:string}>{
    const existingEmail = await this.prisma.user.findUnique({ where: { email: AuthDto.email } });
     if (existingEmail) throw new UnauthorizedException('Email already in use');
    
    const existingUsername = await this.prisma.user.findUnique({ where: { username: AuthDto.username } });
    if (existingUsername) throw new UnauthorizedException('Username already in use');

    const hash = await crypto.hash(AuthDto.password, 10);
    const user = await this.prisma.user.create({
    data: {
      email: AuthDto.email,
      password: hash,
      username: AuthDto.username,
      Gender: AuthDto.Gender,
    },
  });
  return this.createTokensAndSave(user);
}
    createTokensAndSave(user: { id: number; email: string; password: string; username: string; fullname: string; Gender: string; createdAt: Date; }): { access_token: string; referesh_token: string; } | PromiseLike<{ access_token: string; referesh_token: string; }> {
        throw new Error('Method not implemented.');
    }
}
