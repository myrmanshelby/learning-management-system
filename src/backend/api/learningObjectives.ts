import express from 'express';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/index.js';
const router = express.Router();

export const getAllLearningObjectives = async () => {
    const objectivesCollection = collection(db, 'learningObjective');
    const objectivesSnapshot = await getDocs(objectivesCollection);
    const objectives = [];
    objectivesSnapshot.forEach((doc) => {
        objectives.push({ id: doc.id, ...doc.data() });
    });
    return objectives;
};

router.get('/learning-objectives', async (req, res) => {
    try {
        const learningObjectives = await getAllLearningObjectives();
        res.status(200).json(learningObjectives);
    } catch (error) {
        console.error('Error fetching learning objectives:', error);
        res.status(500).send('Error fetching learning objectives.');
    }
});

export default router;
