import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getUsers() {
    return [
      { id: 1, name: 'Benz', email: 'Benz@example.com', behavior : 'ดี' },
      { id: 2, name: 'Milo', email: 'Milo@example.com', behavior : 'ดี' },
      { id: 3, name: 'PorNahee', email: 'PorNahee@example.com', behavior : 'เหี้ย' },
      { id: 4, name: 'Bam', email: 'Bam@example.com', behavior : 'รวย' },
    ];
  }
}
