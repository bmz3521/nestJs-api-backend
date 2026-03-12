import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Finance',
    description: 'ชื่อ role ใหม่ที่ต้องการสร้าง',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'สถานะของ role เช่น 1 = ACTIVE',
  })
  @IsInt()
  roleStatusId: number;
}
