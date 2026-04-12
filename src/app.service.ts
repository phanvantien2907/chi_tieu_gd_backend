import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getMessage(): string {
    return 'Welcome to NestJS!';
  }
}
