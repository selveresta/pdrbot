import { ObjectId } from 'mongoose';

export class UpdateUserProgressDto {
	readonly userId: number;
	readonly topicId: string;
	readonly correct: string;
	readonly answerIndex: number;
}
