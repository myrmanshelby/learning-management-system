import { Request, RequestHandler, Response } from "express";
import { ChapterSection, GetChaptersAndSectionsOutput, ListClassesOutput } from '../../models/frontend-models'
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClass, getChapter, getClass, getClassesForUser, getSection, getSource } from "../../firebase/index.js";
import { ContentPiece } from "../../services/bookProcessorService";
import { Section } from "../../models/firebase-types";

const contentPieceSchema = z.object({
    name: z.string(),
    numeral: z.string(),
    page: z.number()
  });

const createClassSchema = z.object({
    title: z.string().min(1),
    creatorID: z.string().min(1),
    sourceID: z.string().min(1),
    contents: z.array(contentPieceSchema),
    filepath: z.string()
});

export const createClassHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const parsedBody = createClassSchema.parse(req.body);
        const { title, creatorID, sourceID, contents, filepath } = parsedBody

        const classID = uuidv4();

        createClass(
            creatorID, {
                classID: classID,
                title: title,
                sourceID: sourceID, 
                students: [],
                teachers: [creatorID],
            },
            contents as ContentPiece[],
            filepath,
        )
        res.status(201).json({ message: 'Class created successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error creating class' });
        }
    }
}

const listClassesSchema = z.object({
    userID: z.string().uuid() // requires the input to be a valid UUID
});

export const list_classes_handler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const parsedBody = listClassesSchema.parse(req.body);
        const { userID } = parsedBody

        const classes = await getClassesForUser(userID)
        const result: ListClassesOutput = {
            classes: classes
        }
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error listing classes class' });
        }
    }
};

const getClassSchema = z.object({
    classID: z.string().uuid() // requires the input to be a valid UUID
});

export const getClassesHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const parsedBody = getClassSchema.parse(req.body);
        const { classID } = parsedBody

        const result = await getClass(classID)
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error listing classes class' });
        }
    }
};

const getChaptersAndSectionsSchema = z.object({
    classID: z.string().uuid() 
});



export const getChaptersAndSectionsHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const parsedBody = getChaptersAndSectionsSchema.parse(req.body);
        const { classID } = parsedBody

        const selectedClass = await getClass(classID)
        const source = await getSource(selectedClass.sourceID)
        const chapterPromises = source.chapterIDs.map(async (cid) => {
            return getChapter(cid)
        })
        
        const chapters = await Promise.all(chapterPromises)
        const keyPairPromises: Promise<ChapterSection>[] = chapters.map(async (chapter) => {
            const sectionIds = chapter.sectionIDs
            const sectionPromises = sectionIds.map(async sid => getSection(sid))
            const sections = await Promise.all(sectionPromises)
            return {
                chapterId: chapter.chapterID, 
                sections: sections
            }
        })

        const keyPairs = await Promise.all(keyPairPromises)
        const result: GetChaptersAndSectionsOutput = {
            chapters: chapters,
            sections: keyPairs
        }

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Error listing classes class' });
        }
    }
};