import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userResponseExample = {
  publicId: '9f4ac6e57a3443ef9558f89f7446fa82',
  googleId: null,
  firstnameTh: 'อนุรักษ์',
  lastnameTh: 'กิ้วภูเขียว',
  firstnameEn: 'Anurak',
  lastnameEn: 'Kiwphukiaw',
  email: 'anurak@example.com',
  mobile: '0891234567',
  thumbnailPhotoUrl: 'https://example.com/photos/anurak.jpg',
  position: 'Developer',
  userStatusId: 1,
  roleId: 1,
  lastLoginAt: '2026-03-12T06:45:21.597Z',
  createdAt: '2025-06-28T10:14:29.163Z',
  updatedAt: '2026-03-12T06:45:21.598Z',
  role: {
    id: 1,
    name: 'Administrator',
    roleStatusId: 1,
    createdAt: '2025-06-28T10:13:08.909Z',
    updatedAt: '2025-06-28T10:13:08.909Z',
  },
  status: {
    id: 1,
    key: 'ACTIVE',
    name: 'Active',
  },
};

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_NAMES.ADMINISTRATOR, ROLE_NAMES.HR)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'สร้างผู้ใช้ใหม่',
    description:
      'สำหรับ admin หรือ HR ใช้สร้างผู้ใช้ใหม่พร้อมกำหนด role, status และรหัสผ่านเริ่มต้น',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'ข้อมูลผู้ใช้ใหม่',
  })
  @ApiCreatedResponse({
    description: 'สร้างผู้ใช้สำเร็จ',
    schema: {
      example: userResponseExample,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'ไม่ได้ส่ง access token หรือ token ไม่ถูกต้อง',
  })
  @ApiForbiddenResponse({
    description: 'มี token แต่ role ไม่มีสิทธิ์ใช้งาน endpoint นี้',
    schema: {
      example: {
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'ดูรายการผู้ใช้ทั้งหมด',
    description:
      'ใช้สำหรับหน้าจัดการผู้ใช้ โดยคืนข้อมูล user พร้อม role และ status ของแต่ละรายการ',
  })
  @ApiOkResponse({
    description: 'รายการผู้ใช้ทั้งหมด',
    schema: {
      example: [userResponseExample],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'ไม่ได้ส่ง access token หรือ token ไม่ถูกต้อง',
  })
  @ApiForbiddenResponse({
    description: 'มี token แต่ role ไม่มีสิทธิ์ใช้งาน endpoint นี้',
  })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({
    summary: 'ดูข้อมูลผู้ใช้รายคน',
    description: 'ดึงข้อมูลผู้ใช้ตาม `publicId` พร้อม role และ status',
  })
  @ApiParam({
    name: 'publicId',
    example: '9f4ac6e57a3443ef9558f89f7446fa82',
    description: 'Public ID ของผู้ใช้ที่ต้องการค้นหา',
  })
  @ApiOkResponse({
    description: 'ข้อมูลผู้ใช้รายคน',
    schema: {
      example: userResponseExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบผู้ใช้ที่ระบุ',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @Get(':publicId')
  findOne(@Param('publicId') publicId: string) {
    return this.userService.findOne(publicId);
  }

  @ApiOperation({
    summary: 'อัปเดตข้อมูลผู้ใช้',
    description:
      'แก้ไขข้อมูล profile, role, status หรือ password ของผู้ใช้ที่ระบุด้วย `publicId`',
  })
  @ApiParam({
    name: 'publicId',
    example: '9f4ac6e57a3443ef9558f89f7446fa82',
    description: 'Public ID ของผู้ใช้ที่ต้องการอัปเดต',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'ส่งเฉพาะ field ที่ต้องการแก้ไข',
  })
  @ApiOkResponse({
    description: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
    schema: {
      example: {
        ...userResponseExample,
        position: 'Senior Developer',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบผู้ใช้ที่ระบุ',
  })
  @Patch(':publicId')
  update(
    @Param('publicId') publicId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(publicId, updateUserDto);
  }

  @ApiOperation({
    summary: 'ลบผู้ใช้',
    description:
      'ลบผู้ใช้พร้อมลบ refresh token ที่ผูกกับผู้ใช้นั้นก่อน เพื่อไม่ให้ token ค้างในระบบ',
  })
  @ApiParam({
    name: 'publicId',
    example: '9f4ac6e57a3443ef9558f89f7446fa82',
    description: 'Public ID ของผู้ใช้ที่ต้องการลบ',
  })
  @ApiOkResponse({
    description: 'ลบผู้ใช้สำเร็จและคืนข้อมูลผู้ใช้ที่ถูกลบ',
    schema: {
      example: userResponseExample,
    },
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบผู้ใช้ที่ระบุ',
  })
  @Delete(':publicId')
  remove(@Param('publicId') publicId: string) {
    return this.userService.remove(publicId);
  }
}
