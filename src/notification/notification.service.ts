import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor() {}

  @Get()
  findAll(): string[] {
    return ['This action returns all cats'];
  }
}
