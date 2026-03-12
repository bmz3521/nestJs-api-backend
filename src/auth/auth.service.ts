import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  sanitizeUser,
  userWithRelationsArgs,
  UserWithRelations,
} from '../user/user-response';
import { AuthConfigService } from './auth-config.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase().trim() },
      ...userWithRelationsArgs,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.ensureUserIsActive(user);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      ...userWithRelationsArgs,
    });

    const tokens = await this.generateTokens(updatedUser);

    return {
      ...tokens,
      user: sanitizeUser(updatedUser),
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(refreshTokenDto.refreshToken);

    const user = await this.findUserByPublicId(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.ensureUserIsActive(user);

    const tokenRecord = await this.prisma.userToken.findUnique({
      where: { userId: user.id },
    });

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      tokenRecord.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: sanitizeUser(user),
    };
  }

  async logout(publicId: string) {
    await this.revokeRefreshToken(publicId);
    return { message: 'Logged out successfully' };
  }

  async me(publicId: string) {
    const user = await this.findUserByPublicId(publicId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.ensureUserIsActive(user);
    return sanitizeUser(user);
  }

  async changePassword(publicId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.findUserByPublicId(publicId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      }),
      this.prisma.userToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'Password updated successfully' };
  }

  private async generateTokens(user: UserWithRelations) {
    const payload: JwtPayload = {
      sub: user.publicId,
      email: user.email,
      role: user.role.name,
    };

    const [accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn] =
      await Promise.all([
        this.authConfigService.getAccessSecret(),
        this.authConfigService.getRefreshSecret(),
        this.authConfigService.getAccessExpiresIn(),
        this.authConfigService.getRefreshExpiresIn(),
      ]);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(
      Date.now() + this.parseExpiresInToMs(refreshExpiresIn),
    );

    await this.prisma.userToken.upsert({
      where: { userId: user.id },
      update: {
        hashedRefreshToken,
        expiresAt,
        isRevoked: false,
      },
      create: {
        userId: user.id,
        hashedRefreshToken,
        expiresAt,
        isRevoked: false,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const refreshSecret = await this.authConfigService.getRefreshSecret();
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async revokeRefreshToken(publicId: string) {
    const user = await this.findUserByPublicId(publicId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.userToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });
  }

  private async findUserByPublicId(publicId: string) {
    return this.prisma.user.findUnique({
      where: { publicId },
      ...userWithRelationsArgs,
    });
  }

  private ensureUserIsActive(user: UserWithRelations) {
    if (user.status.key !== 'ACTIVE') {
      throw new ForbiddenException('User is inactive');
    }
  }

  private parseExpiresInToMs(value: string): number {
    const trimmedValue = value.trim();

    if (/^\d+$/.test(trimmedValue)) {
      return Number(trimmedValue) * 1000;
    }

    const match = trimmedValue.match(/^(\d+)([smhd])$/i);
    if (!match) {
      throw new Error(`Unsupported expiresIn format: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported expiresIn format: ${value}`);
    }
  }
}
