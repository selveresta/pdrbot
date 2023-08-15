import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { IQuestion } from './question.schema';

export interface IUser {
	id: number;
	username: string;
}

@Schema()
export class User implements IUser {
	@Prop()
	id: number;
	@Prop()
	username: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
