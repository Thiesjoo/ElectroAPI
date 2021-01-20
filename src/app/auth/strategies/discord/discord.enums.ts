interface DiscordUser {
  id: string;
  username: string;
  avater: string;
  discriminator: string;
  locale: string;
  connections: Connection[];
}

interface Connection {
  type: string;
  id: string;
  name: string;
}
