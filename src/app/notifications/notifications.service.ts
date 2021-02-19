import { Model } from 'mongoose';
import { ApiConfigService } from 'src/config/configuration';
import { MessageNotification, User } from 'src/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(MessageNotification.name)
    private readonly userModel: Model<User>,
  ) {}

  //Add, dismiss? (Do we want history), get (In batches, so paginated)

  add() {
    return 'asd';
  }

  dismiss() {}

  getAll() {
    return this.userModel.find({});
  }

  getPaginated() {}
}
