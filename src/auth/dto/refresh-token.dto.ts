import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token.example',
    description: 'Refresh token ที่ได้มาจากตอน login หรือ refresh ครั้งล่าสุด',
  })
  @IsString()
  @MinLength(10)
  refreshToken: string;
}
