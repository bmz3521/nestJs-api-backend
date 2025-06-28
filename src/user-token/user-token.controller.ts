import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserTokenService } from './user-token.service';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { UpdateUserTokenDto } from './dto/update-user-token.dto';

@Controller('user-token')
export class UserTokenController {
  constructor(private readonly userTokenService: UserTokenService) {}

  @Post()
  create(@Body() createUserTokenDto: CreateUserTokenDto) {
    return this.userTokenService.create(createUserTokenDto);
  }

  @Get()
  findAll() {
    return this.userTokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userTokenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserTokenDto: UpdateUserTokenDto) {
    return this.userTokenService.update(+id, updateUserTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userTokenService.remove(+id);
  }
}
