// queryFirestore.mjs

import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Read and parse the service account JSON file
const serviceAccount = JSON.parse(
  await readFile(
    new URL('./serviceAccountKey.json', import.meta.url)
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function queryStudent(studentID) {
  try {
    console.log(`Fetching data for studentID: ${studentID}`);

    // Fetch the student document
    const studentDoc = await db.collection('user').doc(studentID).get();
    if (!studentDoc.exists) {
      console.log('No such student!');
      return;
    }
    const studentData = studentDoc.data();
    console.log('Student Data:', studentData);

    // Fetch the class document
    const classDoc = await db.collection('class').doc(studentData.classID).get();
    if (!classDoc.exists) {
      console.log('No such class!');
      return;
    }
    const classData = classDoc.data();
    console.log('Class Data:', classData);

    // Fetch the learning objectives
    const learningObjectives = [];
    for (const objectiveID of classData.learningObjectiveIDs) {
      console.log(`Querying for learning objective with ID: ${objectiveID}`);
      const objectiveQuerySnapshot = await db.collection('learningObjective').where('learningObjectiveID', '==', objectiveID).get();
      if (!objectiveQuerySnapshot.empty) {
        objectiveQuerySnapshot.forEach(doc => {
          console.log(`Found learning objective: ${JSON.stringify(doc.data())}`);
          learningObjectives.push(doc.data());
        });
      } else {
        console.log(`Learning objective with ID: ${objectiveID} does not exist`);
      }
    }
    console.log('Learning Objectives:', learningObjectives);
  } catch (error) {
    console.error('Error querying Firestore:', error);
  }
}

// Replace 'testUserID1' with the actual studentID you want to query
queryStudent('testUser1');
