import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from '../firebase/index.js';
import {collection, getDocs, getDoc, doc, query, where} from 'firebase/firestore';

import * as gemini_api from '../gemini/gemini.js';
import multer from 'multer'
import apiRouter from './api/session.js';
import learningObjectivesRouter from './api/learningObjectives.js';
import getQuestionRouter from './api/getQuestion.js';
import getQuestionCountRouter from './api/getQuestionCount.js'; // Import getQuestionCount router
import { signUp } from './api/sign-up.js';
import { checkProcessingStatus as checkProcessingStatusHandler, createProblemSet, getLearningObjective, getProblemSet, startProcessingBook as uploadBook } from './api/book.js';
import { getScoreList } from './api/score.js';
import getProblemSetRouter from './api/getProblemSet.js';
import { getQuestionsForSection, getClass, getUser } from '../firebase/index.js';
import { getTotalScore } from './api/score.js';
import { createClassHandler as createClassHandler, getChaptersAndSectionsHandler, getClassesHandler, list_classes_handler as listClassesHandler } from './api/classes.js';
import { getClassData } from './api/teacherScoring.js';
import { getUserHandler } from './api/users.js';
import { User } from '../models/frontend-models.js';
import { setUser } from '../firebase/index.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./book-processor/book-processor/uploads"); 
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});


const upload = multer({ storage: storage });

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const reactAssetPath = path.join(__dirname, "..", "frontend");
console.log(`Statically linking React bundle.js at ${reactAssetPath}`);

app.use(express.static(reactAssetPath));
app.use(express.json());
app.use(bodyParser.json());

console.log(`Binding APIs`);

app.use('/api', getProblemSetRouter);
app.use('/api', apiRouter);
app.use('/api', learningObjectivesRouter);
app.use('/api', getQuestionRouter);
app.use('/api', getQuestionCountRouter); // Use the new router for fetching question counts
app.use('/api', getProblemSetRouter);
app.post('/api/gemini', gemini_api.generateResponse);
app.post('/api/sign-up', signUp);

// Returns the class list for the user passed
app.post('/api/classes', listClassesHandler)
app.post('/api/class/create', createClassHandler)
app.post('/api/class', getClassesHandler)
app.post('/api/chapters', getChaptersAndSectionsHandler)
app.post('/api/objectives', getLearningObjective)
app.post('/api/create-problem-set', createProblemSet)
app.post('/api/problem-set', getProblemSet)
app.post('/api/user', getUserHandler)

app.post('/books/upload', upload.single('file'), uploadBook)
app.post('/api/book/status', checkProcessingStatusHandler)

app.post('/api/createUser', async (req, res) => {
  const userData: User = req.body;
  console.log(userData);
  try {
      await setUser(userData);
      res.status(200).send({ message: 'User created successfully' });
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send({ message: 'Failed to create user' });
  }
});

app.post('/api/test', async (req, res) => {
  const { classID } = req.body;
  try {
      const { objectiveScoreData, sectionScoreData, chapterScoreData } = await getClassData(classID);
      console.log(objectiveScoreData);
      res.status(200).send('Success.');
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error.');
  }
});


