import React from 'react';
import { TextField, Button } from '@mui/material';
// import './ChatInput.css';

interface ChatInputProps {
    inputValue: string;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAskQuestion: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputValue, onInputChange, onAskQuestion }) => {
    return (
        <div className="chat-input" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <TextField 
                fullWidth 
                variant="outlined" 
                value={inputValue} 
                onChange={onInputChange} 
                placeholder="Type your question here..."
            />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={onAskQuestion}
            >
                Submit
            </Button>
        </div>
    );    
};

export default ChatInput;