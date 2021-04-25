import { FilterQuery } from 'mongoose';
import Pusher from 'pusher';
import {
  AuthTokenPayload,
  IMessageNotification,
  MessageNotification,
  PaginatedRequestDTO,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
} from 'src/models';
import { QueryPlaces } from 'src/models/enums/query';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { pusherPrivatePrefix } from '../';

/** Service for notification controller */
@Injectable()
export class NotificationService {
  /** Constructor */
  constructor(
    @InjectModel(MessageNotification.name)
    private notfModel: PaginateModel<MessageNotification>,
    @Inject('Pusher') private pusher: Pusher,
  ) {}

  //Add, dismiss? (Do we want history), get (Paginated. By ID.  All is only for dev?)

  /**
   * Add a notification to DB
   * @param token Token of user
   * @param notf Notification to add
   */
  async add(
    token: AuthTokenPayload,
    notf: IMessageNotification,
  ): Promise<IMessageNotification> {
    const notification = await this.notfModel.create({
      ...notf,
      user: token.sub,
    });

    this.pusher.trigger(
      `${pusherPrivatePrefix}${token.sub}`,
      'add',
      notification,
    );

    return notification;
  }

  /** Remove notification from DB */
  dismiss(token: AuthTokenPayload, id: string) {
    return this.notfModel.deleteOne({ id });
  }

  /** Get all notifications from DB. (Not used) */
  getAll(token: AuthTokenPayload) {
    return this.notfModel.find({ user: token.sub });
  }

  /** Get specific notification from DB */
  async getWithID(
    token: AuthTokenPayload,
    id: string,
  ): Promise<IMessageNotification> {
    console.log('Triggering pusher?');
    this.pusher.trigger('private-user', 'lmao', { msg: 'goi' });

    return this.notfModel.findOne({ _id: id, user: token.sub }).exec();
  }

  /**
   * Get paginated notifications from DB
   * @param token Token of user
   * @param options Options for the query
   */
  getPaginated(
    token: AuthTokenPayload,
    options: PaginatedRequestDTO,
  ): Promise<PaginateResult<IMessageNotification>> {
    const query: FilterQuery<MessageNotification> = {};

    if (options.queryString) {
      //FIXME: User input in regex is NOT OKAY
      const val = new RegExp(options.queryString, 'gi');
      switch (options.queryPlace || QueryPlaces.All) {
        case QueryPlaces.All: {
          query.$or = [
            { message: val },
            { 'author.name': val },
            { title: val },
          ];
          break;
        }
        case QueryPlaces.Message: {
          query.message = val;
          break;
        }
        case QueryPlaces.Title: {
          query.title = val;
          break;
        }
        case QueryPlaces.Author: {
          query['author.name'] = val;
          break;
        }
      }
    }

    //TODO: test this
    if (options.fromTime) {
      query.time = { $gte: new Date(options.fromTime) };
    }
    if (options.tillTime) {
      query.time = { $lte: new Date(options.tillTime) };
    }

    query.user = token.sub;

    const paginateOptions: PaginateOptions<MessageNotification> = {
      limit: options.limit ? (options.limit > 100 ? 100 : options.limit) : 25,
      page: options.page || 1,
      sort: { time: -1 },
      query,
    };
    if (options.startingAfter) {
      paginateOptions.startingAfter = options.startingAfter;
    }
    if (options.endingBefore) {
      paginateOptions.endingBefore = options.endingBefore;
    }

    return this.notfModel.paginate(paginateOptions);
  }
}
