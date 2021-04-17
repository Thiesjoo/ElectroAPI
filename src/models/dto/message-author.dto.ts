import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { IMessageAuthor } from '../intermediates';

@Exclude()
export class MessageAuthorDTO {
  /** Name of the author */
  @IsString()
  @Expose()
  name: string;
  /** Profile picture of the author */
  @IsString()
  image: string;
}

export function messageAuthorMapper(author: IMessageAuthor): MessageAuthorDTO {
  return {
    name: author.name,
    image: author.image,
  };
}
