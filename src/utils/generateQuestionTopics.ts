import * as fs from 'fs';

function removeExtension(filename) {
	return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export const getRegEx = () => {
	return /[-+]?[0-9]*\.?[0-9]/;
};

export const generateQuestionTopicFromJSON = (mediator) => {
	let dir = fs.readdirSync('./themes');
	const regEx = getRegEx();
	dir.forEach(async (fileName, index) => {
		const topicNumber = fileName.match(regEx);

		const questions = JSON.parse(fs.readFileSync(`./themes/${fileName}`, 'utf-8'));
		const resQuestion = [];

		const saveQuestions = async (array, finalArray) => {
			array.forEach(async (element, index) => {
				const answers = [];
				let img;
				for (const key in element) {
					if (key === 'question' || key === 'correct') {
						continue;
					}
					if (key === 'img') {
						img = element[key];
						continue;
					}
					const ans = element[key];
					answers.push(ans);
				}
				const newQuestion = mediator.createQuestion({
					question: element.question,
					correct: element.correct,
					img: img ? img : 'nophoto',
					answers: answers,
				});
				finalArray.push(newQuestion);
			});
			return finalArray;
		};

		const saveTopic = async (number, questionsIds) => {
			const newtTopic = await mediator.createTopic({
				// name: `topic${number}`,
				name: removeExtension(fileName).split('_').join(' '),
				questions: questionsIds,
			});
		};
		Promise.all(await saveQuestions(questions, resQuestion)).then((value) => {
			const idArray = value.map((value) => value.id);
			const resultTopic = saveTopic(topicNumber, idArray);
		});
	});
};
