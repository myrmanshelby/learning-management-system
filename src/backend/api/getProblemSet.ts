import express from 'express';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/index.js';

const router = express.Router();

router.get('/get-problem-set/:learningObjectiveID', async (req, res) => {
    const { learningObjectiveID } = req.params;
    try {
        console.log(`Fetching document for learningObjectiveID: ${learningObjectiveID}`);
        
        // Access the learning objective document
        const docRef = doc(db, 'learningObjective', learningObjectiveID);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists()) {
            return res.status(404).json({ message: 'No learning objective found' });
        }

        const learningObjectiveData = docSnapshot.data();
        const questionIDs = learningObjectiveData?.questions || [];

        console.log(`Question IDs: ${JSON.stringify(questionIDs)}`);

        // Fetch the questions
        const questionsCollection = collection(db, 'question');
        const questionsQuery = query(questionsCollection, where('questionID', 'in', questionIDs));
        const querySnapshot = await getDocs(questionsQuery);

        const questions = querySnapshot.docs.map(doc => ({ ...doc.data(), questionID: doc.id }));
        console.log(`Found questions: ${JSON.stringify(questions)}`);

        res.json(questions);
    } catch (error) {
        console.error('Error fetching problem set:', error);
        res.status(500).send('Error fetching problem set.');
    }
});

export default router;