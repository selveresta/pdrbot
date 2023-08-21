import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { BotButtons } from './bot.buttons';
import { MongooseMediatorModule } from '../mongoose-mediator/mongoose-mediator.module';
import { LoggerModule } from '../../shared/logger/logger.module';

@Module({
	imports: [MongooseMediatorModule, LoggerModule],
	providers: [BotService, BotUpdate, BotButtons],
	controllers: [],
})
export class BotModule {}
