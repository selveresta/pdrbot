import { Context, Telegraf } from 'telegraf';
import { BotService } from './bot.service';
import { Action, Ctx, Hears, Help, InjectBot, On, Start, TelegrafException, Update } from 'nestjs-telegraf';
import { Update as CallBackUpdate, Message } from 'telegraf/typings/core/types/typegram';
import { WrapperService } from '../wrapper/wrapper.service';
import { LoggerService } from '../../shared/logger/logger.service';

@Update()
export class BotUpdate {
	private topicRegex: RegExp;

	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private readonly botService: BotService,
		private readonly logger: LoggerService,
		private readonly wrapperServise: WrapperService,
	) {}

	@Start()
	public async startCommand(@Ctx() ctx: Context) {
		return await this.botService.startCommand(ctx);
	}

	@Help()
	async help(@Ctx() ctx: Context) {
		return await this.botService.helpCommand(ctx);
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

	@Hears('Випадкове питання')
	async random(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		await ctx.reply('В розробці');
	}
	@Hears('Робота над помилками')
	async misstakes(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		await ctx.reply('В розробці');
	}
	@Hears('Моя Статистика')
	async statictic(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		await ctx.reply('В розробці');
	}

	@Action(/topic+!+[A-Za-z0-9]+!/)
	async startTopic(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;
		try {
			const topicData = 'data' in cbQuery ? cbQuery.data : null;
			if (topicData == null) {
				throw new TelegrafException('Incorrect data');
			}
			this.botService.startTopic(ctx, topicData);
			return;
		} catch (error) {
			this.logger.error(error.message);
		}
	}

	@Action(/!+[A-Za-z0-9]+!+#+[A-Za-z0-9]+#+@+\d+@/)
	async answerToQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;

		const data = 'data' in cbQuery ? cbQuery.data : null;

		const result = this.botService.checkCorrectAnswer(ctx, data);
		return;
	}

	@Action(/!+[A-Za-z0-9]+!+next/)
	async nextQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;

		const nextData = 'data' in cbQuery ? cbQuery.data : null;
		const TopicID = this.botService.parseCallBackData(nextData, this.wrapperServise.getTopicWrapper());
		await this.botService.updateLastIndexOfTopic(ctx.update.callback_query.from.id, TopicID[1], true);
		const topic = await this.botService.getNextQuestion(ctx, nextData);
	}

	@Action(/!+[A-Za-z0-9]+!+prev/)
	async prevQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;
		const prevData = 'data' in cbQuery ? cbQuery.data : null;
		const TopicID = this.botService.parseCallBackData(prevData, this.wrapperServise.getTopicWrapper());
		await this.botService.updateLastIndexOfTopic(ctx.update.callback_query.from.id, TopicID[1], false);
		const topic = await this.botService.getPrevQuestion(ctx, prevData);
	}

	@Action(/!+[A-Za-z0-9]+!+[*]+next/)
	async nextWIUQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;
		const nextData = 'data' in cbQuery ? cbQuery.data : null;
		const topic = this.botService.getNextQuestion(ctx, nextData, true);
	}

	@Action(/!+[A-Za-z0-9]+!+[*]+prev/)
	async prevWIUQuestion(@Ctx() ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }) {
		const cbQuery = ctx.update.callback_query;
		const prevData = 'data' in cbQuery ? cbQuery.data : null;
		const topic = this.botService.getPrevQuestion(ctx, prevData, true);
	}
}
