import * as data from "../../models/firebase-types.js";
import { getObjectiveScore, getChapterScore, getSectionScore } from "./score.js";
import { getChapter, getClass, getSource, getSection, getObjective } from "../../firebase/index.js";
import { getTeacherFeedback } from "./teacherFeedback.js";

// This API gets the aggregate class score across chapters, sections, and learning objectives

export async function getClassObjectiveAverage(objectiveID: string, classID: string) {
    const classData: data.Class = await getClass(classID);
    const studentIDs: string[] = classData.students;

    let totalScore: number = 0
    let studentCount: number = 0 // Only counting students who have attempted the objective

    for (let studentID of studentIDs) {
        const studentScore: number | null = await getObjectiveScore(objectiveID, studentID);
        if (studentScore!=null) {
            totalScore += studentScore;
            studentCount += 1
        }
    }

    if (studentCount==0) {
        return 0; // we want the chart to show 0 if non of the students have attempted
    }
    else {
        return totalScore/studentCount;
    }
}

export async function getClassSectionAverage(sectionID: string, classID: string) {
    const classData: data.Class = await getClass(classID);
    const studentIDs: string[] = classData.students;

    let totalScore: number = 0
    let studentCount: number = 0 // Only counting students who have attempted the section

    for (let studentID of studentIDs) {
        const studentScore: number | null = await getSectionScore(sectionID, studentID);
        if (studentScore!=null) {
            totalScore += studentScore;
            studentCount += 1
        }
    }

    if (studentCount==0) {
        return 0; // we want the chart to show 0 if none of the students have attempted
    }
    else {
        return totalScore/studentCount;
    }
}

export async function getClassChapterAverage(chapterID: string, classID: string) {
    const classData: data.Class = await getClass(classID);
    const studentIDs: string[] = classData.students;

    let totalScore: number = 0
    let studentCount: number = 0 // Only counting students who have attempted the chapter

    for (let studentID of studentIDs) {
        const studentScore: number | null = await getChapterScore(chapterID, studentID);
        if (studentScore!=null) {
            totalScore += studentScore;
            studentCount += 1
        }
    }

    if (studentCount==0) {
        return 0; // we want the chart to show 0 if none of the students have attempted
    }
    else {
        console.log((totalScore/studentCount))
        return totalScore/studentCount;
    }
}

interface SectionData {
    title: string;
    labels: string[];
    data: number[];
    level: string;
  }

interface LearningObjectiveData {
    title: string;
    labels: string[];
    data: number[];
    feedback: {
        [objective: string]: string;
    };
    level: string;
}


export async function getClassData(classID: string) {
    const classData: data.Class = await getClass(classID);
    const sourceData: data.Source = await getSource(classData.sourceID);

    let chapterLabels: string[] = [];
    let chapterScores: number[] = [];

    const sectionScoreData: { [chapter: string]: SectionData } = {};
    const objectiveScoreData: { [section: string]: LearningObjectiveData} = {};

    for (let chapterID of sourceData.chapterIDs) {
        const chapterScore: number = await getClassChapterAverage(chapterID, classID);
        if (chapterScore!=0) {
            const chapterData: data.Chapter = await getChapter(chapterID);
            const chapterTitle = chapterData.title
            chapterLabels.push(chapterTitle);
            chapterScores.push(chapterScore);

            let sectionLabels: string[] = [];
            let sectionScores: number[] = [];
            for (let sectionID of chapterData.sectionIDs) {
                const sectionScore: number = await getClassSectionAverage(sectionID, classID);
                if (sectionScore!=0) {
                    const sectionData: data.Section = await getSection(sectionID);
                    const sectionTitle = sectionData.title;
                    sectionLabels.push(sectionTitle);
                    sectionScores.push(sectionScore);

                    let objectiveLabels: string[] = [];
                    let objectiveScores: number[] = [];
                    let objectiveFeedback: {
                        [objective: string]: string;
                    } = {};
                    for (let objectiveID of sectionData.learningObjectiveIDs) {
                        const objectiveScore: number = await getClassObjectiveAverage(objectiveID, classID);
                        if (objectiveScore!=0) {
                            const objectiveData: data.LearningObjective = await getObjective(objectiveID);
                            objectiveLabels.push(objectiveData.objective);
                            objectiveScores.push(objectiveScore);
                            objectiveFeedback[objectiveData.objective] = await getTeacherFeedback(objectiveID);
                        }
                    }
                    objectiveScoreData[sectionTitle] = {
                        title: sectionTitle,
                        labels: objectiveLabels,
                        data: objectiveScores,
                        feedback: objectiveFeedback,
                        level: 'learningObjective',
                    }
                }
            }

            sectionScoreData[chapterTitle] = {
                title: `${chapterTitle} Scores`,
                labels: sectionLabels,
                data: sectionScores,
                level: 'section',
              };
            }
        }

    const chapterScoreData = {
        title: 'Class Scores',
        labels: chapterLabels,
        data: chapterScores,
        level: 'chapter'
    };

    return { objectiveScoreData, sectionScoreData, chapterScoreData };
}

