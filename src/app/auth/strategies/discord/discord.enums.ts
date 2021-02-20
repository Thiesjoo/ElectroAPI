export interface DiscordUser {
  /** The user's id */
  id: string;
  /** Their name */
  username: string;
  /** The hash of the user's avatar */
  avatar?: string;
  /** The user's 4-digit discord-tag */
  discriminator: string;
  /** The user's chosen language option */
  locale: string;
  /** The connection object that the user has attached   */
  connections?: Connection[];
}

/** Connection interface from Discord API */
export interface Connection {
  /** Type of connection: reddit, twitch */
  type: string;
  /** The id of connection account */
  id: string;
  /** The name of the connection account */
  name: string;
}
