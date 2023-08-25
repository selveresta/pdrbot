import { Injectable } from '@nestjs/common';
import { TopicDocument } from '../../schema/topic.schema';
import { QuestionDocument } from '../../schema/question.schema';

@Injectable()
export class WrapperService {
	private topicWrapper = '!';
	private answerWrapper = '@';
	private questionWrapper = '#';

	constructor() {}

	public wrapTopicCallBack(topic: TopicDocument): string {
		return `topic${this.topicWrapper}${topic.id}${this.topicWrapper}`;
	}

	public getTopicWrapper() {
		return this.topicWrapper;
	}

    public getQuestionWrapper() {
		return this.questionWrapper;
	}


    public getAnswerWrapper() {
		return this.answerWrapper;
	}


    public wrapQuestionCallBack(topicID: string, questionID: string, answerIndex: number): string {
		return `${this.topicWrapper}${topicID}${this.topicWrapper}${this.questionWrapper}${questionID}${this.questionWrapper}${this.answerWrapper}${answerIndex}${this.answerWrapper}`;
	}

	public wrapPrevWIUQuestion(topicID: string): string {
		return `${this.topicWrapper}${topicID}${this.topicWrapper}*prev`;
	}

	public wrapNexWIUQuestion(topicID: string): string {
		return `${this.topicWrapper}${topicID}${this.topicWrapper}*next*`;
	}

	public wrapPrevQuestion(topicID: string): string {
		return `${this.topicWrapper}${topicID}${this.topicWrapper}prev`;
	}

	public wrapNexQuestion(topicID: string): string {
		return `${this.topicWrapper}${topicID}${this.topicWrapper}next`;
	}
}
