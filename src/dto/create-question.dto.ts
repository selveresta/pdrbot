export class CreateQuestionDto {
	readonly question: string;
	readonly img: string;
	readonly correct: string;
	readonly answers: string[];
}
