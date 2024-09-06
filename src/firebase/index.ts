import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, setDoc, deleteDoc, doc, getDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import * as data from "../models/firebase-types";
import { v4 as uuidv4 } from 'uuid';
import { ContentPiece } from "../services/bookProcessorService";

const firebaseConfig = {
    apiKey: "AIzaSyCpg6jjPP2nLoYMrMVdrRGILJu0Fperwec",
    authDomain: "gemini-hackathon-tutor.firebaseapp.com",
    projectId: "gemini-hackathon-tutor",
    storageBucket: "gemini-hackathon-tutor.appspot.com",
    messagingSenderId: "998818283201",
    appId: "1:998818283201:web:73a92807a57efded539e40",
    measurementId: "G-V5XPGELDWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
export { db, collection, getDocs, query, where, setDoc, deleteDoc, doc, getDoc, uuidv4 };

// Set functions
export async function createChapter(chapterData: data.Chapter) {
    const chapterId = uuidv4();
    try {
        await setDoc(doc(db, "chapter", chapterId), { 
            chapterID: chapterId,
            sectionIDs: chapterData.sectionIDs,
            title: chapterData.title
         })
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function updateChapter(chapterData: data.Chapter) {
    try {
        await setDoc(doc(db, "chapter", chapterData.chapterID), { 
            chapterID: chapterData.chapterID,
            sectionIDs: chapterData.sectionIDs,
            title: chapterData.title
         })
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

/**
 * Creates a class and links it to particular teacher who created it.
 * 
 * @param classData 
 */
export async function createClass(
    creator: string, 
    classData: data.Class,
    contents: ContentPiece[],
    filepath: string,
) {
    const batch = writeBatch(db);
    const classDocument = doc(db, "class", classData.classID);
    const sourceDocument = doc(db, "source", classData.sourceID);
    const userToClassesLookupDocument = doc(db, "user_to_classes_lookup", creator);

    try {
        const chapterIds = contents
        .filter((c) => c.numeral.endsWith("0")) 
        .map((c) => {
            const chapterId: string = uuidv4()
            const chapterDocument = doc(db, "chapter", chapterId);

            const chapterNumber = c.numeral.split(".")[0]
            const sectionsInChapter = contents.filter(
                (s) => s.numeral.startsWith(chapterNumber + ".") && !s.numeral.endsWith("0")
            )
            const sectionIds = sectionsInChapter.map(s => {
                const sectionId: string = uuidv4()
                const sectionDocument = doc(db, "section", sectionId);
                const sectionData: data.Section = {
                    sectionID: sectionId,
                    title: s.name,
                    firstPageInPDF: `${s.page}`,
                    learningObjectiveIDs: []
                }
                batch.set(sectionDocument, sectionData);
                return sectionId
            })

            const chapterData: data.Chapter = {
                chapterID: chapterId,
                sectionIDs: sectionIds,
                title: c.name
            }
            batch.set(chapterDocument,  chapterData);
            return chapterId
        })

        const sourceData: data.Source = {
            sourceID: classData.sourceID,
            filepath: filepath, 
            chapterIDs: chapterIds
        }
        batch.set(sourceDocument, sourceData);
        batch.set(classDocument, classData);
        batch.set(userToClassesLookupDocument, {
            classes: arrayUnion(classData.classID)
        });
        batch.commit();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

/**
 * Returns the classes linked to particular user.
 * 
 * @param userID 
 * @returns 
 */
export async function getClassesForUser(userID: string): Promise<string[]> {
    const docRef = doc(db, 'user_to_classes_lookup', userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return data.classes   
    } else {
        throw new Error('Learning objective not found');
    }
}

export async function updateClass(classData: data.Class) {
    try {
        await setDoc(doc(db, "class", classData.classID), { 
            classID: classData.classID,
            title: classData.title,
            sourceID: classData.sourceID,
            students: classData.students,
            teachers: classData.teachers
         });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function createLearningObjectives(section: data.Section, objectiveDatas: data.LearningObjective[]): Promise<data.LearningObjective[]> {
    try {
        const batch = writeBatch(db);
        objectiveDatas.forEach(od => {
            const objectiveDocument = doc(db, "learningObjective", od.learningObjectiveID)
            batch.set(objectiveDocument, od)
        })
        const sectionDocument = doc(db, "section", section.sectionID);
        batch.set(sectionDocument, {
            sectionID: section.sectionID,
            title: section.title,
            firstPageInPDF: section.firstPageInPDF,
            learningObjectiveIDs: arrayUnion(...objectiveDatas.map(od => od.learningObjectiveID))
        });
        batch.commit();
        return objectiveDatas
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function updateLearningObjective(objectiveData: data.LearningObjective) {
    try {
        await setDoc(doc(db, "learningObjective", objectiveData.learningObjectiveID), { 
            learningObjectiveID: objectiveData.learningObjectiveID,
            objective: objectiveData.objective,
            questions: objectiveData.questions
        });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function setQuestion(questionData: data.Question) {
    try {
        await setDoc(doc(db, "question", questionData.questionID), {
            answer: questionData.answer,
            questionID: questionData.questionID,
            question: questionData.question,
            difficultyLevel: questionData.difficultyLevel,
            learningObjectiveID: questionData.learningObjectiveID
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function createSource(sourceData: data.Source) {
    const sourceId = uuidv4();
    try {
        await setDoc(doc(db, "source", sourceId), { 
            sourceID: sourceId,
            chapterIDs: sourceData.chapterIDs
         });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function updateSource(sourceData: data.Source) {
    try {
        await setDoc(doc(db, "source", sourceData.sourceID), { 
            sourceID: sourceData.sourceID,
            chapterIDs: sourceData.chapterIDs
         });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function setUser(userData: data.User) {
    // Use email as unique id
    console.log(userData)
    try {
        // Add user document to the 'user' collection with userType
        await setDoc(doc(db, "user", userData.userID), {
            userID: userData.userID,
            firstname: userData.firstname,
            lastname: userData.lastname,
            birthday: userData.birthday,
            email: userData.email,
            userType: userData.userType
        });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function createSection(sectionData: data.Section) {
    const sectionId = uuidv4(); // Generate a unique ID
    try {
        await setDoc(doc(db, 'section', sectionId), {
            sectionID: sectionId,
            title: sectionData.title,
            firstPageInPDF: sectionData.firstPageInPDF,
            learningObjectiveIDs: sectionData.learningObjectiveIDs
         });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function updateSection(sectionData: data.Section) {
    try {
        await setDoc(doc(db, 'section', sectionData.sectionID), {
            sectionID: sectionData.sectionID,
            title: sectionData.title,
            firstPageInPDF: sectionData.firstPageInPDF,
            learningObjectiveIDs: sectionData.learningObjectiveIDs
         });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function setLearningObjectiveScore(learningObjectiveScoreData: data.LearningObjectiveScore) {
    try {
        await setDoc(doc(db, 'learningObjectiveScore', learningObjectiveScoreData.userID + '-' + learningObjectiveScoreData.learningObjectiveID), { 
            userID: learningObjectiveScoreData.userID,
            scoreNumerator: learningObjectiveScoreData.scoreNumerator,
            scoreDenominator: learningObjectiveScoreData.scoreDenominator,
            learningObjectiveID: learningObjectiveScoreData.learningObjectiveID,
            feedback: learningObjectiveScoreData.feedback
         });
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Delete functions delete a associated with the input

export async function deleteChapter(chapterData: data.Chapter) {
    try {
        await deleteDoc(doc(db, "chapter", chapterData.chapterID));
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

export async function deleteClass(classData: data.Class) {
    try {
        await deleteDoc(doc(db, "class", classData.classID));
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

export async function deleteObjective(objectiveData: data.LearningObjective) {
    try {
        await deleteDoc(doc(db, "learningObjective", objectiveData.learningObjectiveID));
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

export async function deleteQuestion(questionData: data.Question) {
    try {
        await deleteDoc(doc(db, "question", questionData.questionID));
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
}

export async function deleteSource(sourceData: data.Source) {
    try {
        await deleteDoc(doc(db, "source", sourceData.sourceID))
    }
    catch (e) {
        console.error("Error deleting document: ", e);
    }
    try {
        // Add a try block here
    }
    catch (e) {
        // Handle the error here
    }
}

export async function deleteUser(userData: data.User) {
    try {
        await deleteDoc(doc(db, "user", userData.email))
    }
    catch (e) {
        console.error("Error deleting document: ", e);
    }
}

export async function deleteSection(sectionData: data.Section) {
    try {
        await deleteDoc(doc(db, "section", sectionData.sectionID))
    }
    catch (e) {
        console.error("Error deleting document: ", e);
    }
}

export async function deleteLearningObjectiveScore(scoreData: data.LearningObjectiveScore) {
    try {
        await deleteDoc(doc(db, "learningObjectiveScore", scoreData.userID + '-' + scoreData.learningObjectiveID))
    }
    catch (e) {
        console.error("Error deleting document: ", e);
    }
}

// Get functions retrieve the document matching the id and 
// returns data as the corresponding type
export async function getUser(email: string): Promise<data.User> {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'user'), where('email', '==', email)));
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const thisUser: data.User = {
                userID: docSnap.id.trim(),
                firstname: docSnap.get("firstname"),
                lastname: docSnap.get("lastname"),
                email: docSnap.get("email"),
                birthday: docSnap.get("birthday"),
                userType: docSnap.get("userType")
            };

            return thisUser;
        }
    } catch (e) {
        console.error("Error finding user: ", e);
    }
}

export async function getChapter(chapterID: string) {
    try {
        const docRef = doc(db, "chapter", chapterID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const thisChapter: data.Chapter = {
                chapterID: docSnap.get("chapterID"),
                sectionIDs: docSnap.get("sectionIDs"),
                title: docSnap.get("title")
            };

            return thisChapter;
        }
    } catch (e) {
        console.error("Error finding chapter: ", e);
    }
}

export async function getSection(sectionID: string) {
    try {
        const docRef = doc(db, "section", sectionID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const thisSection: data.Section = {
                sectionID: docSnap.get("sectionID"),
                title: docSnap.get("title"),
                firstPageInPDF: docSnap.get("firstPageInPDF"),
                learningObjectiveIDs: docSnap.get("learningObjectiveIDs")
            };

            return thisSection;
        }
    } catch (e) {
        console.error("Error finding chapter: ", e);
    }
}

export async function getClass(classID: string) {
    try {
        const docRef = doc(db, "class", classID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const thisClass: data.Class = {
                classID: docSnap.get("classID"),
                title: docSnap.get("title"),
                sourceID: docSnap.get("sourceID"),
                students: docSnap.get("students"),
                teachers: docSnap.get("teachers")
            }

            return thisClass;
        }
    } catch (e) {
        console.error("Error finding class: ", e);
    }
}

export async function getObjective(learningObjectiveID: string): Promise<data.LearningObjective> {
    const docRef = doc(db, 'learningObjective', learningObjectiveID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            learningObjectiveID: data.learningObjectiveID,
            objective: data.objective,
            questions: data.questions || [] // Initialize questions as an empty array if undefined
        };
    } else {
        throw new Error('Learning objective not found');
    }
}

export async function getQuestionsForSection(sectionID: string) {
    const q = query(collection(db, 'question'), where('sectionID', '==', sectionID));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), questionID: doc.id }));
}

export async function getQuestion(questionID: string) {
    try {
        const docRef = doc(db, "question", questionID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const thisQuestion: data.Question = {
                answer: docSnap.get("answer"),
                questionID: docSnap.get("questionID"),
                question: docSnap.get("question"),
                difficultyLevel: docSnap.get("difficultyLevel"),
                learningObjectiveID: docSnap.get("learningObjectiveID")
            };

            return thisQuestion;
        }
    } catch (e) {
        console.error("Error finding question: ", e);
    }
};

export async function getSource(sourceID: string) {
    try {
        const docRef = doc(db, "source", sourceID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const thisSource: data.Source = {
                sourceID: docSnap.get("sourceID"),
                chapterIDs: docSnap.get("chapterIDs"),
                filepath: docSnap.get("filepath")
            };

            return thisSource;
        }
    }
    catch (e) {
        console.error("Error finding user: ", e);
    }
}


export async function getLearningObjectiveScore(objectiveID: string, userID: string) {
    try {
        const scoreID = userID+'-'+objectiveID
        const docRef = doc(db, "learningObjectiveScore", scoreID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const thisScore: data.LearningObjectiveScore = {
                userID: docSnap.get("userID"),
                scoreNumerator: docSnap.get("scoreNumerator"),
                scoreDenominator: docSnap.get("scoreDenominator"),
                learningObjectiveID: docSnap.get("learningObjectiveID"),
                feedback: docSnap.get("feedback")
            }
            return thisScore;
        }
    }
    catch (e) {
        console.error("Error finding user: ", e);
    }
}