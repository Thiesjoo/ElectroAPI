import { IsString } from 'class-validator';
import { IMessageAuthor } from '../intermediates';

export class MessageAuthorDTO {
  /** Name of the author */
  @IsString()
  name: string;
  /** Profile picture of the author */
  @IsString()
  image: string;
}

export function messageAuthorMapper(
  author: IMessageAuthor | undefined,
): MessageAuthorDTO {
  return {
    name: author?.name,
    image: author?.image,
  };
}
