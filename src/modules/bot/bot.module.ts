import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { BotButtons } from './bot.buttons';

@Module({
	imports: [],
	providers: [BotService, BotUpdate, BotButtons],
	controllers: [],
})
export class BotModule {}
