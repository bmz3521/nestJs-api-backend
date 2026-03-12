import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'prisma/prisma.service';
import { sanitizeUser, userWithRelationsArgs } from '../../user/user-response';
import { AuthConfigService } from '../auth-config.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    authConfigService: AuthConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_request, _rawJwtToken, done) => {
        authConfigService
          .getAccessSecret()
          .then((secret) => done(null, secret))
          .catch((error: unknown) => done(error as Error, undefined));
      },
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: payload.sub },
      ...userWithRelationsArgs,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status.key !== 'ACTIVE') {
      throw new ForbiddenException('User is inactive');
    }

    return {
      ...sanitizeUser(user),
      sub: user.publicId,
    };
  }
}
