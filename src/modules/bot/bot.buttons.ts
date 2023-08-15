import { Injectable } from '@nestjs/common';
import { Markup } from 'telegraf';

@Injectable()
export class BotButtons {
	constructor() {}

	public menuButtons() {
		const markUp = [
			Markup.button.callback('Питання по темам', 'themes'),
			Markup.button.callback('Випадкове питання', 'random'),
			Markup.button.callback('Робота над помилками', 'misstakes'),
			Markup.button.callback('Моя Статистика', 'statistic'),
		];

		const buttons = Markup.keyboard(markUp, {
			columns: markUp.length / 2,
		});

		return buttons;
	}
}