app.get('/api/class-chapter-data/:classID', async (req, res) => {
  const { classID } = req.params;
  try {
    const { objectiveScoreData, sectionScoreData, chapterScoreData } = await getClassData(classID);
    // Return all three objects in a single JSON response
    res.status(200).json({
      objectiveScoreData,
      sectionScoreData,
      chapterScoreData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching class chapter data.');
  }
});

app.get('/api/student-total-score/:userID/:classID', async (req, res) => {
  const { userID, classID } = req.params;
  try {
    const score = await getTotalScore(classID, userID);
    res.status(200).json(score);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching student score list.');
  }
});

// Endpoint to get list of student scores
app.get('/api/student-score-list/:userID/:classID', async (req, res) => {
  const { userID, classID } = req.params;
  try {
      console.log("score list", userID, classID);
      const studentScoreList = await getScoreList(classID, userID);

      res.status(200).json(studentScoreList);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error fetching student total score.');
  }
});

// Endpoint to get student score
app.get('/api/class/:classID/students-scores', async (req, res) => {
  const { classID } = req.params;
  try {
      const classInfo = await getClass(classID);
      const studentScores = await Promise.all(
          classInfo.students.map(async (studentID: string) => {
              const student = await getUser(studentID);
              console.log(student)
              const score = await getTotalScore(classID, studentID);
              return {
                  firstname: student.firstname,
                  lastname: student.lastname,
                  email: student.email,
                  score,
              };
          })
      );
      res.json(studentScores);
  } catch (error) {
      console.error('Error fetching students scores:', error);
      res.status(500).send('Internal server error');
  }
});

// Endpoint to fetch sections for a chapter
app.get('/api/chapters/:chapterId/sections', async (req, res) => {
  const { chapterId } = req.params;
  console.log(`Fetching sections for chapter: ${chapterId}`);

  try {
    // Fetch the chapter document
    const chapterDocRef = doc(db, 'chapter', chapterId);
    console.log(`Reference created for chapter: ${chapterDocRef.path}`);

    const chapterDoc = await getDoc(chapterDocRef);
    console.log(`Document snapshot: ${JSON.stringify(chapterDoc)}`);

    if (!chapterDoc.exists()) {
      console.log(`Chapter with ID ${chapterId} not found.`);
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const chapterData = chapterDoc.data();
    console.log(`Chapter data: ${JSON.stringify(chapterData)}`);

    const sectionIDs = chapterData.sectionIDs || [];
    console.log(`Section IDs: ${JSON.stringify(sectionIDs)}`);

    // Fetch each section using the section IDs from the chapter document
    const sectionPromises = sectionIDs.map(sectionID => getDoc(doc(db, 'section', sectionID)));
    const sectionDocs = await Promise.all(sectionPromises);

    // Extract section data
    const sections = sectionDocs.map(sectionDoc => sectionDoc.data());
    console.log(`Sections data: ${JSON.stringify(sections)}`);

    res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

app.get('/api/learning-objective/:objectiveID', async (req, res) => {
  const { objectiveID } = req.params;

  try {
    const objectiveDoc = await getDoc(doc(db, 'learningObjective', objectiveID));
    if (!objectiveDoc.exists()) {
      return res.status(404).json({ error: 'Learning objective not found' });
    }

    const objectiveData = objectiveDoc.data();
    res.status(200).json(objectiveData);
  } catch (error) {
    console.error('Error fetching learning objective:', error);
    res.status(500).json({ error: 'Failed to fetch learning objective' });
  }
});


// Endpoint to fetch problem set for a section
app.get('/api/get-problem-set/:sectionID', async (req, res) => {
  const { sectionID } = req.params;
  try {
      const questions = await getQuestionsForSection(sectionID);
      if (questions.length === 0) {
          return res.status(404).json({ message: 'No questions found' });
      }
      res.json(questions);
  } catch (error) {
      console.error('Error fetching problem set:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// WORKING: Endpoint to fetch learning objectives for a specific chapter
app.get('/api/chapters/:chapterId/learning-objectives', async (req, res) => {
  const { chapterId } = req.params;
  try {
      const chapterDoc = await getDoc(doc(db, 'chapter', chapterId));
      if (!chapterDoc.exists()) {
          return res.status(404).send('Chapter not found');
      }
      const chapterData = chapterDoc.data() as any;
      const learningObjectives = [];
      for (const sectionID of chapterData.sectionIDs) {
          const sectionDoc = await getDoc(doc(db, 'section', sectionID));
          if (sectionDoc.exists()) {
              const { learningObjectiveIDs } = sectionDoc.data() as any;
              for (const objectiveID of learningObjectiveIDs) {
                  const objectiveDoc = await getDoc(doc(db, 'learningObjective', objectiveID));
                  if (objectiveDoc.exists()) {
                      learningObjectives.push(objectiveDoc.data());
                  }
              }
          }
      }
      res.status(200).json(learningObjectives);
  } catch (error) {
      console.error('Error fetching learning objectives:', error);
      res.status(500).send('Error fetching learning objectives.');
  }
});

app.get('/api/students', async (req, res) => {
  try {
      const studentsCollection = collection(db, 'user');
      const q = query(studentsCollection, where('userType', '==', 'student'));
      const querySnapshot = await getDocs(q);
      const students = querySnapshot.docs.map(doc => doc.data());
      res.status(200).json(students);
  } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.use((req, res, next) => {
  res.redirect("/");
});