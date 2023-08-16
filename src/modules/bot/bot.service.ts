import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { BotButtons } from './bot.buttons';
import { MongooseMediatorService } from '../mongoose-mediator/mongoose-mediator.service';
import { generateQuestionTopicFromJSON } from '../../utils/generateQuestionTopics';

@Injectable()
export class BotService {
	private URL = '';

	constructor(private readonly botButtons: BotButtons, private readonly mongooseMediator: MongooseMediatorService) {}

	public async startCommand(ctx: Context) {
		const { id, username } = ctx.message.from;
		this.mongooseMediator.createUser({ id, username });
		await ctx.reply(
			'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
			this.botButtons.menuButtons(),
		);
	}

	public async helpCommand(ctx: Context) {
		await ctx.reply(
			`Питання по темам -\n,
            Випадкове питання -,\n
            Робота над помилками - ,\n
            Моя Статистика - ,\n`,
			this.botButtons.menuButtons(),
		);
	}
}
