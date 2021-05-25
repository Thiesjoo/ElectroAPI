import {
  AuthedUser,
  AuthPrefixes,
  ResponsePrefix,
  UserToken,
} from 'src/common';
import { AuthTokenPayloadDTO, CreateMessageNotificationDTO } from 'src/models';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhooksService } from './webhooks.service';

@Controller('api/webhooks')
@ResponsePrefix()
@AuthPrefixes(JwtGuard, [AuthedUser()])
@ApiTags('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  findAll(@UserToken() token: AuthTokenPayloadDTO) {
    return this.webhooksService.findAll(token);
  }

  @Post()
  create(
    @UserToken() token: AuthTokenPayloadDTO,
    @Body() createWebhookDto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(token, createWebhookDto);
  }

  @Get(':id')
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
  remove(@UserToken() token: AuthTokenPayloadDTO, @Param('id') id: string) {
    return this.webhooksService.remove(token, id);
  }

  @Post('impl/:id')
  triggerWebhook(
    @Param('id') id: string,
    @Body() notification: CreateMessageNotificationDTO,
  ) {
    console.log(id, notification);
    return this.webhooksService.trigger(id, notification);
  }
}
