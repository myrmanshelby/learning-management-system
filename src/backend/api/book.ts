import { Request, RequestHandler, Response } from "express";
import { startProcessingTableOfContents as startProccessingTableOfContents, ProcessTableOfContentsRequest, getTableOfContentsProcessingStatus, GetLearningObjectivesRequest, getLearningObjectives } from '../../services/bookProcessorService.js'
import { getObjective, getQuestion, getSection, getSource, uuidv4 } from "../../firebase/index.js";
import * as problemSetCreator from "../api/problemSetCreator.js"
import { z } from 'zod'
import { GetProblemsOutput } from "../../models/frontend-models.js";
import { Question } from "../../models/firebase-types.js";

export const startProcessingBook: RequestHandler = async (req: Request, res: Response) => {
    try {

      const fileName = req.file.filename; 
      console.log(`File '${fileName}' uploaded successfully`)

      const sourceID = uuidv4()
      console.log(`Assigning SourceId = ${sourceID}`)

      // trigger the python service, to process the book 
      const input: ProcessTableOfContentsRequest = {
        sourceID: sourceID,
        fileName: fileName,
      }

      console.log(`Starting processing for ${sourceID}`)
      
      // fetch the table of contents from the python service 
      const result = await startProccessingTableOfContents(input)
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error uploading file' });
    }
};

const checkProcessingStatusSchema = z.object({
  sourceID: z.string().uuid() // requires the input to be a valid UUID
});

export const checkProcessingStatus: RequestHandler = async (req: Request, res: Response) => {
  try {
    const parsedBody = checkProcessingStatusSchema.parse(req.body);
    const { sourceID } = parsedBody

    const result = await getTableOfContentsProcessingStatus(sourceID)
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
    } else {
        console.error(error);
        res.status(500).json({ error: 'Error checking processing status' });
    }
}
};

const getLearningObjectiveSchema = z.object({
  sourceID: z.string().uuid(), // requires the input to be a valid UUID
  page: z.number() // requires the input to be a valid UUID
});

export const getLearningObjective: RequestHandler = async (req: Request, res: Response) => {
  try {
    const parsedBody = getLearningObjectiveSchema.parse(req.body);
    const { sourceID, page } = parsedBody

    const source = await getSource(sourceID)
    const objectiveRequest: GetLearningObjectivesRequest = {
      filepath: source.filepath,
      page: page
    }

    const result = await getLearningObjectives(objectiveRequest)
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
    } else {
        console.error(error);
        res.status(500).json({ error: 'Error checking processing status' });
    }
  }
}; 

const createProblemSetSchema = z.object({
  sourceID: z.string().uuid(), 
  sectionID: z.string().uuid(), 
  numberOfEasy: z.number(), 
  numberOfMedium: z.number(), 
  numberOfHard: z.number() 
});

export const createProblemSet: RequestHandler = async (req: Request, res: Response) => {
  const parsedBody = createProblemSetSchema.parse(req.body);
  const { sourceID, sectionID, numberOfEasy, numberOfMedium, numberOfHard } = parsedBody;

  try {
      const section = await getSection(sectionID)
      await problemSetCreator.createProblemSet(sourceID, section, numberOfEasy, numberOfMedium, numberOfHard);
      res.status(200).send('Problem set created successfully.');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Error checking processing status' });
      }
    }
}; 

const getProblemSetSchema = z.object({
  sectionID: z.string().uuid(), 
});

export const getProblemSet: RequestHandler = async (req: Request, res: Response) => {
  try {
      const parsedBody = getProblemSetSchema.parse(req.body);
      const { sectionID } = parsedBody;

      const section = await getSection(sectionID)
      const learningObjectiveIds = section.learningObjectiveIDs
      const learningObjectivesPromises = learningObjectiveIds.map(lid => {
        return getObjective(lid)
      })
      const learningObjectives = await Promise.all(learningObjectivesPromises)
      const sectionProblems: Promise<Question[]>[] = learningObjectives.map(async li => {
        const questionPromises = li.questions.map(async q => await getQuestion(q))
        return await Promise.all(questionPromises)
      })

      const problems = (await Promise.all(sectionProblems))
        .reduce((accumulator, value) => accumulator.concat(value), []);

      console.log("Marker B")

      const response: GetProblemsOutput = {
        sectionID: section.sectionID,
        problems: problems
      }

      console.log("Marker C")
      console.log(response)
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Error checking processing status' });
      }
    }
}; 