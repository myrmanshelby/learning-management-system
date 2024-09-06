import { collection, getDocs, doc, getDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { LearningObjective, Question, Chapter, Section, Conversation  } from '../models/firebase-types.js';

export const saveConversationToFirebase = async (
  currentUser: string | null,
  questionID: string,
  conversation: Conversation[],
  isCorrect: boolean // New parameter to track if the answer was correct
): Promise<void> => {
  if (!currentUser) return;

  // Updated document path to include "questions" subcollection
  const conversationDocRef = doc(db, 'conversations', currentUser, 'questions', questionID);

  try {
      await setDoc(conversationDocRef, { 
          conversation, 
          isCorrect // Add this field to track correctness
      });
      console.log('Conversation and correctness saved successfully to path:', `conversations/${currentUser}/questions/${questionID}`);
  } catch (error) {
      console.error('Error saving conversation:', error);
  }
};

export const fetchConversationFromFirebase = async (
  currentUser: string | null,
  questionID: string
): Promise<{ conversation: Conversation[], isCorrect: boolean } | null> => {
  if (!currentUser) return null;

  const conversationDocRef = doc(db, 'conversations', currentUser, 'questions', questionID);

  try {
      const docSnap = await getDoc(conversationDocRef);
      if (docSnap.exists()) {
          const data = docSnap.data();
          return {
              conversation: data?.conversation || [],
              isCorrect: data?.isCorrect || false,
          };
      } else {
          console.log('No such conversation found!');
          return null;
      }
  } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
  }
};

export const getObjectives = async (): Promise<LearningObjective[]> => {
  const objectivesCollection = collection(db, 'learningObjective');
  const objectivesSnapshot = await getDocs(objectivesCollection);
  const objectivesList = objectivesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
          learningObjectiveID: doc.id,
          objective: data.objective,
          questions: data.questions || []
      } as LearningObjective;
  });
  return objectivesList;
};

export const getSections = async (): Promise<Section[]> => {
  const sectionsSnapshot = await getDocs(collection(db, 'section'));
  const sections: Section[] = sectionsSnapshot.docs.map(doc => ({
      sectionID: doc.id,
      ...doc.data()
  })) as Section[];
  return sections;
};


export const fetchLearningObjectives = async (): Promise<(LearningObjective & { id: string })[]> => {
  const querySnapshot = await getDocs(collection(db, 'learningObjectives'));
  const learningObjectives: (LearningObjective & { id: string })[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const learningObjective: LearningObjective & { id: string } = {
      id: doc.id, // Keeping id separately
      learningObjectiveID: data.learningObjectiveID,
      objective: data.objective,
      questions: data.questions
    };
    learningObjectives.push(learningObjective);
  });
  return learningObjectives;
};

export const fetchQuestionsByObjective = async (questionIds: string[]): Promise<Question[]> => {
  if (questionIds.length === 0) return [];
  const questionsCollection = collection(db, 'question');
  const q = query(questionsCollection, where('questionID', 'in', questionIds));
  const querySnapshot = await getDocs(q);
  const questionsList = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      questionID: doc.id
  } as Question));
  return questionsList;
};

export const getChapters = async (): Promise<Chapter[]> => {
  const chaptersCollection = collection(db, 'chapter');
  const chaptersSnapshot = await getDocs(chaptersCollection);
  const chaptersList = chaptersSnapshot.docs.map(doc => doc.data() as Chapter);
  return chaptersList;
};

export const getQuestion = async (questionID: string): Promise<Question | undefined> => {
  try {
      const docRef = doc(db, "question", questionID);
      const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const question: Question = {
                answer: data.answer,
                questionID: data.questionID,
                question: data.question,
                difficultyLevel: data.difficultyLevel,
                learningObjectiveID: data.learningObjectiveID
            };

          return question;
      }
  } catch (e) {
      console.error("Error finding question: ", e);
  }
};

export const fetchChapters = async (): Promise<Chapter[]> => {
  const chaptersSnapshot = await getDocs(collection(db, 'chapter'));
  return chaptersSnapshot.docs.map(doc => ({ chapterID: doc.id, ...doc.data() } as Chapter));
};

export const fetchSectionsForChapter = async (chapterId: string): Promise<Section[]> => {
  const chapterDoc = await getDoc(doc(db, 'chapter', chapterId));
  if (!chapterDoc.exists()) throw new Error('Chapter not found');

  const chapterData = chapterDoc.data();
  const sectionPromises = chapterData.sectionIDs.map((sectionID: string) => getDoc(doc(db, 'section', sectionID)));
  const sectionDocs = await Promise.all(sectionPromises);
  return sectionDocs.map(doc => ({ sectionID: doc.id, ...doc.data() } as Section));
};

export const fetchQuestionsBySection = async (sectionId: string): Promise<Question[]> => {
  const sectionDoc = await getDoc(doc(db, 'section', sectionId));
  if (!sectionDoc.exists()) throw new Error('Section not found');

  const sectionData = sectionDoc.data();
  const learningObjectivePromises = sectionData.learningObjectiveIDs.map((objectiveID: string) => getDoc(doc(db, 'learningObjective', objectiveID)));
  const learningObjectiveDocs = await Promise.all(learningObjectivePromises);

  const questionIDs: string[] = [];
  learningObjectiveDocs.forEach(learningObjectiveDoc => {
      if (learningObjectiveDoc.exists()) {
          const data = learningObjectiveDoc.data();
          questionIDs.push(...data.questions);
      }
  });

  const questionPromises = questionIDs.map(questionID => getDoc(doc(db, 'question', questionID)));
  const questionDocs = await Promise.all(questionPromises);

  return questionDocs.map(questionDoc => ({ questionID: questionDoc.id, ...questionDoc.data() } as Question));
};