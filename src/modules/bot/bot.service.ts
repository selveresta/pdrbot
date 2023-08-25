import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { BotButtons } from './bot.buttons';
import { MongooseMediatorService } from '../mongoose-mediator/mongoose-mediator.service';
import { generateQuestionTopicFromJSON, getRegEx } from '../../utils/generateQuestionTopics';
import { LoggerService } from '../../shared/logger/logger.service';
import { SceneContext } from 'telegraf/typings/scenes';
import { Update as CallBackUpdate, Message } from 'telegraf/typings/core/types/typegram';
import { Question } from '../../schema/question.schema';
import { Types, Document } from 'mongoose';
import { ITopicsQuestionProgress } from '../../schema/topicProgress.schems';
import { WrapperService } from '../wrapper/wrapper.service';
import { UpdateUserProgressDto } from '../../dto/update-user-progress.dto';

@Injectable()
export class BotService {
	private URL = 'http://localhost:3000/';

	constructor(
		private readonly botButtons: BotButtons,
		private readonly mongooseMediator: MongooseMediatorService,
		private readonly logger: LoggerService,
		private readonly wrapperService: WrapperService,
	) {}

	public async startCommand(ctx: Context) {
		const { id, username } = ctx.message.from;
		const user = await this.mongooseMediator.createUser({ id, username });
		if (user) {
			await ctx.reply('Вітаю в безкоштовному боті з офіційними тестами ПДР.', this.botButtons.menuButtons());
		} else {
			await ctx.reply(`Користувач ${username} вже зареєстровано`, this.botButtons.menuButtons());
		}
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

	public async anyMessage(ctx: Context) {
		await ctx.reply('Я тебе не розумію, вибери один з пунктів меню', this.botButtons.menuButtons());
	}

	public async getTopics(ctx: Context) {
		const topics = await this.mongooseMediator.findAllTopic();
		await ctx.reply('Теми', this.botButtons.getTopicbuttons(topics));
	}

	public async startTopic(ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }, topicData: string) {
		const topicID = this.parseCallBackData(topicData, this.wrapperService.getTopicWrapper());
		const question = await this.getQuestion(ctx, topicID[1]);
	}

	public async checkCorrectAnswer(ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }, data: string) {
		const questionId = this.parseCallBackData(data, this.wrapperService.getQuestionWrapper())[1];
		const topicId = this.parseCallBackData(data, this.wrapperService.getTopicWrapper())[1];
		const answerIndex = this.parseCallBackData(data, this.wrapperService.getAnswerWrapper())[1];
		console.log(answerIndex);
		const question = await this.mongooseMediator.findQuestion(questionId);

		const updateUserDto: UpdateUserProgressDto = {
			userId: Number(ctx.update.callback_query.id),
			topicId: topicId,
			correct: question.correct,
			answerIndex: Number(answerIndex),
		};
		const result = await this.mongooseMediator.updateUserProgress(updateUserDto, question);
		if (result) {
			await ctx.reply(`Вірно ✅`);
		} else {
			await ctx.reply(`Невірно ❌, правильна відповідь - ${question.correct}`);
		}
		await ctx.editMessageReplyMarkup(this.botButtons.emptyMarkup(topicId, question.id));
		await ctx.answerCbQuery();
	}

	public async getNextQuestion(
		ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate },
		data: string,
		WIU?: boolean,
	) {
		const topicID = this.parseCallBackData(data, this.wrapperService.getTopicWrapper());
		if (WIU) {
			await this.updateLastIndexOfTopic(ctx.update.callback_query.from.id, topicID[1], true);
		}
		await this.getQuestion(ctx, topicID[1]);
	}

	public async getPrevQuestion(
		ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate },
		data: string,
		WIU?: boolean,
	) {
		const topicID = this.parseCallBackData(data, this.wrapperService.getTopicWrapper());
		if (WIU) {
			await this.updateLastIndexOfTopic(ctx.update.callback_query.from.id, topicID[1], false);
		}
		await this.getQuestion(ctx, topicID[1]);
	}

	public async updateLastIndexOfTopic(userId: number, topicId: string, way: boolean) {
		await this.mongooseMediator.updateLastIndexTopic(userId, topicId, way);
	}

	public async getQuestion(ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate }, topicId: string) {
		const topic = await this.mongooseMediator.findTopic(topicId);
		const topicProgress = await this.mongooseMediator.findUserProgressTopic(
			ctx.update.callback_query.from.id,
			topic.id,
		);

		const questionProgress = await this.mongooseMediator.findQuestionsProgress(topicProgress.questionProgressId);
		const { questionId } = questionProgress.questionsProgress[topicProgress.lastQuestionIndex];
		const question = await this.mongooseMediator.findQuestion(questionId);

		const answers = question.answers.map((answer, index) => {
			return `${this.getEmojiNumberFromUnicode(index + 1)}${answer}\n`;
		});

		const caption = `${topic.name}\n\n${question.question}\n\n${answers.join('\n')}`;
		await ctx.answerCbQuery();

		try {
			if (question.img !== 'nophoto') {
				await ctx.replyWithPhoto(
					{ url: `${this.URL}${question.img}` },
					{
						caption: caption,
						reply_markup: { inline_keyboard: this.botButtons.generateQuestionButtons(topic.id, question) },
					},
				);
			} else {
				await ctx.reply(caption, {
					reply_markup: { inline_keyboard: this.botButtons.generateQuestionButtons(topic.id, question) },
				});
			}
		} catch (error) {
			this.logger.error(error.message);
		}
	}

	public async getRandomQuestion(ctx: Context) {
		await ctx.reply('Я тебе не розумію, вибери один з пунктів меню', this.botButtons.menuButtons());
	}

	public async getMissTakes(ctx: Context) {
		await ctx.reply('Я тебе не розумію, вибери один з пунктів меню', this.botButtons.menuButtons());
	}

	public async getStatictic(ctx: Context) {
		await ctx.reply('Я тебе не розумію, вибери один з пунктів меню', this.botButtons.menuButtons());
	}

	private getEmojiNumberFromUnicode(number: number) {
		return (
			String.fromCharCode(Number(`0x003${number}`)) + String.fromCodePoint(0xfe0f) + String.fromCodePoint(0x20e3)
		);
	}

	public parseCallBackData(data: string, separator: string) {
		return data.split(separator);
	}
}
