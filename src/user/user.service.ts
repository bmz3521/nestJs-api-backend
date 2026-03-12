import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { generatePublicId } from '../common/utils/public-id.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { sanitizeUser, userWithRelationsArgs } from './user-response';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    await this.ensureEmailIsAvailable(createUserDto.email);
    await this.ensureRoleExists(createUserDto.roleId);
    await this.ensureStatusExists(createUserDto.userStatusId);

    const user = await this.prisma.user.create({
      data: {
        publicId: generatePublicId(),
        googleId: createUserDto.googleId,
        firstnameTh: createUserDto.firstnameTh,
        lastnameTh: createUserDto.lastnameTh,
        firstnameEn: createUserDto.firstnameEn,
        lastnameEn: createUserDto.lastnameEn,
        email: createUserDto.email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(createUserDto.password, 10),
        mobile: createUserDto.mobile,
        thumbnailPhotoUrl: createUserDto.thumbnailPhotoUrl,
        position: createUserDto.position,
        userStatusId: createUserDto.userStatusId,
        roleId: createUserDto.roleId,
      },
      ...userWithRelationsArgs,
    });

    return sanitizeUser(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      ...userWithRelationsArgs,
      orderBy: [{ firstnameEn: 'asc' }, { lastnameEn: 'asc' }],
    });

    return users.map(sanitizeUser);
  }

  async findOne(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
      ...userWithRelationsArgs,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return sanitizeUser(user);
  }

  async update(publicId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.ensureUserExists(publicId);

    if (updateUserDto.email) {
      await this.ensureEmailIsAvailable(updateUserDto.email, existingUser.id);
    }

    if (updateUserDto.roleId) {
      await this.ensureRoleExists(updateUserDto.roleId);
    }

    if (updateUserDto.userStatusId) {
      await this.ensureStatusExists(updateUserDto.userStatusId);
    }

    const user = await this.prisma.user.update({
      where: { publicId },
      data: {
        googleId: updateUserDto.googleId,
        firstnameTh: updateUserDto.firstnameTh,
        lastnameTh: updateUserDto.lastnameTh,
        firstnameEn: updateUserDto.firstnameEn,
        lastnameEn: updateUserDto.lastnameEn,
        email: updateUserDto.email?.toLowerCase().trim(),
        passwordHash: updateUserDto.password
          ? await bcrypt.hash(updateUserDto.password, 10)
          : undefined,
        mobile: updateUserDto.mobile,
        thumbnailPhotoUrl: updateUserDto.thumbnailPhotoUrl,
        position: updateUserDto.position,
        userStatusId: updateUserDto.userStatusId,
        roleId: updateUserDto.roleId,
      },
      ...userWithRelationsArgs,
    });

    return sanitizeUser(user);
  }

  async remove(publicId: string) {
    const existingUser = await this.ensureUserExists(publicId);
    const user = sanitizeUser(existingUser);

    await this.prisma.$transaction([
      this.prisma.userToken.deleteMany({
        where: { userId: existingUser.id },
      }),
      this.prisma.user.delete({
        where: { publicId },
      }),
    ]);

    return user;
  }

  private async ensureUserExists(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
      ...userWithRelationsArgs,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async ensureEmailIsAvailable(email: string, currentUserId?: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== currentUserId) {
      throw new BadRequestException('Email already exists');
    }
  }

  private async ensureRoleExists(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }
  }

  private async ensureStatusExists(statusId: number) {
    const status = await this.prisma.status.findUnique({
      where: { id: statusId },
      select: { id: true },
    });

    if (!status) {
      throw new BadRequestException('Status not found');
    }
  }
}
