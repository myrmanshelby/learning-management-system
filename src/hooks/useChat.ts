import { useState, useEffect } from 'react';
import { handleChatInput } from '../services/chatService';
import { fetchConversationFromFirebase, saveConversationToFirebase } from '../services/firebaseService';
import { Question, Conversation } from '../models/firebase-types';

export const useChat = (
    selectedSection: string | null,
    selectedObjectiveID: string | null,
    currentUser: string | null,
    selectedQuestion: Question | null,
    currentQuestions: Question[]
) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [conversations, setConversations] = useState<{ [key: string]: Conversation[] }>({});
    const [isAskingQuestion, setIsAskingQuestion] = useState<boolean>(false);
    const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState<string[]>([]);
    const [objectiveProgress, setObjectiveProgress] = useState<{ [key: string]: { correct: number, total: number } }>({});
    const [questionFeedback, setQuestionFeedback] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const fetchConversation = async () => {
            if (currentUser && selectedQuestion) {
                const fetchedConversation = await fetchConversationFromFirebase(currentUser, selectedQuestion.questionID);
                if (fetchedConversation) {
                    setConversations(prev => ({
                        ...prev,
                        [selectedQuestion.question || '']: fetchedConversation.conversation,
                    }));
                    // Handle correctness flag if needed
                    if (fetchedConversation.isCorrect) {
                        // You can update UI or state here to reflect that the answer was correct
                    }
                } else {
                    setConversations(prev => ({
                        ...prev,
                        [selectedQuestion.question || '']: [],
                    }));
                }
            }
        };

        if (selectedQuestion) {
            fetchConversation();
        }
    }, [selectedQuestion, currentUser]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputValue(event.target.value);
    };

    const handleInputSubmit = async (): Promise<void> => {
        if (inputValue.trim() === '') return;
    
        const updatedConversation: Conversation[] = [
            ...(conversations[selectedQuestion?.question || ''] || []),
            { role: 'user', text: inputValue } as Conversation,
        ];
    
        setConversations(prev => ({
            ...prev,
            [selectedQuestion?.question || '']: updatedConversation,
        }));
    
        setInputValue('');
    
        try {
            const data = await handleChatInput(inputValue, selectedObjectiveID, currentUser, selectedQuestion, isAskingQuestion, updatedConversation);
    
            const modelResponse = data['response'];
            const isCorrect = data.correct;
    
            const conversationWithModelResponse: Conversation[] = [
                ...updatedConversation,
                { role: 'model', text: modelResponse } as Conversation,
            ];
    
            setConversations(prev => ({
                ...prev,
                [selectedQuestion?.question || '']: conversationWithModelResponse,
            }));
    
            // Save conversation to Firebase with the correct flag
            if (currentUser && selectedQuestion) {
                await saveConversationToFirebase(currentUser, selectedQuestion.questionID, conversationWithModelResponse, isCorrect);
            }
    
            // Update correctlyAnsweredQuestions state if the answer was correct
            if (isCorrect) {
                setCorrectlyAnsweredQuestions(prev => {
                    const updated = [...prev, selectedQuestion!.questionID];
                    console.log("Updated correctlyAnsweredQuestions:", updated);
                    return updated;
                });
            }
    
        } catch (error) {
            console.error('Network error:', error);
        }
    
        setIsAskingQuestion(false);
    };    

    return {
        inputValue,
        conversations,
        correctlyAnsweredQuestions,
        objectiveProgress,
        questionFeedback,
        handleInputChange,
        handleInputSubmit,
    };
};