import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ROLE_NAMES } from '../auth/constants/roles.constants';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const roleResponseExample = {
  id: 1,
  name: 'Administrator',
  roleStatusId: 1,
  createdAt: '2025-06-28T10:13:08.909Z',
  updatedAt: '2025-06-28T10:13:08.909Z',
  status: {
    id: 1,
    key: 'ACTIVE',
    name: 'Active',
  },
};

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_NAMES.ADMINISTRATOR, ROLE_NAMES.HR)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: 'สร้าง role ใหม่',
    description:
      'สำหรับ admin หรือ HR ใช้สร้าง role ใหม่เพื่อรองรับสิทธิ์การเข้าถึงในระบบ',
  })
  @ApiBody({
    type: CreateRoleDto,
    description: 'ข้อมูล role ใหม่',
  })
  @ApiCreatedResponse({
    description: 'สร้าง role สำเร็จ',
    schema: {
      example: roleResponseExample,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'ไม่ได้ส่ง access token หรือ token ไม่ถูกต้อง',
  })
  @ApiForbiddenResponse({
    description: 'มี token แต่ role ไม่มีสิทธิ์ใช้งาน endpoint นี้',
  })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({
    summary: 'ดูรายการ role ทั้งหมด',
    description: 'คืนรายการ role ในระบบพร้อมสถานะของแต่ละ role',
  })
  @ApiOkResponse({
    description: 'รายการ role ทั้งหมด',
    schema: {
      example: [roleResponseExample],
    },
  })
  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @ApiOperation({
    summary: 'ดูข้อมูล role รายตัว',
    description: 'ดึงรายละเอียด role จาก `id`',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'รหัส role ที่ต้องการค้นหา',
  })
  @ApiOkResponse({
    description: 'ข้อมูล role รายตัว',
    schema: {
      example: roleResponseExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบ role ที่ระบุ',
    schema: {
      example: {
        message: 'Role not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({
    summary: 'อัปเดต role',
    description: 'แก้ไขชื่อ role หรือสถานะของ role ที่ระบุด้วย `id`',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'รหัส role ที่ต้องการอัปเดต',
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'ส่งเฉพาะ field ที่ต้องการแก้ไข',
  })
  @ApiOkResponse({
    description: 'อัปเดต role สำเร็จ',
    schema: {
      example: {
        ...roleResponseExample,
        name: 'Operations',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบ role ที่ระบุ',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @ApiOperation({
    summary: 'ลบ role',
    description:
      'ลบ role ที่ไม่ได้ถูกใช้งานโดยผู้ใช้คนใดอยู่ หากมีผู้ใช้ผูก role นี้อยู่จะลบไม่ได้',
  })
  @ApiParam({
    name: 'id',
    example: 6,
    description: 'รหัส role ที่ต้องการลบ',
  })
  @ApiOkResponse({
    description: 'ลบ role สำเร็จ',
    schema: {
      example: roleResponseExample,
    },
  })
  @ApiForbiddenResponse({
    description: 'มี token แต่ role ไม่มีสิทธิ์ใช้งาน endpoint นี้',
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบ role ที่ระบุ',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }
}
