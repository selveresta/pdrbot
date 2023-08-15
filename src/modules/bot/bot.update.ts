import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { Ctx, Help, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { BotButtons } from './bot.buttons';
import path from 'path';

@Update()
export class BotUpdate {
	constructor(@InjectBot() private readonly bot: Telegraf<Context>, private readonly botService: BotService) {}

	@Start()
	public async startCommand(@Ctx() ctx: Context) {
		await this.botService.startCommand(ctx);
	}

	@Help()
	async help(@Ctx() ctx: Context) {
		await this.botService.helpCommand(ctx);
	}

	@On('message')
	async test(@Ctx() ctx: Context) {
		await ctx.replyWithPhoto(
			{ url: 'http://localhost:3000/5c9b681ee0cf1055254679.jpg' },
			{ caption: 'asdasdasdasd' },
		);
	}
}
