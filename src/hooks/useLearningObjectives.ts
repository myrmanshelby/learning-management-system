import { useState, useEffect } from 'react';
import { collection, db, getDocs } from '../firebase/index';

interface LearningObjective {
    id: string;
    objective: string;
    chapter: string;
}

export const useLearningObjectives = () => {
    const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);

    useEffect(() => {
        const fetchLearningObjectives = async () => {
            const querySnapshot = await getDocs(collection(db, "learningObjective"));
            const objectives: LearningObjective[] = [];
            querySnapshot.forEach((doc) => {
                objectives.push({ id: doc.id, ...doc.data() } as LearningObjective);
            });
            console.log('Fetched Learning Objectives:', objectives); // Add this line
            setLearningObjectives(objectives);
        };

        fetchLearningObjectives();
    }, []);

    return learningObjectives;
};
