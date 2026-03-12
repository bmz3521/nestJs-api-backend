import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'anurak@example.com',
    description: 'Email ของผู้ใช้ที่ใช้สำหรับเข้าสู่ระบบ',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin1234!',
    description: 'รหัสผ่านของผู้ใช้ ต้องมีอย่างน้อย 8 ตัวอักษร',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
