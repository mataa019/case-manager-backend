import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
    private prisma= new PrismaClient();
    constructor(private jwtService: JwtService) {}
    
}
