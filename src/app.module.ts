import { Module } from '@nestjs/common';
import * as LocalSession from 'telegraf-session-local';

import { ConfigModule } from '@nestjs/config';
import { BotModule } from './modules/bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		ServeStaticModule.forRoot({
			rootPath: path.resolve(__dirname, 'static'),
		}),
		MongooseModule.forRoot(
			`mongodb+srv://artemonlypnyk1214:${process.env.DB_PASSWORD}@telegramcluster.vuzvn1w.mongodb.net/Telegram`,
		),
		TelegrafModule.forRoot({
			middlewares: [sessions.middleware()],
			token: process.env.BOT_TOKEN,
		}),
		BotModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
