import * as data from '../../models/firebase-types';
import { createQuestionPair } from "./session.js";
import { getObjective, getQuestion, deleteQuestion, updateLearningObjective, getSection, setQuestion, createLearningObjectives, getSource } from "../../firebase/index.js";
import { v4 as uuidv4 } from 'uuid';
import { getLearningObjectives } from '../../services/bookProcessorService.js';

export async function createProblemSet(sourceId: string, section: data.Section, numberOfEasy: number, numberOfMedium: number, numberOfHard: number) {
    const sectionData: data.Section = await getSection(section.sectionID);
    let objectiveIDs: string[] = sectionData.learningObjectiveIDs;

    console.log(`Received ${objectiveIDs.length} objectiveIDs`)
    if (objectiveIDs.length < 1) {
        console.log(`Detected learning objectives still need to be generated.`)

        const source = await getSource(sourceId)

        const learningObjectivesResponse = await getLearningObjectives({
            filepath: source.filepath,
            page: parseInt(section.firstPageInPDF)
        })

        console.log(`Saving learning objectives.`)
        const learningObjectives: data.LearningObjective[] = learningObjectivesResponse.objectives.map(objectiveString => {
            return {
                learningObjectiveID: uuidv4(),
                objective: objectiveString,
                questions: []
            }
        })

        const savedObjectives = await createLearningObjectives(section, learningObjectives)
        savedObjectives.forEach(obj => {
            objectiveIDs.push(obj.learningObjectiveID)
        })
    }

    console.log(`Generating problems...`)
    for (let i = 0; i < numberOfEasy; i++) {
        const index = Math.floor(Math.random() * objectiveIDs.length);
        console.log(objectiveIDs[index]);
        await addProblemData(objectiveIDs[index], "easy");
    }

    for (let i = 0; i < numberOfMedium; i++) {
        const index = Math.floor(Math.random() * objectiveIDs.length);
        await addProblemData(objectiveIDs[index], "medium");
    }

    for (let i = 0; i < numberOfHard; i++) {
        const index = Math.floor(Math.random() * objectiveIDs.length);
        await addProblemData(objectiveIDs[index], "hard");
    }
}

const difficultyNum = {
    "easy": 1,
    "medium": 2,
    "hard": 3
}

export async function addProblemData(learningObjectiveID: string, difficultyLevel: string) {
    const currentObjective: data.LearningObjective = await getObjective(learningObjectiveID);
    const questionPair = await createQuestionPair(currentObjective.objective, difficultyLevel);
    const questionID = uuidv4();

    const currentQuestion: data.Question = {
        answer: questionPair[1],
        questionID: questionID,
        question: questionPair[0],
        difficultyLevel: difficultyNum[difficultyLevel],
        learningObjectiveID: learningObjectiveID
    }

    const updatedObjective: data.LearningObjective = {
        learningObjectiveID: learningObjectiveID,
        objective: currentObjective.objective,
        questions: [...currentObjective.questions, questionID]
    }

    await updateLearningObjective(updatedObjective);
    await setQuestion(currentQuestion);
}

export async function overwriteQuestion(questionID: string, learningObjectiveID: string, newQuestion: string, newAnswer: string, newDifficulty: number) {
    // Get the current question
    const currentQuestion: data.Question = await getQuestion(questionID);

    // Delete the old question
    await deleteQuestion(currentQuestion);

    // Create the updated question object
    const reQuestion: data.Question = {
        answer: newAnswer,
        questionID: questionID,
        question: newQuestion,
        difficultyLevel: newDifficulty,
        learningObjectiveID: learningObjectiveID
    }

    // Save the updated question
    await setQuestion(reQuestion);
}