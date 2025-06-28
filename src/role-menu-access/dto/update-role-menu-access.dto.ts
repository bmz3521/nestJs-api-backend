import { PartialType } from '@nestjs/swagger';
import { CreateRoleMenuAccessDto } from './create-role-menu-access.dto';

export class UpdateRoleMenuAccessDto extends PartialType(CreateRoleMenuAccessDto) {}
