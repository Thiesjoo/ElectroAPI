import { FilterQuery } from 'mongoose';
import { InjectionTokens } from 'src/common/injection.tokens';
import {
  AuthTokenPayloadDTO,
  DeleteMessageNotificationDTO,
  IMessageNotification,
  MessageNotification,
  messageNotificationMapper,
  MyPusher,
  PaginatedRequestDTO,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
  pusherPrivatePrefix,
  UpdateMessageNotificationDTO,
} from 'src/models';
import { QueryPlaces } from 'src/models/enums/query';
import { NotificationRoutes } from 'src/sockets';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

/** Service for notification controller */
@Injectable()
export class NotificationService {
  /** Constructor */
  constructor(
    @InjectModel(MessageNotification.name)
    private notfModel: PaginateModel<MessageNotification>,
    @Inject(InjectionTokens.Pusher) private pusher: MyPusher,
  ) {}

  //Add, dismiss? (Do we want history), get (Paginated. By ID.  All is only for dev?)

  /**
   * Add a notification to DB
   * @param token Token of user
   * @param notf Notification to add
   */
  async add(
    token: AuthTokenPayloadDTO,
    notf: IMessageNotification,
  ): Promise<IMessageNotification> {
    const notification = await this.notfModel.create({
      ...notf,
      user: token.sub,
    });

    this.pusher.trigger(
      `${pusherPrivatePrefix}${token.sub}`,
      NotificationRoutes.Add,
      messageNotificationMapper(notification),
    );

    return notification;
  }

  async update(
    token: AuthTokenPayloadDTO,
    id: string,
    updated: UpdateMessageNotificationDTO,
  ): Promise<IMessageNotification> {
    const notification = await this.notfModel.findOneAndUpdate(
      { _id: id, user: token.sub },
      { $set: { ...updated, user: token.sub } },
      { useFindAndModify: false, new: true },
    );

    this.pusher.trigger(
      `${pusherPrivatePrefix}${token.sub}`,
      NotificationRoutes.Update,
      messageNotificationMapper(notification),
    );

    return notification;
  }

  /** Remove notification from DB */
  async remove(
    token: AuthTokenPayloadDTO,
    id: string,
  ): Promise<DeleteMessageNotificationDTO> {
    const notf = await this.notfModel.deleteOne({ user: token.sub, _id: id });
    if (notf.deletedCount !== 1)
      throw new BadRequestException("Notification doesn't exist");

    this.pusher.trigger(
      `${pusherPrivatePrefix}${token.sub}`,
      NotificationRoutes.Remove,
      { _id: id },
    );

    return { _id: id };
  }

  /** Get all notifications from DB. (Not PUBLIC) */
  getAll(token: AuthTokenPayloadDTO) {
    return this.notfModel.find({ user: token.sub });
  }

  /** Get specific notification from DB */
  async getWithID(
    token: AuthTokenPayloadDTO,
    id: string,
  ): Promise<IMessageNotification> {
    return this.notfModel.findOne({ _id: id, user: token.sub }).exec();
  }

  /**
   * Get paginated notifications from DB
   * @param token Token of user
   * @param options Options for the query
   */
  getPaginated(
    token: AuthTokenPayloadDTO,
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
