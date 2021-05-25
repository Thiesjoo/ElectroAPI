import { FilterQuery } from 'mongoose';
import {
  AuthTokenPayloadDTO,
  DeleteMessageNotificationDTO,
  IMessageNotification,
  MessageNotification,
  PaginatedRequestDTO,
  PaginateModel,
  PaginateOptions,
  PaginateResult,
  UpdateMessageNotificationDTO,
} from 'src/models';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LiveService } from '../live/live.service';

/** Service for notification controller */
@Injectable()
export class NotificationService {
  /** Constructor */
  constructor(
    @InjectModel(MessageNotification.name)
    private notfModel: PaginateModel<MessageNotification>,
    private liveService: LiveService,
  ) {}

  //Add, dismiss? (Do we want history), get (Paginated. By ID.  All is only for dev?)

  /**
   * Add a notification to DB
   * @param token Token of user
   * @param notf Notification to add
   */
  async add(
    token: { sub: string },
    notf: IMessageNotification,
  ): Promise<IMessageNotification> {
    const notification = await this.notfModel.create({
      ...notf,
      user: token.sub,
    });

    this.liveService.patchNotification('add', token.sub, notification);

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
    this.liveService.patchNotification('update', token.sub, notification);

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

    this.liveService.removeNotification(token.sub, id);

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
   * Get paginated notifications from DB.
   * //TODO: Add max time for query. User input can still be long
   * @param token Token of user
   * @param options Options for the query
   */
  getPaginated(
    token: AuthTokenPayloadDTO,
    options: PaginatedRequestDTO,
  ): Promise<PaginateResult<IMessageNotification>> {
    const query: FilterQuery<MessageNotification> = {};

    if (options.queryAll) {
      const val = new RegExp(options.queryAll, 'gi');
      query.$or = [{ message: val }, { 'author.name': val }, { title: val }];
    } else {
      ['Author', 'Message', 'Title'].forEach((x) => {
        const opt = options['query' + x];
        if (opt) {
          const val = new RegExp(opt, 'gi');
          query[x === 'Author' ? 'author.name' : x.toLowerCase()] = val;
        }
      });
    }

    if (options.fromTime) {
      query.time ??= {};
      query.time['$gte'] = new Date(options.fromTime).toISOString();
    }
    if (options.tillTime) {
      query.time ??= {};
      query.time['$lte'] = new Date(options.tillTime).toISOString();
    }

    console.log(query.time, options.sort, typeof options.sort);
    query.user = token.sub;

    const paginateOptions: PaginateOptions<MessageNotification> = {
      limit: options.limit ? (options.limit > 100 ? 100 : options.limit) : 25,
      page: options.page || 1,
      sort: { time: options.sort === undefined ? -1 : options.sort ? -1 : 1 },
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
