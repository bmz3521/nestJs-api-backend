import { IsString, IsOptional, IsEmail, IsInt, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  googleId?: string;

  @IsString()
  firstnameTh: string;

  @IsString()
  lastnameTh: string;

  @IsString()
  firstnameEn: string;

  @IsString()
  lastnameEn: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  thumbnailPhotoUrl?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsInt()
  userStatusId: number;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
