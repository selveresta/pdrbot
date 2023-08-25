import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type IQuestionProgress = {
	questionId: string;
	isCorrect: boolean;
};

export interface IQuestionsProgress {
	questionsProgress: IQuestionProgress[];
}

@Schema()
export class QuestionProgress implements IQuestionsProgress {
	@Prop()
	questionsProgress: IQuestionProgress[];
}

export type QuestionProgressDocument = HydratedDocument<QuestionProgress>;

export const QuestionProgressSchema = SchemaFactory.createForClass(QuestionProgress);
