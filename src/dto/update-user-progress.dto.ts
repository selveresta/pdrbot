import { ObjectId } from 'mongoose';

export class UpdateUserProgress {
	readonly userId: number;
	readonly topicId: ObjectId;
	readonly questionId: ObjectId;
}
