import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/jwt/jwt.strategy';


@Module({
    providers: [AuthService,JwtStrategy],
    controllers: [AuthController],
    imports: [PrismaModule, JwtModule.register({
    secret: process.env.JWT_SECRET || 'defaultSecret',
    signOptions: { expiresIn: '60m' }, 
  })],
})
export class CaseModule {}
