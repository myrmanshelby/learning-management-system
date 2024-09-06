import * as data from "../../models/firebase-types.js";
import { getQuestion, getClass, getObjective, getSource, getLearningObjectiveScore, setLearningObjectiveScore, getSection, getChapter } from "../../firebase/index.js";


// Need to take in score from learning objective and update LO score, which updates Ch score, which updates Sect score
export async function updateLearningObjectiveScore(questionID: string, objectiveID: string, feedback: string[], rawQuestionScore: number, userID: string) {
    const questionData: data.Question = await getQuestion(questionID);
    const scoreData: data.LearningObjectiveScore | null = await getLearningObjectiveScore(objectiveID, userID);

    if (scoreData==null) {
        const newScore: data.LearningObjectiveScore = {
            userID: userID, 
            scoreNumerator: questionData.difficultyLevel * rawQuestionScore/10,
            scoreDenominator: questionData.difficultyLevel,
            learningObjectiveID: objectiveID,
            feedback: feedback
        }

        await setLearningObjectiveScore(newScore);
    }
    else {
        console.log(scoreData)
        const newScore: data.LearningObjectiveScore = {
            userID: userID, 
            scoreNumerator: scoreData.scoreNumerator + questionData.difficultyLevel * rawQuestionScore/10,
            scoreDenominator: scoreData.scoreDenominator + questionData.difficultyLevel,
            learningObjectiveID: objectiveID,
            feedback: [...scoreData.feedback, ...feedback]
        }

        await setLearningObjectiveScore(newScore);
    }
}

// Returns the actual value of the objective score
export async function getObjectiveScore(objectiveID: string, userID: string){
    const scoreData: data.LearningObjectiveScore | null = await getLearningObjectiveScore(objectiveID, userID);
    if (scoreData==null) {
        // null if the user has not attempted any questions from the learning objective
        return null;
    } else {
        return scoreData.scoreNumerator/scoreData.scoreDenominator;
    }
}

export async function getSectionScore(sectionID: string, userID: string) {
    const sectionData: data.Section = await getSection(sectionID);
    let score = 0;
    let objectiveCount = 0 // Only looking at attempted objectives
    for (let objectiveID of sectionData.learningObjectiveIDs) {
        const objectiveScore: number | null = await getObjectiveScore(objectiveID, userID);
        if (objectiveScore!=null) {
            objectiveCount+=1;
            score+=objectiveScore;
        }
    }
    if (objectiveCount>0){
        return score/objectiveCount; // Score only counts learning objectives in which the user has attempted at least one problem
    } else {
        return null; // The user has not completed any questions for any learning objectives in this section
    }
}

export async function getChapterScore(chapterID: string, userID: string) {
    const chapterData: data.Chapter = await getChapter(chapterID);
    let score = 0;
    let sectionCount = 0; // Only looking at attempted sections
    for (let sectionID of chapterData.sectionIDs) {
        const sectionScore: number | null = await getSectionScore(sectionID, userID);
        if (sectionScore!=null) {
            sectionCount+=1;
            score+=sectionScore;
        }
    }
    if (sectionCount>0){
        return score/sectionCount; // Score only counts sections in which the user has attempted at least one problem 
    } else {
        return null; // The user has not completed any questions for any sections in this chapter
    }
}

// gets student score list in the format
/*
[
    {
        name: 'Chapter name',
        score: 'Chapter score',
        sections: [
            {
                name: 'Section name',
                score: 'Section score',
                objectives: [ {name: 'Objective name', score: 'Objective Score'}]
            }
        ]
    }
]
*/ 
export async function getScoreList(classID: string, userID: string) {
    const classData: data.Class = await getClass(classID);
    const sourceData: data.Source = await getSource(classData.sourceID);

    let scoreList = [];

    console.log(sourceData)
    for (let chapterID of sourceData.chapterIDs) {
        const chapterScore: number | null = await getChapterScore(chapterID, userID);
        if (chapterScore !== null) {
            const chapterData: data.Chapter = await getChapter(chapterID);
            console.log(chapterData);

            let sections = [];
            for (let sectionID of chapterData.sectionIDs) {
                const sectionScore: number | null = await getSectionScore(sectionID, userID);
                if (sectionScore !== null) {
                    const sectionData: data.Section = await getSection(sectionID);
                    console.log(sectionData);

                    let objectives = [];
                    for (let objectiveID of sectionData.learningObjectiveIDs) {
                        const objectiveScore: number | null = await getObjectiveScore(objectiveID, userID);
                        console.log(objectiveScore);

                        if (objectiveScore !== null) {
                            const objectiveData: data.LearningObjective = await getObjective(objectiveID);
                            console.log(objectiveData)
                            objectives.push({
                                name: objectiveData.objective,
                                score: objectiveScore
                            });
                        }
                    }
                    console.log(objectives);

                    sections.push({
                        name: sectionData.title,
                        score: sectionScore,
                        objectives: objectives
                    });
                }
            }

            scoreList.push({
                name: chapterData.title,
                score: chapterScore,
                sections: sections
            });
        }
    }

    return scoreList;
}


// gets the student score for the entirety of the work they have done so far
export async function getTotalScore(classID: string, userID: string) {
    console.log(classID);
    const classData: data.Class = await getClass(classID);
    console.log(classData);
    const sourceData: data.Source = await getSource(classData.sourceID)

    let score = 0;
    let chapterCount = 0;

    for (let chapterID of sourceData.chapterIDs) {
        const chapterScore: number | null = await getChapterScore(chapterID, userID);
        if (chapterScore!=null) {
            chapterCount+=1;
            score+=chapterScore;
        }
    }
    if (chapterCount>0){
        return score/chapterCount; // Score only counts sections in which the user has attempted at least one problem 
    } else {
        return null; // The user has not completed any questions for any sections in this chapter
    }
}