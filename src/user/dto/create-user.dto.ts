import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    example: 'google-oauth-sub-1234567890',
    description: 'Google ID ถ้ามีการผูกบัญชีจาก social login',
  })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiProperty({
    example: 'อนุรักษ์',
    description: 'ชื่อภาษาไทย',
  })
  @IsString()
  firstnameTh: string;

  @ApiProperty({
    example: 'กิ้วภูเขียว',
    description: 'นามสกุลภาษาไทย',
  })
  @IsString()
  lastnameTh: string;

  @ApiProperty({
    example: 'Anurak',
    description: 'ชื่อภาษาอังกฤษ',
  })
  @IsString()
  firstnameEn: string;

  @ApiProperty({
    example: 'Kiwphukiaw',
    description: 'นามสกุลภาษาอังกฤษ',
  })
  @IsString()
  lastnameEn: string;

  @ApiProperty({
    example: 'anurak@example.com',
    description: 'อีเมลสำหรับ login ต้องไม่ซ้ำในระบบ',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin1234!',
    description: 'รหัสผ่านเริ่มต้นของผู้ใช้ ต้องมีอย่างน้อย 8 ตัวอักษร',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: '0891234567',
    description: 'เบอร์โทรศัพท์',
  })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/photos/anurak.jpg',
    description: 'ลิงก์รูปโปรไฟล์',
  })
  @IsOptional()
  @IsString()
  thumbnailPhotoUrl?: string;

  @ApiPropertyOptional({
    example: 'Developer',
    description: 'ตำแหน่งงาน',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({
    example: 1,
    description: 'สถานะของผู้ใช้ เช่น 1 = ACTIVE',
  })
  @IsInt()
  userStatusId: number;

  @ApiProperty({
    example: 1,
    description: 'Role ID ของผู้ใช้ เช่น 1 = Administrator, 2 = Employee',
  })
  @IsInt()
  roleId: number;
}
