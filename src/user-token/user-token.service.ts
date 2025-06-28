import { Injectable } from '@nestjs/common';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { UpdateUserTokenDto } from './dto/update-user-token.dto';

@Injectable()
export class UserTokenService {
  create(createUserTokenDto: CreateUserTokenDto) {
    return 'This action adds a new userToken';
  }

  findAll() {
    return `This action returns all userToken`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userToken`;
  }

  update(id: number, updateUserTokenDto: UpdateUserTokenDto) {
    return `This action updates a #${id} userToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} userToken`;
  }
}
