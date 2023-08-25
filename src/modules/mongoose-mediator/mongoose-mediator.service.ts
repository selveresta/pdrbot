import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { CreateQuestionDto } from '../../dto/create-question.dto';
import { CreateTopicDto } from '../../dto/create-topic.dto';
import { Connection, Model, ObjectId, Schema } from 'mongoose';
import { UpdateUserProgressDto } from '../../dto/update-user-progress.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from '../../schema/user.schema';
import { Question, QuestionDocument } from '../../schema/question.schema';
import { Topic } from '../../schema/topic.schema';
import { ITopicsQuestionProgress, TopicProgress } from '../../schema/topicProgress.schems';
import { LoggerService } from '../../shared/logger/logger.service';
import { IQuestionProgress, QuestionProgress } from '../../schema/questionProgress.schema';

export interface IMediatorDB {
	createUser(dto: CreateUserDto);
	createQuestion(dto: CreateQuestionDto);
	createTopic(dto: CreateTopicDto);

	findUser(id: string);
	findQuestion(id: string);
	findTopic(id: string);
	findQuestionsProgress(questionProgressId: string);

	findAllUser();
	findAllQuestion();
	findAllTopic();

	findUserProgress(userId: number);
	findUserProgressTopic(userId: number, topicId: string);

	updateUserProgress(dto: UpdateUserProgressDto, question: QuestionDocument);
	updateLastIndexTopic(userId: number, topicId: string, way: boolean);
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
		@InjectModel(QuestionProgress.name) private questionProgressModel: Model<QuestionProgress>,
		@InjectConnection() private connection: Connection,
		private readonly logger: LoggerService,
	) {}

	//Create
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
	//Read
	async findAllUser() {
		return await this.userModel.find().exec();
	}

	async findAllQuestion() {
		return await this.questionModel.find().exec();
	}
	async findAllTopic() {
		return await this.topicModel.find().exec();
	}

	async findUserProgress(userId: number) {
		return await this.topicProgressModel.findOne({ userId: userId });
	}

	async findUserProgressTopic(userId: number, topicId: string) {
		const progress = await this.topicProgressModel.find(
			{ userId: userId },
			{ topics: { $elemMatch: { topicID: topicId } } },
		);
		return progress.pop().topics.pop();
	}

	async findUserProgressQuestion(userId: number, topicId: string, questionId: string) {
		const topicProgress = await this.findUserProgressTopic(userId, topicId);
		const questionsProgress = await this.findQuestionsProgress(topicProgress.questionProgressId);
		for (let i = 0; i < questionsProgress.questionsProgress.length; i++) {
			const element = questionsProgress[i];
			if (element.questionId === questionId) {
				return element;
			}
		}
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

	async findQuestionsProgress(id: string) {
		return await this.questionProgressModel.findById(id).exec();
	}

	//Update
	async updateUserProgress(dto: UpdateUserProgressDto, question: QuestionDocument) {
		console.log(dto.correct);
		console.log(question.answers[dto.answerIndex]);
		if (dto.correct === question.answers[dto.answerIndex]) {
			await this.questionProgressModel.findOneAndUpdate(
				{
					questionsProgress: { $elemMatch: { questionId: question.id } },
				},
				{
					$set: { 'questionsProgress.$.isCorrect': true },
				},
			);
			return 1;
		} else {
			await this.questionProgressModel.findOneAndUpdate(
				{
					questionsProgress: { $elemMatch: { questionId: question.id } },
				},
				{
					$set: { 'questionsProgress.$.isCorrect': false },
				},
			);
			return 0;
		}
	}

	async updateLastIndexTopic(userId: number, topicId: string, way: boolean) {
		const progress = await this.findUserProgressTopic(userId, topicId);
		const questionProgress = await this.findQuestionsProgress(progress.questionProgressId);
		let nextIndex = progress.lastQuestionIndex;

		if (way) {
			nextIndex += 1;

			if (nextIndex > questionProgress.questionsProgress.length - 1) {
				nextIndex = 0;
			}
		} else {
			nextIndex -= 1;

			if (nextIndex < 0) {
				nextIndex = questionProgress.questionsProgress.length - 1;
			}
		}

		return await this.topicProgressModel.findOneAndUpdate(
			{ userId: userId, topics: { $elemMatch: { topicID: topicId } } },
			{ $set: { 'topics.$.lastQuestionIndex': nextIndex } },
		);
	}

	//Delete

	//Accumulate

	getUserStats(userId: number) {
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
	async generateNewProgress(user: User) {
		const topics = await this.topicModel.find().exec();
		const TQProgress: ITopicsQuestionProgress[] = [];

		const saveQuestionProgress = async (questions: string[]) => {
			const QProgress: IQuestionProgress[] = [];

			questions.forEach((questionId) => {
				const questionProgress: IQuestionProgress = {
					isCorrect: false,
					questionId: questionId,
				};
				QProgress.push(questionProgress);
			});

			const newQuestionProgress = await new this.questionProgressModel({
				questionsProgress: QProgress,
			}).save();

			return newQuestionProgress.id;
		};

		const promiseArray = [];
		for (let i = 0; i < topics.length; i++) {
			const topic = topics[i];
			promiseArray.push(saveQuestionProgress(topic.questions));
		}
		Promise.all(promiseArray).then(async (data) => {
			data.forEach((id, index) => {
				TQProgress.push({
					topicID: topics[index].id,
					lastQuestionIndex: 0,
					questionProgressId: id,
				});
			});

			const userTopicProgress = await new this.topicProgressModel({
				userId: user.id,
				topics: TQProgress,
			}).save();

			if (userTopicProgress) {
				this.logger.log(`Progress for ${user.username} - ${user.id} created`);
			}
		});
	}
}
