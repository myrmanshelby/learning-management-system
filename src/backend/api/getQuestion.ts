import express from 'express';
import { getQuestion } from '../../firebase/index.js';

const router = express.Router();

router.get('/get-question/:questionID', async (req, res) => {
    const { questionID } = req.params;
    try {
        const question = await getQuestion(questionID);
        res.json(question);
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).send('Error fetching question.');
    }
});

export default router;