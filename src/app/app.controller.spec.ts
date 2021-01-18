import { Test, TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const sampleConfig = {
  mongoURL: 'samplemongourl',
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ApiConfigService],
    })
      .overrideProvider(ApiConfigService)
      .useValue(sampleConfig)
      .compile();

    appController = app.get<AppController>(AppController);
  });

  // describe('root', () => {
  //   it('should redirect to api"', () => {
  //     expect(appController.redirect()).toBe('Hello World!');
  //   });
  // });

  describe('hello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('test', () => {
    it('should return mongourl from config"', () => {
      expect(appController.test()).toBe(sampleConfig.mongoURL);
    });
  });
});
