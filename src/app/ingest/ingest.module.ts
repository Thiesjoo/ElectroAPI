import { Module } from '@nestjs/common';
import { AuthModule, AuthUserModule } from '../auth';
import { IngestGateway } from './ingest.gateway';

@Module({
  providers: [IngestGateway],
  imports: [AuthUserModule, AuthModule],
})
export class IngestModule {}
