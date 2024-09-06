import express from 'express';
import { db, collection, getDocs, getDoc, doc, query, where } from '../../firebase/index.js';
import { createProblemSet, overwriteQuestion } from './problemSetCreator';


const router = express.Router();

// router.get('/fetch-chapters', async (req, res) => {
//   try {
//     const chaptersQuery = query(collection(db, 'chapter'));
//     const chaptersSnapshot = await getDocs(chaptersQuery);
//     const chapters: any[] = [];
//     chaptersSnapshot.forEach(doc => {
//       chapters.push(doc.data());
//     });
//     res.json(chapters);
//   } catch (error) {
//     console.error('Error fetching chapters:', error); // Improved logging
//     res.status(500).json({ error: 'Failed to fetch chapters' });
//   }
// });

router.get('/chapters/:chapterId/sections', async (req, res) => {
  const { chapterId } = req.params;

  try {
    // Fetch the chapter document
    const chapterDoc = await getDoc(doc(db, 'chapter', chapterId));
    if (!chapterDoc.exists()) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const chapterData = chapterDoc.data();
    const sectionIDs = chapterData.sectionIDs;

    // Fetch each section using the section IDs from the chapter document
    const sectionPromises = sectionIDs.map(sectionID => getDoc(doc(db, 'section', sectionID)));
    const sectionDocs = await Promise.all(sectionPromises);

    // Extract section data
    const sections = sectionDocs.map(sectionDoc => sectionDoc.data());

    res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

router.get('/fetch-questions', async (req, res) => {
  const { objectiveId } = req.query;

  if (!objectiveId) {
    res.status(400).json({ error: 'Objective ID is required' });
    return;
  }

  try {
    const questionsQuery = query(collection(db, 'question'), where('learningObjectiveID', '==', objectiveId));
    const questionsSnapshot = await getDocs(questionsQuery);
    const questions: any[] = [];
    questionsSnapshot.forEach(doc => {
      questions.push(doc.data());
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/overwrite-question', async (req, res) => {
  const { questionID, learningObjectiveID, newQuestion, newAnswer, newDifficulty } = req.body;
  try {
    await overwriteQuestion(questionID, learningObjectiveID, newQuestion, newAnswer, newDifficulty);
    res.status(200).send('Question overwritten successfully.');
  } catch (error) {
      console.error('Error overwriting question:', error);
      res.status(500).send('Error overwriting question.');
  }
});



export default router;
