import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleMenuAccessService } from './role-menu-access.service';
import { CreateRoleMenuAccessDto } from './dto/create-role-menu-access.dto';
import { UpdateRoleMenuAccessDto } from './dto/update-role-menu-access.dto';

@Controller('role-menu-access')
export class RoleMenuAccessController {
  constructor(private readonly roleMenuAccessService: RoleMenuAccessService) {}

  @Post()
  create(@Body() createRoleMenuAccessDto: CreateRoleMenuAccessDto) {
    return this.roleMenuAccessService.create(createRoleMenuAccessDto);
  }

  @Get()
  findAll() {
    return this.roleMenuAccessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleMenuAccessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleMenuAccessDto: UpdateRoleMenuAccessDto) {
    return this.roleMenuAccessService.update(+id, updateRoleMenuAccessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleMenuAccessService.remove(+id);
  }
}
