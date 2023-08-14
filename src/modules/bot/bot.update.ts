import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { InjectBot, Start, Update } from 'nestjs-telegraf';
import { BotButtons } from './bot.buttons';

@Update()
export class BotUpdate {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly botService: BotService,

	) {}

	@Start()
	public async startCommand(ctx: Context) {
		await this.botService.startCommand(ctx);
	}
}
