// This about these as a layer of types that the front end and 
// back end use to talk to one another separately from the Firebase.
// They do not need to match the firebase types, and you can see 
// are a little more complex. 

import { ContentPiece } from "../services/bookProcessorService"
import { Chapter, Question, Section } from "./firebase-types"

// Think of this as a type different from the backend types, that is specifically 
// for communication between the front end and backend.

type UserType = 'teacher' | 'student'

export type Class = {
    classID: string,
    title: string,
    sourceID: string,
    students: string[],
    teachers: string[]
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

export type LearningObjective = {
    learningObjectiveID: string,
    objective: string,
    questions: string[]
}

export interface CreateClassInput {
    title: string,
    sourceID: string,
    creatorID: string,
    contents: ContentPiece[],
    filepath: string
}
  
export interface CreateClassOutput   {
    class: Class;
}

export interface ListClassesInput {
    userID: string
}
  
export interface ListClassesOutput   {
    classes: string[];
}

export interface GetClassInput {
    classID: string
}

export interface GetUserByEmailInput {
    email: string
}
  
export interface GetUserByEmailOutput {
    user: User;
}

export interface StartProcessingOutput {
    status: string
    sourceID: string
}

export interface CheckProcessingStatusInput {
    sourceID: string
}
  
export interface CheckProcessingStatusOutput {
    status: string;
    contents: ContentPiece[];
}

export interface ChapterSection {
    chapterId: string,
    sections: Section[]
}

export interface GetChaptersAndSectionsInput {
    classID: string
}
  
export interface GetChaptersAndSectionsOutput {
    chapters: Chapter[],
    sections: ChapterSection[]
}

export interface GetLearningObjectivesInput {
    sectionId: string
}

export interface GetLearningObjectivesInput {
    learningObjectives: LearningObjective[]
}


export interface GenerateProblemsInput {
    sourceID: string, 
    sectionID: string, 
    numberOfEasy: number, 
    numberOfMedium: number, 
    numberOfHard: number
}

export interface GenerateProblemsOutput {
    learningObjectives: LearningObjective[]
}

export interface SectionQuestion {
    sectionID: string,
    question: Question
}

export interface GetProblemsInput {
    sectionID: string, 
}

export interface GetProblemsOutput {
    sectionID: string,
    problems: Question[]
}
