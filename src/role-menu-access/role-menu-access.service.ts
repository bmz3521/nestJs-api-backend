import { Injectable } from '@nestjs/common';
import { CreateRoleMenuAccessDto } from './dto/create-role-menu-access.dto';
import { UpdateRoleMenuAccessDto } from './dto/update-role-menu-access.dto';

@Injectable()
export class RoleMenuAccessService {
  create(createRoleMenuAccessDto: CreateRoleMenuAccessDto) {
    return 'This action adds a new roleMenuAccess';
  }

  findAll() {
    return `This action returns all roleMenuAccess`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roleMenuAccess`;
  }

  update(id: number, updateRoleMenuAccessDto: UpdateRoleMenuAccessDto) {
    return `This action updates a #${id} roleMenuAccess`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleMenuAccess`;
  }
}
