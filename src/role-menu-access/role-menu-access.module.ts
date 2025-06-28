import { Module } from '@nestjs/common';
import { RoleMenuAccessService } from './role-menu-access.service';
import { RoleMenuAccessController } from './role-menu-access.controller';

@Module({
  controllers: [RoleMenuAccessController],
  providers: [RoleMenuAccessService],
})
export class RoleMenuAccessModule {}
