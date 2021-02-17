import { ApiConfigService } from 'src/config/configuration';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(private apiConfigService: ApiConfigService) {}

  //Add, dismiss? (Do we want history), get (In batches, so paginated)

  add() {
    return 'asd';
  }

  dismiss() {}

  getAll() {}

  getPaginated() {}
}
