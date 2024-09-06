import { Request, Response } from "express";
import dotenv from 'dotenv';
import { Content, GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config()

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in the environment variables');
}

const configuration = new GoogleGenerativeAI(apiKey);

// Initializing model
const modelId = 'gemini-1.5-flash';
const model = configuration.getGenerativeModel({ model: modelId });

// Storing conversation history
const conversationContext: string[][] = [];
const currentMessages: Content[] = [];

// Handles chat conversation
export const generateResponse = async (prompt: string) => {
  console.log('Prompt: ', prompt); // For testing purposes

  // Restore the previous context
  for (const [inputText, responseText] of conversationContext) {
    currentMessages.push({ role: "user", parts: [{ text: inputText }] });
    currentMessages.push({ role: "model", parts: [{ text: responseText }] });
  }

  const chat = model.startChat({
    history: currentMessages,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const responseText = response.text();

  // Stores the conversation
  conversationContext.push([prompt, responseText]);
  console.log('Response: ', responseText); // For testing purposes
  return responseText;
};
