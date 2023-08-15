import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { IQuestion } from './question.schema';

export interface IQuestionProgress {
	questionId: ObjectId;
	isCorrect: boolean;
}

export interface ITopicsQuestionProgress {
	topicID: ObjectId;
	questionProgress: IQuestionProgress[];
}

export interface ITopicProgress {
	userId: number;
	topics: ITopicProgress[];
}

@Schema()
export class TopicProgress implements ITopicProgress {
	userId: number;
	topics: ITopicProgress[];
}

export type TopicProgressDocument = HydratedDocument<TopicProgress>;

export const TopicProgressSchema = SchemaFactory.createForClass(TopicProgress);
