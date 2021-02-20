import {
  AuthTokenPayload,
  IMessageNotification,
  MessageNotification,
  PaginateModel
} from 'src/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

/** Service for notification controller */
@Injectable()
export class NotificationService {
  /** Constructor */
  constructor(
    @InjectModel(MessageNotification.name)
    private notfModel: PaginateModel<MessageNotification>,
  ) {}

  //Add, dismiss? (Do we want history), get (Paginated. By ID.  All is only for dev?)

  /**
   * Add a notification to DB
   * @param token Token of user
   * @param notf Notification to add
   */
  add(token: AuthTokenPayload, notf: IMessageNotification) {
    return this.notfModel.create({
      ...notf,
      user: token.sub,
    });
  }

  /** Remove notification from DB */
  dismiss() {}

  /** Get all notifications from DB. (Not used) */
  getAll(token: AuthTokenPayload) {
    return this.notfModel.find({ user: token.sub });
  }

  /** Get specific notification from DB */
  getWithID(token: AuthTokenPayload, id: string) {
    return this.notfModel.find({ _id: id, user: token.sub });
  }

  /**
   * Get paginated notifications from DB
   * @param token Token of user
   * @param query Query string to search for
   * @param page What page to look for
   * @param limit Amount of items per page
   */
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
