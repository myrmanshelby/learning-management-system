import { Question } from '../models/firebase-types';

interface ChatResponse {
    correct?: boolean;
    response?: string;
    summary?: string;
}

const sanitizeConversation = (conversation: { role: string; text: string }[]): { role: string; text: string }[] => {
    return conversation.map(({ role, text }) => ({ role, text }));
};

export const handleChatInput = async (
    inputValue: string,
    selectedObjectiveID: string | null,
    currentUser: string | null,
    selectedQuestion: Question | null,
    isAskingQuestion: boolean,
    updatedConversation: { role: string; text: string }[]
): Promise<ChatResponse> => {
    if (!selectedQuestion) {
        throw new Error('Selected question is required');
    }

    const sanitizedConversation = sanitizeConversation(updatedConversation);

    const response = await fetch('/api/handle-input', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: inputValue,
            questionID: selectedQuestion.questionID,
            objectiveID: selectedObjectiveID,
            userID: currentUser,
            conversation: sanitizedConversation,
        }),
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error(`Error: ${response.statusText}`);
    }
};