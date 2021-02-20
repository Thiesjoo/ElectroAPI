/** The routes available to a websocket client */
//TODO: Make this properly typed, with payload and response
export enum IngestSocketRoutes {
  Auth = 'authenticate',
  Identity = 'identity',
  Ingest = 'ingest',
}
