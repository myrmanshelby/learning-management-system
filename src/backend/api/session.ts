import { Session } from '../../models/session'
import { generateResponse } from "../../gemini/gemini.js";
import express, { RequestHandler } from 'express';
import { getQuestion } from '../../firebase/index.js';
import { updateLearningObjectiveScore } from './score.js';
import { update } from 'lodash';

export const createQuestionPair: (value1: string, value2: string) => Promise<[string, string]> = async (learningObjective, difficultyLevel) => {
    let pair = await generateResponse(`Can you generate a question 
    and answer pair to test that a student has met the learning objective 
    \"${learningObjective}\" The question should have a ${difficultyLevel} difficulty level.
    The question must have the correct answer, and the answer must be one word or number.  
    Please place the question on the first line and the answer on the second line.`);
    let question = pair.substring(0,pair.indexOf('\n')).trim();
    let answer = pair.substring(pair.indexOf('\n'),pair.length).trim();
    return [question, answer];
};

const determineInputType = async (input: string, question: string): Promise<string> => {
    const prompt = `Determine if the following input from the student is a question asking for guidance or an answer to the question "${question}": "${input}". Respond with "guidance" or "answer".`;
    const response = await generateResponse(prompt);
    return response.trim().toLowerCase();
};

const handleGuidanceRequest = async (question: string): Promise<string> => {
    const prompt = `Generate a response to help the student with the following question based on the learning objective: ${question}. Do not provide the answer. Instead, guide the student on how to arrive at the correct answer without directly stating it.`;
    const response = await generateResponse(prompt);
    return response;
};

const handleAnswerEvaluation = async (input: string, correctAnswer: string): Promise<{ response: string, correct: boolean }> => {
    const isCorrect = input.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isCorrect) {
        return { response: 'Correct!', correct: true };
    }

    const prompt = `The student's answer is: "${input}". The correct answer is: "${correctAnswer}". Determine if the student's answer is correct and provide feedback. Be flexible with minor variations in wording. If the answer is incorrect, do not provide the correct answer. Instead, guide the student on how to arrive at the correct answer without directly stating it. Use plain text and avoid formatting.`;
    const feedbackResponse = await generateResponse(prompt);

    return { response: feedbackResponse, correct: false };
};

// Add objectiveID and userID to parameters after testing
const handleSummary = async (conversation: any, questionID: string, objectiveID: string, userID: string): Promise<string> => {
    const objective: string = "Review the set of real numbers"
  const prompt = `Here is a conversation between a student and a tutor:
${conversation.map(({ role, text }) => `${role === 'user' ? 'Student' : 'Tutor'}: ${text}`).join('\n')}
On the first line, give a score from 1-10 representing the student's understanding of the objective, ${objective}. For example, if the student got the right answer on the first try, their score would be a 10. If the student eventually reached the correct answer, their score should be at least a 5. 
On the next lines, write up to 3 lines summarizing what the student struggled with and could use more attention in teaching the objective. Use plain text and avoid formatting. Put each point on an individual line. If the student did not struggle, your response should only be one line with their score.`;

  try {
    const summaryResponse = await generateResponse(prompt);
    const [firstLine, ...feedbackLines] = summaryResponse.trim().split('\n').filter(line => line.trim() !== '');

    // Extract the rawScore from the first line
    const rawScoreMatch = firstLine.match(/(\d+)/);
    const rawScore = rawScoreMatch ? parseInt(rawScoreMatch[0], 10) : 0;

    updateLearningObjectiveScore(questionID, objectiveID, feedbackLines, rawScore, userID)
    return summaryResponse.trim() ? summaryResponse : '';
  } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
  }
};

export const handleInput: RequestHandler = async (req, res, next) => {
  const { input, questionID, objectiveID, userID, conversation } = req.body;

  try {
      const matchingQA = await getQuestion(questionID);

      if (!matchingQA) {
          return res.status(400).json({ response: 'Could not find the correct question for the provided input.' });
      }

      const { question, answer } = matchingQA;
      console.log('Matching QA:', matchingQA);

      const inputType = await determineInputType(input, question);

      if (inputType === 'guidance') {
          const guidanceResponse = await handleGuidanceRequest(question);
          console.log('Guidance Response:', guidanceResponse);
          return res.json({ response: guidanceResponse, correct: false });
      }

      if (inputType === 'answer') {
          const { response, correct } = await handleAnswerEvaluation(input, answer);
          console.log('Answer Evaluation:', { response, correct });

          if (correct) {
              const summaryResponse = await handleSummary(conversation, questionID, objectiveID, userID);
              console.log('Summary Response:', summaryResponse);

              const responseObject = { response, correct, summary: summaryResponse };
              console.log('Response Object:', responseObject);
              return res.json(responseObject);
          } else {
              return res.json({ response, correct });
          }
      }

      return res.status(400).json({ response: 'Could not determine the type of input.' });

  } catch (error) {
      console.error('Error handling input:', error);
      return res.status(500).json({ response: 'Internal Server Error' });
  }
};

const router = express.Router();

router.post('/handle-input', handleInput);

export default router;
