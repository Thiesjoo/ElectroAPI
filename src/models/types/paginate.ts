import { Document, FilterQuery, Model } from 'mongoose';

export interface PaginateOptions<T> {
  query?: FilterQuery<T>;
  select?: object | string;
  sort?: object | string;
  populate?: object[] | string[] | object | string;
  page?: number;
  limit?: number;
  //Default: _id
  key?: string;
  /**
   *  A cursor for use in pagination. startingAfter is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include startingAfter=obj_foo in order to fetch the next page of the list.
   */
  startingAfter?: string;
  /**
   * A cursor for use in pagination. endingBefore is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, starting with obj_bar, your subsequent call can include endingBefore=obj_bar in order to fetch the previous page of the list.
   */
  endingBefore?: string;
  // Set this to true, if you need to support $geo queries.
  forceCountFunction?: boolean;
}

export interface PaginateResult<T> {
  docs: T[];
  totalDocs?: number;
  limit?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: Boolean;
  hasNextPage?: Boolean;
  prevPage?: number;
  nextPage?: number;
  hasMore?: Boolean;
}

/**
 * Paginate model typing
 */
export interface PaginateModel<T extends Document> extends Model<T> {
  /** Paginate function */
  paginate(
    options?: PaginateOptions<T>,
    callback?: (err: any, result: PaginateResult<T>) => void,
  ): Promise<PaginateResult<T>>;
}
