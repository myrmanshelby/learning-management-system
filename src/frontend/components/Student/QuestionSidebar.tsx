import React from 'react';
import { Question } from '../../../models/firebase-types';
import Sidebar from '../Sidebar/Sidebar';

interface QuestionSidebarProps {
    questions: Question[];
    selectedQuestion: Question | null;
    correctlyAnsweredQuestions: string[];
    handleSelectQuestion: (question: Question) => void;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
    questions,
    selectedQuestion,
    correctlyAnsweredQuestions,
    handleSelectQuestion
}) => {
    return (
        <Sidebar
            questions={questions}
            selectedQuestion={selectedQuestion?.question || ''}
            correctlyAnsweredQuestions={correctlyAnsweredQuestions}
            onSelectQuestion={handleSelectQuestion}
        />
    );
};

export default QuestionSidebar;