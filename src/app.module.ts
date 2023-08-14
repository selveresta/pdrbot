import { Module } from '@nestjs/common';
import * as LocalSession from 'telegraf-session-local';

import { ConfigModule } from '@nestjs/config';
import { BotModule } from './modules/bot/bot.module';
import { TelegrafModule } from 'nestjs-telegraf';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
