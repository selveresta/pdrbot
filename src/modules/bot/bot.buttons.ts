import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';
import { IQuestion, Question } from '../../schema/question.schema';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
@Injectable()
export class BotButtons {
	constructor() {}

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

	public getTopicbuttons(topics: string[]) {
		const regEx = /[-+]?[0-9]*\.?[0-9]/;
		const markUp = [];
		topics.sort((a, b) => {
			const Anumber = a.match(regEx);
			const Bnumber = b.match(regEx);
			return Number(Anumber[0]) - Number(Bnumber[0]);
		});
		topics.forEach((t) => markUp.push(Markup.button.callback(t, String('topic' + t.match(regEx)[0]))));

		const buttons = Markup.inlineKeyboard(markUp, {
			columns: 1,
		});

		return buttons;
	}

	public generateQuestionButtons(
		questions: Document<unknown, {}, Question> &
			Question & {
				_id: Types.ObjectId;
			},
	) {
		const markUp: InlineKeyboardButton[][] = [];

		for (let i = 0; i < questions.answers.length; i++) {
			markUp.push([{ text: String(i + 1), callback_data: `${questions.id}answer${i + 1}` }]);
		}

		markUp.push([
			{ text: 'Попереднє', callback_data: `prev` },
			{ text: 'Наступне', callback_data: `next` },
		]);

		return markUp;
	}
}
