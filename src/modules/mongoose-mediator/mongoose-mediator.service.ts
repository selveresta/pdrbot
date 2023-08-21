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
import { IQuestionProgress, ITopicsQuestionProgress, TopicProgress } from '../../schema/topicProgress.schems';
import { LoggerService } from '../../shared/logger/logger.service';

export interface IMediatorDB {
	createUser(dto: CreateUserDto);
	createQuestion(dto: CreateQuestionDto);
	createTopic(dto: CreateTopicDto);

	findUser(id: string);
	findQuestion(id: string);
	findTopic(id: string);

	findAllUser();
	findAllQuestion();
	findAllTopic();

	findUserProgress(userId: number);
	findUserProgressTopic(userId: number, topicId: string);
	findUserProgressQuestion(userId: number, topicId: string, questionId);

	checkCorrectAnswer(questionId: string, answerIndex: number);

	updateUserProgress(dto: UpdateUserProgress);
	getUserStats(userId: number);
	getRandomQuestion();
	getTopicQuestion(topicId: ObjectId);
	getMisstakesQuestionOfTopic(topicId: ObjectId);
	generateNewProgress(dto: CreateUserDto);
}

@Injectable()
export class MongooseMediatorService implements IMediatorDB {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		@InjectModel(Question.name) private questionModel: Model<Question>,
		@InjectModel(Topic.name) private topicModel: Model<Topic>,
		@InjectModel(TopicProgress.name) private topicProgressModel: Model<TopicProgress>,
		@InjectConnection() private connection: Connection,
		private readonly logger: LoggerService,
	) {}

	async createUser(dto: CreateUserDto) {
		const candidate = await this.userModel.findOne({ id: dto.id });
		if (candidate) {
			return;
		}

		const user = await new this.userModel(dto).save();

		if (user) {
			this.logger.log(`User ${user.username} - ${user.id} created`);
			this.generateNewProgress(user);
		}
		return user;
	}
	async createQuestion(dto: CreateQuestionDto) {
		const question = new this.questionModel(dto);
		return await question.save();
	}
	async createTopic(dto: CreateTopicDto) {
		const topic = new this.topicModel(dto);
		return await topic.save();
	}

	async findUserProgress(userId: number) {
		return await this.topicProgressModel.findOne({ userId: userId });
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

	async findAllQuestion() {
		return await this.questionModel.find().exec();
	}
	async findAllTopic() {
		return await this.topicModel.find().exec();
	}

	async generateNewProgress(user: User) {
		const topics = await this.topicModel.find().exec();
		const TQProgress: ITopicsQuestionProgress[] = [];

		topics.forEach((topic) => {
			const QProgress: IQuestionProgress[] = [];

			topic.questions.forEach((questionId) => {
				const questionProgress: IQuestionProgress = {
					isCorrect: false,
					questionId: questionId,
				};
				QProgress.push(questionProgress);
			});

			TQProgress.push({
				topicID: topic.id,
				lastQuestionIndex: 0,
				questionProgress: QProgress,
			});
		});
		const userTopicProgress = await new this.topicProgressModel({
			userId: user.id,
			topics: TQProgress,
		}).save();

		if (userTopicProgress) {
			this.logger.log(`Progress for ${user.username} - ${user.id} created`);
		}
	}
}
