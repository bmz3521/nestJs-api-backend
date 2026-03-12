import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'Employee123!',
    description: 'รหัสผ่านปัจจุบันของผู้ใช้',
  })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({
    example: 'Employee456!',
    description: 'รหัสผ่านใหม่ของผู้ใช้ ต้องมีอย่างน้อย 8 ตัวอักษร',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
