import { Test, TestingModule } from '@nestjs/testing';
import { RoleMenuAccessController } from './role-menu-access.controller';
import { RoleMenuAccessService } from './role-menu-access.service';

describe('RoleMenuAccessController', () => {
  let controller: RoleMenuAccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleMenuAccessController],
      providers: [RoleMenuAccessService],
    }).compile();

    controller = module.get<RoleMenuAccessController>(RoleMenuAccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
