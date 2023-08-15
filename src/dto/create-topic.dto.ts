import { Types } from 'mongoose';

export class CreateTopicDto {
	readonly name: string;
	readonly questions: string[];
}
