import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { Action, Ctx, Hears, Help, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Update as CallBackUpdate, Message } from 'telegraf/typings/core/types/typegram';

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

	// @On('message')
	// async anyMessage(@Ctx() ctx: Context) {
	// 	const command = ['Питання по темам', 'Випадкове питання', 'Робота над помилками', 'Моя Статистика'];
	// 	console.log((ctx.message as Message.TextMessage).text);
	// 	if (command.includes((ctx.message as Message.TextMessage).text)) {
	// 		return;
	// 	}
	// 	this.botService.anyMessage(ctx);
	// }

	@Hears('Питання по темам')
	async topics(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		this.botService.getTopics(ctx);
	}

	@Action(/topic[-+]?[0-9]*\.?[0-9]/)
	async topicQuestions(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;

		const topicNumber = 'data' in cbQuery ? cbQuery.data : null;

		const question = this.botService.getQuestionOfTopic(ctx, topicNumber);
	}

	@Action(/[A-Za-z0-9]+answer[0-9]/)
	async answerToQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;

		const data = 'data' in cbQuery ? cbQuery.data.split('answer') : null;
		const result = this.botService.checkCorrectAnswer(ctx, data[0], data[1]);
	
	}

	@Action(/next/)
	async nextQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		// const cbQuery = ctx.update.callback_query;

		// const topicNumber = 'data' in cbQuery ? cbQuery.data : null;

		// const topic = this.botService.getTopicByNumber(topicNumber);
	}

	@Action(/prev/)
	async prevQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		// const cbQuery = ctx.update.callback_query;

		// const topicNumber = 'data' in cbQuery ? cbQuery.data : null;

		// const topic = this.botService.getTopicByNumber(topicNumber);
	}

	@Hears('Випадкове питання')
	async random(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		await ctx.reply('sdfsdfsdfsdfsdfsdf');
	}
	@Hears('Робота над помилками')
	async misstakes(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		await ctx.reply('sdfsdfsdfsdfsdfsdf');
	}
	@Hears('Моя Статистика')
	async statictic(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		await ctx.reply('sdfsdfsdfsdfsdfsdf');
	}
}
