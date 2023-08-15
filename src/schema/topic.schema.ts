import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { IQuestion } from './question.schema';
export interface ITopic {
	questions: string[]
}

@Schema()
export class Topic implements ITopic {
	@Prop()
	name: string;

	@Prop()
	questions: string[];
}

export type TopicDocument = HydratedDocument<Topic>;

export const TopicSchema = SchemaFactory.createForClass(Topic);
