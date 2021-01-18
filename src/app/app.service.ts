import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../config/configuration';

@Injectable()
export class AppService {
  constructor(private apiConfigService: ApiConfigService) {}
  getHello(): string {
    return 'Hello World!';
  }

  getMongo(): string {
    return this.apiConfigService.mongoURL;
  }
}
