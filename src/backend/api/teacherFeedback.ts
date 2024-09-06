import { getObjective } from "../../firebase/index.js";
import { generateResponse } from "../../gemini/gemini.js";
import * as data from '../../models/firebase-types';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const db = getFirestore();

export async function getTeacherFeedback(objectiveID: string) {
    const objectiveData: data.LearningObjective = await getObjective(objectiveID)

    const scoresCollectionRef = collection(db, "learningObjectiveScore");
    const q = query(scoresCollectionRef, where("learningObjectiveID", "==", objectiveID));
    const querySnapshot = await getDocs(q);

    let totalFeedback: string[] = [];
    querySnapshot.forEach(doc => {
    const feedbackArray = doc.data().feedback as string[];
    if (feedbackArray) {
      totalFeedback = totalFeedback.concat(feedbackArray);
    }
    });
    
    const prompt = `A teacher is teaching their students the following learning objective: ${objectiveData.objective}
    As the students work through their coursework, they are receiving the following feedback: ${totalFeedback}
    Please respond with the following, speaking directly to the teacher: Please provide a short summary of what your students are
    struggling with and how the teacher could better teach the objective. Your total response should be
    less than 80 words.`
    const summary = await generateResponse(prompt);

    return summary;
} 