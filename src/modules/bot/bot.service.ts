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
import { IQuestionProgress, ITopicsQuestionProgress } from '../../schema/topicProgress.schems';

@Injectable()
export class BotService {
	private URL = 'http://localhost:3000/';

	constructor(
		private readonly botButtons: BotButtons,
		private readonly mongooseMediator: MongooseMediatorService,
		private readonly logger: LoggerService,
	) {}

	public async startCommand(ctx: Context) {
		const { id, username } = ctx.message.from;
		const user = await this.mongooseMediator.createUser({ id, username });
		if (user) {
			await ctx.reply(
				'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
				this.botButtons.menuButtons(),
			);
		} else {
			await ctx.reply('User has been already registered', this.botButtons.menuButtons());
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
		const names = topics.map((t) => t.name);
		ctx.reply('Теми', this.botButtons.getTopicbuttons(names));
	}

	public async getTopicByNumber(number: string) {
		const topics = await this.mongooseMediator.findAllTopic();
		let topic = topics[0];
		topics.forEach((t) => {
			const regEx = getRegEx();
			const res1 = t.name.match(regEx)[0];
			const res2 = number.match(regEx)[0];
			// console.log(res, ' - ', number, ' = ', res === number);
			if (res1 === res2) {
				topic = t;
			}
		});
		return topic;
	}

	public async getQuestionOfTopic(
		ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate },
		topicNumber: string,
	) {
		const topic = await this.getTopicByNumber(topicNumber);

		const topicProgress = await this.mongooseMediator.getUserProgress(ctx.update.callback_query.from.id);
		const currectTopicProgress = [];
		topicProgress.topics.forEach((t) => {
			if (t.topicID === topic.id) {
				currectTopicProgress.push(t);
			}
		});
		const questionId = topic.questions[currectTopicProgress[0].lastQuestionIndex];
		const currentQuestion = await this.mongooseMediator.findQuestion(questionId);

		const answers = currentQuestion.answers.map((answer, index) => {
			return `${this.getEmojiNumberFromUnicode(index + 1)}${answer}\n`;
		});
		const caption = `Тема: ${topic.name}\n\n Питання: ${currentQuestion.question}\n\n${answers.join('\n')}`;

		if (currentQuestion.img !== 'nophoto') {
			ctx.replyWithPhoto(
				{ url: `${this.URL}${currentQuestion.img}` },
				{
					caption: caption,
					reply_markup: { inline_keyboard: this.botButtons.generateQuestionButtons(currentQuestion) },
				},
			);
		} else {
			ctx.reply(caption, {
				reply_markup: { inline_keyboard: this.botButtons.generateQuestionButtons(currentQuestion) },
			});
		}
	}

	public async checkCorrectAnswer(
		ctx: Context & { update: CallBackUpdate.CallbackQueryUpdate },
		questionId: string,
		answerIndex: string,
	) {
		const question = await this.getQuestion(questionId);
		const questionProgress = await this.getQuestionProgress(ctx.update.callback_query.from.id, questionId);

		const resAnswer = question.answers[Number(answerIndex) - 1];
		if (question.correct.search(resAnswer)) {
			questionProgress.isCorrect = true;
			ctx.reply(`Uncorrect, correct answer is ${question.correct}`);
		} else {
			questionProgress.isCorrect = false;
			ctx.reply(`Nice, is correct answer`);
		}
	}

	public async getQuestionProgress(userId: number, questionId: string) {
		const topicProgress = await this.mongooseMediator.getUserProgress(userId);
		const currectQuestionProgress: IQuestionProgress[] = [];

		topicProgress.topics.forEach((t) => {
			t.questionProgress.forEach((q) => {
				if (q.questionId === questionId) {
					currectQuestionProgress.push(q);
				}
			});
		});

		return currectQuestionProgress[0];
	}

	public async getQuestion(id: string) {
		return await this.mongooseMediator.findQuestion(id);
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
}
