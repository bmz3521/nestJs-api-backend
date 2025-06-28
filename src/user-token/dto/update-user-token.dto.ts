import { PartialType } from '@nestjs/swagger';
import { CreateUserTokenDto } from './create-user-token.dto';

export class UpdateUserTokenDto extends PartialType(CreateUserTokenDto) {}
