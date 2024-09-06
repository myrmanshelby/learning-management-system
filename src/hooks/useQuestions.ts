import { useState, useEffect } from 'react';
import { collection, db, getDocs, query, where } from '../firebase/index';

interface Question {
    type: string;
    question: string;
    answer: string;
}

export const useQuestions = (objectiveId: string | null) => {
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (!objectiveId) return;
        const fetchQuestions = async () => {
            const questionsQuery = query(collection(db, 'question'), where('learningObjectiveID', '==', objectiveId));
            const querySnapshot = await getDocs(questionsQuery);
            const questions: Question[] = [];
            querySnapshot.forEach((doc) => {
                questions.push(doc.data() as Question);
            });
            setCurrentQuestions(questions);
        };

        fetchQuestions();
    }, [objectiveId]);

    return currentQuestions;
};