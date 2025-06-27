import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getUsers() {
    return [
      { id: 1, name: 'Benz', email: 'Benz@example.com' },
      { id: 2, name: 'Milo', email: 'Milo@example.com' },
      { id: 3, name: 'PorNahee', email: 'PorNahee@example.com' },
    ];
  }
}
