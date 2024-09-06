type UserType = 'teacher' | 'student'

export type Chapter = {
    chapterID: string,
    sectionIDs: string[],
    title: string
}

export type Section = {
    sectionID: string,
    title: string,
    firstPageInPDF: string,
    learningObjectiveIDs: string[]
}

export type User = {
    userID: string,
    firstname: string,
    lastname: string,
    birthday: string,
    email: string,
    phone?: string,
    userType: UserType
}

export type Class = {
    classID: string,
    title: string,
    sourceID: string,
    students: string[],
    teachers: string[]
}

export type LearningObjective = {
    learningObjectiveID: string,
    objective: string,
    questions: string[]
}

export type Question = {
    answer: string,
    questionID: string,
    question: string,
    difficultyLevel: number,
    learningObjectiveID: string
}

export type Source = {
    sourceID: string,
    filepath: string,
    chapterIDs: string[]
}

export type LearningObjectiveScore = {
    userID: string,
    scoreNumerator: number,
    scoreDenominator: number,
    learningObjectiveID: string,
    feedback: string[]
}

export interface Conversation {
    role: 'user' | 'model'; // Ensure this is a union type
    text: string;
}