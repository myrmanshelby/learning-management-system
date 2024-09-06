import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupFirestore() {
  // Add users
  await db.collection('user').doc('student1').set({
    classID: 'class1'
  });
  await db.collection('user').doc('student2').set({
    classID: 'class1'
  });
  await db.collection('user').doc('student3').set({
    classID: 'class1'
  });

  // Add class
  await db.collection('classes').doc('class1').set({
    title: 'Math Class',
    students: ['student1', 'student2', 'student3'],
    teachers: ['teacher1'],
    chapterIDs: ['chapter1', 'chapter2'],
    learningObjectiveIDs: [
      'objective1', 'objective2', 'objective3', 'objective4', 
      'objective5', 'objective6', 'objective7', 'objective8'
    ],
    questionIDs: [
      'question1', 'question2', 'question3', 
      'question4', 'question5', 'question6',
      'question7', 'question8', 'question9', 
      'question10', 'question11', 'question12',
      'question13', 'question14', 'question15',
      'question16', 'question17', 'question18',
      'question19', 'question20', 'question21',
      'question22', 'question23', 'question24'
    ]
  });

  // Add chapters
  await db.collection('chapters').doc('chapter1').set({
    title: 'Basic Algebra',
    classID: 'class1',
    learningObjectiveIDs: ['objective1', 'objective2', 'objective3', 'objective4']
  });
  await db.collection('chapters').doc('chapter2').set({
    title: 'Geometry',
    classID: 'class1',
    learningObjectiveIDs: ['objective5', 'objective6', 'objective7', 'objective8']
  });

  // Add learning objectives and questions
  const objectives = [
    { id: 'objective1', chapterID: 'chapter1', objective: 'Understand variables and expressions' },
    { id: 'objective2', chapterID: 'chapter1', objective: 'Solve linear equations' },
    { id: 'objective3', chapterID: 'chapter1', objective: 'Graph linear equations' },
    { id: 'objective4', chapterID: 'chapter1', objective: 'Understand inequalities' },
    { id: 'objective5', chapterID: 'chapter2', objective: 'Understand geometric shapes' },
    { id: 'objective6', chapterID: 'chapter2', objective: 'Calculate perimeter and area' },
    { id: 'objective7', chapterID: 'chapter2', objective: 'Understand angles and triangles' },
    { id: 'objective8', chapterID: 'chapter2', objective: 'Calculate volume of solids' }
  ];

  const questions = [
    { id: 'question1', objectiveID: 'objective1', question: 'What is a variable?', answer: 'A variable is a symbol used to represent a number in an expression or equation.' },
    { id: 'question2', objectiveID: 'objective1', question: 'Simplify the expression 2x + 3x.', answer: '5x' },
    { id: 'question3', objectiveID: 'objective1', question: 'What is an algebraic expression?', answer: 'An algebraic expression is a mathematical phrase that can include numbers, variables, and operation symbols.' },
    { id: 'question4', objectiveID: 'objective2', question: 'Solve the equation 2x = 10.', answer: 'x = 5' },
    { id: 'question5', objectiveID: 'objective2', question: 'Solve the equation x/2 = 4.', answer: 'x = 8' },
    { id: 'question6', objectiveID: 'objective2', question: 'What is the first step in solving the equation 3x - 5 = 10?', answer: 'Add 5 to both sides.' },
    { id: 'question7', objectiveID: 'objective3', question: 'What is the slope of the line y = 2x + 3?', answer: 'The slope is 2.' },
    { id: 'question8', objectiveID: 'objective3', question: 'Plot the point (3,4) on the graph.', answer: 'The point (3,4) is 3 units to the right and 4 units up from the origin.' },
    { id: 'question9', objectiveID: 'objective3', question: 'What is the y-intercept of the line y = -x + 2?', answer: 'The y-intercept is 2.' },
    { id: 'question10', objectiveID: 'objective4', question: 'Solve the inequality 3x > 9.', answer: 'x > 3' },
    { id: 'question11', objectiveID: 'objective4', question: 'What does the inequality sign ≤ mean?', answer: 'Less than or equal to.' },
    { id: 'question12', objectiveID: 'objective4', question: 'Graph the inequality x < 4.', answer: 'A graph showing a line at x = 4 with shading to the left.' },
    { id: 'question13', objectiveID: 'objective5', question: 'Name three types of triangles.', answer: 'Equilateral, isosceles, and scalene.' },
    { id: 'question14', objectiveID: 'objective5', question: 'What is a quadrilateral?', answer: 'A four-sided polygon.' },
    { id: 'question15', objectiveID: 'objective5', question: 'Define a circle.', answer: 'A circle is a shape with all points the same distance from its center.' },
    { id: 'question16', objectiveID: 'objective6', question: 'Calculate the perimeter of a rectangle with sides 4 cm and 6 cm.', answer: '20 cm' },
    { id: 'question17', objectiveID: 'objective6', question: 'What is the area of a triangle with base 5 cm and height 3 cm?', answer: '7.5 cm²' },
    { id: 'question18', objectiveID: 'objective6', question: 'How do you find the area of a circle?', answer: 'Area = π × radius²' },
    { id: 'question19', objectiveID: 'objective7', question: 'What is an acute angle?', answer: 'An angle less than 90 degrees.' },
    { id: 'question20', objectiveID: 'objective7', question: 'Define a right angle.', answer: 'A right angle is an angle of exactly 90 degrees.' },
    { id: 'question21', objectiveID: 'objective7', question: 'What is the sum of the interior angles of a triangle?', answer: '180 degrees.' },
    { id: 'question22', objectiveID: 'objective8', question: 'Calculate the volume of a cube with side length 3 cm.', answer: '27 cm³' },
    { id: 'question23', objectiveID: 'objective8', question: 'What is the formula for the volume of a cylinder?', answer: 'Volume = π × radius² × height' },
    { id: 'question24', objectiveID: 'objective8', question: 'How do you find the volume of a rectangular prism?', answer: 'Volume = length × width × height' }
  ];

  // Add learning objectives
  for (const obj of objectives) {
    await db.collection('learningObjectives').doc(obj.id).set({
      chapterID: obj.chapterID,
      objective: obj.objective
    });
  }

  // Add questions
  for (const q of questions) {
    await db.collection('questions').doc(q.id).set({
      question: q.question,
      answer: q.answer,
      learningObjectiveID: q.objectiveID
    });
  }

  console.log('Firestore setup complete.');
}

setupFirestore().catch(console.error);
