import { Question } from '../models/firebase-types';

export const handleSelectObjective = (
    objectiveId: string,
    learningObjectives: any[],
    questions: any[],
    setSelectedObjective: React.Dispatch<React.SetStateAction<string | null>>,
    setSelectedQuestion: React.Dispatch<React.SetStateAction<Question | null>>,
    setHeaderText: React.Dispatch<React.SetStateAction<string>>
) => {
    setSelectedObjective(objectiveId);
    const currentObjective = learningObjectives.find(obj => obj.id === objectiveId);
    if (currentObjective && questions.length > 0) {
        setSelectedQuestion(questions[0]);
        setHeaderText(questions[0].question);
    }
};

export const handleSelectQuestion = (
    question: Question,
    setSelectedQuestion: React.Dispatch<React.SetStateAction<Question | null>>,
    setHeaderText: React.Dispatch<React.SetStateAction<string>>
) => {
    setSelectedQuestion(question);
    setHeaderText(question.question);
};
