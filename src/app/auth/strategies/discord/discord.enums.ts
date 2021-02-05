export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  locale: string;
  connections: Connection[];
}

export interface Connection {
  type: string;
  id: string;
  name: string;
}
