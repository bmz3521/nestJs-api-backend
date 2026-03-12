import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    await this.ensureRoleNameIsAvailable(createRoleDto.name);
    await this.ensureStatusExists(createRoleDto.roleStatusId);

    return this.prisma.role.create({
      data: createRoleDto,
      include: {
        status: true,
      },
    });
  }

  findAll() {
    return this.prisma.role.findMany({
      include: {
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id);

    if (updateRoleDto.name) {
      await this.ensureRoleNameIsAvailable(updateRoleDto.name, id);
    }

    if (updateRoleDto.roleStatusId) {
      await this.ensureStatusExists(updateRoleDto.roleStatusId);
    }

    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
      include: {
        status: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const usersUsingRole = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (usersUsingRole > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users',
      );
    }

    return this.prisma.role.delete({
      where: { id },
      include: {
        status: true,
      },
    });
  }

  private async ensureRoleNameIsAvailable(
    name: string,
    currentRoleId?: number,
  ) {
    const role = await this.prisma.role.findUnique({
      where: { name: name.trim() },
      select: { id: true },
    });

    if (role && role.id !== currentRoleId) {
      throw new BadRequestException('Role name already exists');
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
