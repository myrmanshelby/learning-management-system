import React from 'react';

interface FeedbackDisplayProps {
    question: string;
    feedback: string[];
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ question, feedback }) => (
    <div className="summary-container">
        <h2>Feedback for "{question}"</h2>
        <ul>
            {feedback.map((point, index) => (
                <li key={index}>{point}</li>
            ))}
        </ul>
    </div>
);

export default FeedbackDisplay;