import { Module } from '@nestjs/common';
import { MongooseMediatorService } from './mongoose-mediator.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schema/user.schema';
import { Question, QuestionSchema } from '../../schema/question.schema';
import { Topic, TopicSchema } from '../../schema/topic.schema';
import { TopicProgress, TopicProgressSchema } from '../../schema/topicProgress.schems';
import { LoggerModule } from '../../shared/logger/logger.module';
import { QuestionProgress, QuestionProgressSchema } from '../../schema/questionProgress.schema';

const schemas = [
	{ name: User.name, schema: UserSchema },
	{ name: Question.name, schema: QuestionSchema },
	{ name: Topic.name, schema: TopicSchema },
	{ name: TopicProgress.name, schema: TopicProgressSchema },
	{ name: QuestionProgress.name, schema: QuestionProgressSchema },
];

@Module({
	imports: [MongooseModule.forFeature(schemas), LoggerModule],
	providers: [MongooseMediatorService],
	exports: [MongooseMediatorService],
})
export class MongooseMediatorModule {}
