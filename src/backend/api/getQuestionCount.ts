import express from 'express';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/index.js';

const router = express.Router();

router.get('/get-question-count/:learningObjectiveID', async (req, res) => {
    const { learningObjectiveID } = req.params;
    try {
        const questionsQuery = query(collection(db, 'question'), where('learningObjectiveID', '==', learningObjectiveID));
        const querySnapshot = await getDocs(questionsQuery);
        const count = querySnapshot.size;
        res.json({ count });
    } catch (error) {
        console.error('Error fetching question count:', error);
        res.status(500).send('Error fetching question count.');
    }
});

export default router;