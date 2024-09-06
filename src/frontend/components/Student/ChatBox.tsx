import React from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { Question, Conversation } from '../../../models/firebase-types';

interface ChatBoxProps {
    headerText: string;
    conversations: { [key: string]: Conversation[] };
    selectedQuestion: Question | null;
    inputValue: string;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleInputSubmit: () => void;
    questionFeedback: { [key: string]: string[] };
}

const ChatBox: React.FC<ChatBoxProps> = ({
    headerText,
    conversations,
    selectedQuestion,
    inputValue,
    handleInputChange,
    handleInputSubmit,
    questionFeedback,
}) => {
    return (
        <Box className="chat-container">
            <Typography variant="h5" className="chat-header">{headerText}</Typography>
            <Box className="chat-display">
                {(conversations[selectedQuestion?.question || ''] || []).map((message, index) => (
                    <Typography key={index} className={`chat-message ${message.role}`}>{message.text}</Typography>
                ))}
            </Box>
            <TextField
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your answer here..."
                fullWidth
                multiline
                rows={4}
                variant="outlined"
            />
            <Button onClick={handleInputSubmit} variant="contained" color="primary">
                Submit
            </Button>
            {selectedQuestion && questionFeedback[selectedQuestion.question]?.length > 0 && (
                <Box className="summary-container">
                    <Typography variant="h6">Feedback for "{selectedQuestion.question}"</Typography>
                    <ul>
                        {questionFeedback[selectedQuestion.question].map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </Box>
            )}
        </Box>
    );
};

export default ChatBox;