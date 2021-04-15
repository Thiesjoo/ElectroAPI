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
  startingAfter?: string;
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
