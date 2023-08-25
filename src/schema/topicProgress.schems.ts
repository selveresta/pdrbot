import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

// export interface IQuestionProgress {
// 	questionId: string;
// 	isCorrect: boolean;
// }

export interface ITopicsQuestionProgress {
	topicID: string;
	lastQuestionIndex: number;
	questionProgressId: string;
}

export interface ITopicProgress {
	userId: number;
	topics: ITopicsQuestionProgress[];
}

@Schema()
export class TopicProgress implements ITopicProgress {
	@Prop()
	userId: number;
	@Prop()
	topics: ITopicsQuestionProgress[];
}

export type TopicProgressDocument = HydratedDocument<TopicProgress>;

export const TopicProgressSchema = SchemaFactory.createForClass(TopicProgress);
