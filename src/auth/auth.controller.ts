import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUserDecorator } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './interfaces/current-user.interface';

const authUserExample = {
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

const authTokensExample = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.token.example',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token.example',
  user: authUserExample,
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login ด้วย email และ password',
    description:
      'ตรวจสอบข้อมูลผู้ใช้และออก access token กับ refresh token สำหรับใช้งาน API ที่ต้องยืนยันตัวตน',
  })
  @ApiBody({
    type: LoginDto,
    description: 'ข้อมูลสำหรับเข้าสู่ระบบ',
  })
  @ApiCreatedResponse({
    description: 'Login สำเร็จและได้ token กลับมา',
    schema: {
      example: authTokensExample,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Email หรือ password ไม่ถูกต้อง',
    schema: {
      example: {
        message: 'Invalid email or password',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({
    summary: 'ขอ token ชุดใหม่ด้วย refresh token',
    description:
      'ใช้ refresh token ที่ยังไม่หมดอายุและยังไม่ถูก revoke เพื่อขอ access token และ refresh token ชุดใหม่',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token ที่ได้จากการ login หรือ refresh ล่าสุด',
  })
  @ApiCreatedResponse({
    description: 'ออก token ชุดใหม่สำเร็จ',
    schema: {
      example: authTokensExample,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token ไม่ถูกต้อง หมดอายุ หรือถูก revoke แล้ว',
    schema: {
      example: {
        message: 'Refresh token has expired',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout และ revoke refresh token',
    description:
      'ยกเลิก refresh token ปัจจุบันของผู้ใช้เพื่อไม่ให้ใช้ขอ token ใหม่ได้อีก',
  })
  @ApiCreatedResponse({
    description: 'Logout สำเร็จ',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'ไม่ได้ส่ง access token หรือ token ไม่ถูกต้อง',
  })
  @Post('logout')
  logout(@CurrentUserDecorator() user: CurrentUser) {
    return this.authService.logout(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'ดึงข้อมูลผู้ใช้ปัจจุบัน',
    description:
      'อ่านข้อมูล profile, role, และ status ของผู้ใช้จาก access token ที่แนบมา',
  })
  @ApiOkResponse({
    description: 'ข้อมูลผู้ใช้ปัจจุบัน',
    schema: {
      example: authUserExample,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'ไม่ได้ส่ง access token หรือ token ไม่ถูกต้อง',
  })
  @ApiForbiddenResponse({
    description: 'ผู้ใช้ถูกปิดการใช้งาน',
    schema: {
      example: {
        message: 'User is inactive',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @Get('me')
  me(@CurrentUserDecorator() user: CurrentUser) {
    return this.authService.me(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'เปลี่ยนรหัสผ่านผู้ใช้ปัจจุบัน',
    description:
      'ตรวจสอบรหัสผ่านเดิมก่อนอัปเดตรหัสผ่านใหม่ และ revoke refresh token เดิมทั้งหมดหลังเปลี่ยนสำเร็จ',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'รหัสผ่านเดิมและรหัสผ่านใหม่',
  })
  @ApiCreatedResponse({
    description: 'เปลี่ยนรหัสผ่านสำเร็จ',
    schema: {
      example: {
        message: 'Password updated successfully',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'ไม่ได้ส่ง access token หรือรหัสผ่านเดิมไม่ถูกต้อง',
    schema: {
      example: {
        message: 'Current password is incorrect',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Post('change-password')
  changePassword(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, changePasswordDto);
  }
}
