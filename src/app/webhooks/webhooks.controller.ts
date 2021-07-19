import {
  AuthedUser,
  AuthPrefixes,
  ResponsePrefix,
  UserToken,
} from 'src/common';
import {
  AuthTokenPayloadDTO,
  CreateAndroidNotification,
  CreateMessageNotificationDTO,
} from 'src/models';
import {
  GithubGuard,
  GithubWebhookEvents,
} from '@dev-thought/nestjs-github-webhooks';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import {
  EventsMap,
  GithubHandledEvents,
  GithubHandledEventsEnum,
  WebhooksService,
} from './webhooks.service';

@Controller('api/webhooks')
@ResponsePrefix()
@ApiTags('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @AuthPrefixes(JwtGuard, [AuthedUser()])
  findAll(@UserToken() token: AuthTokenPayloadDTO) {
    return this.webhooksService.findAll(token);
  }

  @Post()
  @AuthPrefixes(JwtGuard, [AuthedUser()])
  create(
    @UserToken() token: AuthTokenPayloadDTO,
    @Body() createWebhookDto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(token, createWebhookDto);
  }

  @Get(':id')
  @AuthPrefixes(JwtGuard, [AuthedUser()])
  findOne(@UserToken() token: AuthTokenPayloadDTO, @Param('id') id: string) {
    return this.webhooksService.findOne(token, id);
  }

  // @Patch(':id')
  // update(
  //   @UserToken() token: AuthTokenPayloadDTO,
  //   @Param('id') id: string,
  //   @Body() updateWebhookDto: UpdateWebhookDto,
  // ) {
  //   return this.webhooksService.update(token, id, updateWebhookDto);
  // }

  @Delete(':id')
  @AuthPrefixes(JwtGuard, [AuthedUser()])
  remove(@UserToken() token: AuthTokenPayloadDTO, @Param('id') id: string) {
    return this.webhooksService.remove(token, id);
  }

  @Post(':id')
  triggerWebhook(
    @Param('id') id: string,
    @Body() notification: CreateMessageNotificationDTO,
  ) {
    console.log(id, notification);
    return this.webhooksService.triggerGeneric(id, notification);
  }

  @Post(':id/android')
  triggerAndroidWebhook(
    @Param('id') id: string,
    @Body() notification: CreateAndroidNotification,
  ) {
    console.log(id, notification);
    return this.webhooksService.triggerAndroid(id, notification);
  }

  @Post(':id/github')
  @UseGuards(GithubGuard)
  @GithubWebhookEvents(GithubHandledEvents)
  async triggerGithubWebhook<K extends GithubHandledEventsEnum>(
    @Param('id') id: string,
    @Headers('X-GitHub-Event') type: K,
    @Body() notification: EventsMap[K],
  ) {
    await this.webhooksService.triggerGithub(id, notification, type);
    return true;
  }
}
