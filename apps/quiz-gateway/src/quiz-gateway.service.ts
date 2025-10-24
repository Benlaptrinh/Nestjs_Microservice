import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
