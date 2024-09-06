import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatDisplay.css';

interface ChatDisplayProps {
  conversation: { role: string, text: string }[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ conversation }) => {
  return (
    <div className="chat-messages">
      {conversation.map((entry, index) => (
        <div key={index} className={`chat-message ${entry.role}`}>
          <ReactMarkdown>{entry.text}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
};

export default ChatDisplay;
