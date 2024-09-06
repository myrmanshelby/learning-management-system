
// Think of this as a type different from the backend types, that is specifically 
// for communication between the front end and backend.
export type Class = {
    classID: string,
    title: string,
    sourceID: string,
    students: string[],
    teachers: string[]
}
