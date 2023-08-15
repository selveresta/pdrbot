import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { CreateQuestionDto } from '../../dto/create-question.dto';
import { CreateTopicDto } from '../../dto/create-topic.dto';
import { Connection, Model, ObjectId, Schema } from 'mongoose';
import { UpdateUserProgress } from '../../dto/update-user-progress.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from '../../schema/user.schema';
import { Question } from '../../schema/question.schema';
import { Topic } from '../../schema/topic.schema';
import { TopicProgress } from '../../schema/topicProgress.schems';

export interface IMediatorDB {
	createUser(dto: CreateUserDto);
	createQuestion(dto: CreateQuestionDto);
	createTopic(dto: CreateTopicDto);

	findUser(id: string);
	findQuestion(id: string);
	findTopic(id: string);

	updateUserProgress(dto: UpdateUserProgress);
	getuserStats(userId: number);
	getRandomQuestion();
	getTopicQuestion(topicId: ObjectId);
	getMisstakesQuestionOfTopic(topicId: ObjectId);
	generateNewProgress();
}

@Injectable()
export class MongooseMediatorService implements IMediatorDB {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(Question.name) private questionModel: Model<Question>,
		@InjectModel(Topic.name) private topicModel: Model<Topic>,
		@InjectModel(TopicProgress.name) private topicProgressModel: Model<TopicProgress>,
		@InjectConnection() private connection: Connection,
	) {}

	createUser(dto: CreateUserDto) {
		const user = new this.userModel(dto);

		const userTopicProgress = new this.topicProgressModel({
			userId: dto.id,
		});

		return user.save();
	}
	async createQuestion(dto: CreateQuestionDto) {
		const question = new this.questionModel(dto);
		return await question.save();
	}
	async createTopic(dto: CreateTopicDto) {
		const topic = new this.topicModel(dto);
		return await topic.save();
	}

	async findUser(id: string) {
		return await this.userModel.findById(id).exec();
	}
	async findQuestion(id: string) {
		return await this.questionModel.findById(id).exec();
	}
	async findTopic(id: string) {
		return await this.topicModel.findById(id).exec();
	}

	updateUserProgress(dto: UpdateUserProgress) {
		throw new Error('Method not implemented.');
	}
	getuserStats(userId: number) {
		throw new Error('Method not implemented.');
	}
	getRandomQuestion() {
		throw new Error('Method not implemented.');
	}
	getTopicQuestion(topicId: Schema.Types.ObjectId) {
		throw new Error('Method not implemented.');
	}
	getMisstakesQuestionOfTopic(topicId: Schema.Types.ObjectId) {
		throw new Error('Method not implemented.');
	}

	generateNewProgress() {}
}
