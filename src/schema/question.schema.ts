import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
export interface IQuestion {
	question: string;

	correct: string;

	answers: string[];
}

@Schema()
export class Question implements IQuestion {
	@Prop()
	question: string;

	@Prop()
	correct: string;

	@Prop()
	img: string;

	@Prop()
	answers: string[];
}

export type QuestionDocument = HydratedDocument<Question>;

export const QuestionSchema = SchemaFactory.createForClass(Question);
