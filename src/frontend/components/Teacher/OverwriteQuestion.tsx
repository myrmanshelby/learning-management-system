import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';

interface Question {
    questionID: string;
    learningObjectiveID?: string;
    question: string;
    answer: string;
    difficultyLevel: string;
}

const OverwriteQuestion: React.FC = () => {
    const { questionID } = useParams<{ questionID: string }>(); // Get questionID from route params
    const [questionData, setQuestionData] = useState<Question | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [newQuestion, setNewQuestion] = useState<string>('');
    const [newAnswer, setNewAnswer] = useState<string>('');
    const [newDifficulty, setNewDifficulty] = useState<string>('medium');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await fetch(`/api/get-question/${questionID}`);
                const data = await response.json();
                setQuestionData(data);
                setNewQuestion(data.question);
                setNewAnswer(data.answer);
                setNewDifficulty(data.difficultyLevel || 'medium');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching question:', error);
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [questionID]);

    const handleSave = async () => {
        if (!newDifficulty) {
            alert('Difficulty level is required.');
            return;
        }
        
        setIsSaving(true);
        try {
            const response = await fetch('/api/overwrite-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionID,
                    learningObjectiveID: questionData?.learningObjectiveID,
                    newQuestion,
                    newAnswer,
                    newDifficulty,
                }),
            });

            if (response.ok) {
                alert('Question updated successfully!');
                setQuestionData({
                    ...questionData,
                    question: newQuestion,
                    answer: newAnswer,
                    difficultyLevel: newDifficulty,
                } as Question);
            } else {
                alert('Failed to update question.');
            }
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Error saving question.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (!questionData) {
        return <Typography variant="h6">Question not found.</Typography>;
    }

    return (
        <Box mt={4}>
            <Typography variant="h4" mb={2}>Edit Question</Typography>
            <TextField
                label="Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Answer"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Difficulty"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                fullWidth
                margin="normal"
                select
                SelectProps={{ native: true }}
            >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </TextField>
            <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isSaving}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </Button>
        </Box>
    );
};

export default OverwriteQuestion;