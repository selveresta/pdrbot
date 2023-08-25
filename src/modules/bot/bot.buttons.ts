import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { IQuestion, Question, QuestionDocument } from '../../schema/question.schema';
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { Topic, TopicDocument } from '../../schema/topic.schema';
import { WrapperService } from '../wrapper/wrapper.service';
import { inlineKeyboard } from 'telegraf/typings/markup';

@Injectable()
export class BotButtons {
	constructor(private readonly wrapperServise: WrapperService) {}

	public menuButtons() {
		const markUp = [
			Markup.button.callback('Питання по темам', '1'),
			Markup.button.callback('Випадкове питання', 'random'),
			Markup.button.callback('Робота над помилками', 'misstakes'),
			Markup.button.callback('Моя Статистика', 'statistic'),
		];

		const buttons = Markup.keyboard(markUp, {
			columns: markUp.length / 2,
		});

		return buttons;
	}

	public getTopicbuttons(topics: TopicDocument[]) {
		const regEx = /[-+]?[0-9]*\.?[0-9]/;
		const markUp = [];

		topics.sort((a, b) => {
			const Anumber = a.name.match(regEx);
			const Bnumber = b.name.match(regEx);
			return Number(Anumber[0]) - Number(Bnumber[0]);
		});

		topics.forEach((t) => markUp.push(Markup.button.callback(t.name, this.wrapperServise.wrapTopicCallBack(t))));

		const buttons = Markup.inlineKeyboard(markUp, {
			columns: 1,
		});

		return buttons;
	}

	public generateQuestionButtons(topicID: string, question: QuestionDocument) {
		const markUp: InlineKeyboardButton[][] = [];

		for (let i = 0; i < question.answers.length; i++) {
			markUp.push([
				{
					text: String(i + 1),
					callback_data: this.wrapperServise.wrapQuestionCallBack(topicID, question.id, i),
				},
			]);
		}

		markUp.push([
			{ text: 'Попереднє', callback_data: this.wrapperServise.wrapPrevWIUQuestion(topicID) },
			{ text: 'Наступне', callback_data: this.wrapperServise.wrapNexWIUQuestion(topicID) },
		]);

		return markUp;
	}

	public emptyMarkup(topicID: string, questionId: string) {
		const markUp: InlineKeyboardMarkup = {
			inline_keyboard: [
				[
					{ text: 'Попереднє', callback_data: this.wrapperServise.wrapPrevQuestion(topicID) },
					{ text: 'Наступне', callback_data: this.wrapperServise.wrapNexQuestion(topicID) },
				],
			],
		};
		return markUp;
	}
}
