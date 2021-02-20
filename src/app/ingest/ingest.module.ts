import { Module } from '@nestjs/common';
import { IngestGateway } from './ingest.gateway';

@Module({
  providers: [IngestGateway],
})
export class IngestModule {}
