import { Test, TestingModule } from '@nestjs/testing';
import { RoleMenuAccessService } from './role-menu-access.service';

describe('RoleMenuAccessService', () => {
  let service: RoleMenuAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleMenuAccessService],
    }).compile();

    service = module.get<RoleMenuAccessService>(RoleMenuAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
