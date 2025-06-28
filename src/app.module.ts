import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';
import { RoleMenuAccessModule } from './role-menu-access/role-menu-access.module';
import { UserTokenModule } from './user-token/user-token.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [UserModule, RoleModule, MenuModule, RoleMenuAccessModule, UserTokenModule, StatusModule],
  // controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
