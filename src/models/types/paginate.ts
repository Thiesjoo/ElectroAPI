import { Document, FilterQuery, Model } from 'mongoose';

interface CustomLabels {
  totalDocs?: string;
  limit?: string;
  page?: string;
  totalPages?: string;
  docs?: string;
  nextPage?: string;
  prevPage?: string;
}

interface ReadOptions {
  pref: string;
  tags?: any[];
}

interface PaginateOptions {
  select?: object | string;
  sort?: object | string;
  customLabels?: CustomLabels;
  populate?: object[] | string[] | object | string | QueryPopulateOptions;
  lean?: boolean;
  leanWithId?: boolean;
  offset?: number;
  page?: number;
  limit?: number;
  read?: ReadOptions;
  /* If pagination is set to `false`, it will return all docs without adding limit condition. (Default: `true`) */
  pagination?: boolean;
  projection?: any;
  options?: QueryFindOptions;
}

interface QueryFindOptions {
  batchSize?: number;
  comment?: any;
  hint?: any;
  limit?: number;
  maxscan?: number;
  skip?: number;
  snapshot?: any;
  sort?: any;
  tailable?: any;
}

interface QueryPopulateOptions {
  /** space delimited path(s) to populate */
  path: string;
  /** optional fields to select */
  select?: any;
  /** optional query conditions to match */
  match?: any;
  /** optional model to use for population */
  model?: string | Model<any>;
  /** optional query options like sort, limit, etc */
  options?: any;
  /** deep populate */
  populate?: QueryPopulateOptions | QueryPopulateOptions[];
}

export interface PaginateResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page?: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  meta?: any;
  [customLabel: string]: T[] | number | boolean | null | undefined;
}

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(
    query?: FilterQuery<T>,
    options?: PaginateOptions,
    callback?: (err: any, result: PaginateResult<T>) => void,
  ): Promise<PaginateResult<T>>;
}
