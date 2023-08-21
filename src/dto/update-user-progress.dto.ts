import { ObjectId } from 'mongoose';

export class UpdateUserProgress {
	readonly userId: number;
	readonly topicId: string;
	readonly questionId: string;
	readonly answer: string;
}
