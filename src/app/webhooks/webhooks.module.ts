import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
