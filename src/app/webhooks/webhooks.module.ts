import { GithubWebhooksModule } from '@dev-thought/nestjs-github-webhooks';
import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [
    forwardRef(() => AppModule),
    GithubWebhooksModule.forRoot({
      webhookSecret: 'THIS_IS_A_RANDOM_STRING_TEMPORARYH_FIXME',
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
