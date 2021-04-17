import { AuthProviders } from '../';
//TODO?: Fix this. Importing could go into ../, but nestjs thinks it has circular dependencies
import { IMessageAuthor } from '../intermediates/message-author.intermediate';

/**
 * General notification class
 */
export class IMessageNotification {
  _id?: string;
  user?: string;
  /** The image */
  image?: string;
  /** The title of the notification */
  title?: string;
  /** The message  */
  message?: string;
  /** The date as a string */
  time?: Date;
  /** The date as a string */
  color?: string;
  /** The author of the message */
  author?: IMessageAuthor;
  /** The provider type of the user */
  providerType?: AuthProviders;
  /** Extra information */
  extra?: any;
}
