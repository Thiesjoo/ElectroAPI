import {
  AuthTokenPayload,
  IMessageNotification,
  MessageNotification,
  PaginateModel
} from 'src/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(MessageNotification.name)
    private notfModel: PaginateModel<MessageNotification>,
  ) {}

  //Add, dismiss? (Do we want history), get (Paginated. By ID.  All is only for dev?)

  add(token: AuthTokenPayload, notf: IMessageNotification) {
    return this.notfModel.create({
      ...notf,
      user: token.sub,
    });
  }

  dismiss() {}

  getAll(token: AuthTokenPayload) {
    return this.notfModel.find({ user: token.sub });
  }

  getWithID(token: AuthTokenPayload, id: string) {
    return this.notfModel.find({ _id: id, user: token.sub });
  }

  getPaginated(
    token: AuthTokenPayload,
    query: string,
    // Search in:
    // - Title
    // - Body
    // - Author
    page: number,
    limit: number,
  ) {
    return this.notfModel.paginate(
      {
        user: token.sub,
      },
      {
        page,
        limit: limit > 100 ? 100 : limit,
      },
    );
  }
}
