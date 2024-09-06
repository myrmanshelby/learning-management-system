import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Grid, MenuItem, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useParams } from 'react-router-dom';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/index';

interface Question {
    answer: string;
    questionID: string;
    question: string;
    difficultyLevel: number;
    learningObjectiveID: string;
}

const ProblemSet: React.FC = () => {
    const { sectionID } = useParams<{ sectionID: string }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null); // State to track which question is being edited
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError(null); // Reset any previous errors

                const response = await fetch(`/api/sections/${sectionID}/questions`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch questions for section ${sectionID}`);
                }

                const data = await response.json();
                setQuestions(data);
            } catch (error) {
                console.error('Error fetching problem set:', error);
                setError('Failed to load questions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [sectionID]);

    const handleSave = async (index: number) => {
        const question = questions[index];
        const { questionID, question: newQuestion, answer: newAnswer, difficultyLevel: newDifficulty } = question;

        setIsSaving(questionID);
        try {
            const questionRef = doc(db, 'question', questionID);
            
            // Only update specific fields
            await updateDoc(questionRef, {
                question: newQuestion,
                answer: newAnswer,
                difficultyLevel: newDifficulty
            });

            alert('Question updated successfully!');
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Error saving question.');
        } finally {
            setIsSaving(null);
            setExpandedQuestion(null); // Close the edit view after saving
        }
    };

    const handleDelete = async () => {
        if (!questionToDelete) return;

        try {
            const questionRef = doc(db, 'question', questionToDelete);
            await deleteDoc(questionRef);

            setQuestions(prevQuestions => prevQuestions.filter(q => q.questionID !== questionToDelete));
            alert('Question deleted successfully!');
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Error deleting question.');
        } finally {
            setOpenDeleteDialog(false);
            setQuestionToDelete(null);
        }
    };

    const handleOpenDeleteDialog = (questionID: string) => {
        setQuestionToDelete(questionID);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setQuestionToDelete(null);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    if (questions.length === 0) {
        return <Typography variant="h6">No questions found for this section.</Typography>;
    }

    return (
        <Box mt={4}>
            <Typography variant="h4" mb={2}>Problem Set Overview</Typography>
            {questions.map((q, index) => (
                <Accordion 
                    key={q.questionID} 
                    expanded={expandedQuestion === q.questionID} 
                    onChange={() => setExpandedQuestion(expandedQuestion === q.questionID ? null : q.questionID)}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{q.question}</Typography>
                        <Typography variant="body2" color="textSecondary" style={{ marginLeft: 'auto' }}>
                            Difficulty: {['Easy', 'Medium', 'Hard'][q.difficultyLevel - 1]}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {expandedQuestion === q.questionID ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Question"
                                        value={q.question}
                                        onChange={(e) => {
                                            const newQuestion = e.target.value;
                                            setQuestions(prevQuestions => {
                                                const updatedQuestions = [...prevQuestions];
                                                updatedQuestions[index].question = newQuestion;
                                                return updatedQuestions;
                                            });
                                        }}
                                        fullWidth
                                        margin="normal"
                                    />
                                    <TextField
                                        label="Answer"
                                        value={q.answer}
                                        onChange={(e) => {
                                            const newAnswer = e.target.value;
                                            setQuestions(prevQuestions => {
                                                const updatedQuestions = [...prevQuestions];
                                                updatedQuestions[index].answer = newAnswer;
                                                return updatedQuestions;
                                            });
                                        }}
                                        fullWidth
                                        margin="normal"
                                    />
                                    <TextField
                                        label="Difficulty"
                                        value={q.difficultyLevel.toString()}
                                        onChange={(e) => {
                                            const newDifficulty = parseInt(e.target.value, 10);
                                            setQuestions(prevQuestions => {
                                                const updatedQuestions = [...prevQuestions];
                                                updatedQuestions[index].difficultyLevel = newDifficulty;
                                                return updatedQuestions;
                                            });
                                        }}
                                        fullWidth
                                        margin="normal"
                                        select
                                    >
                                        <MenuItem value={1}>Easy</MenuItem>
                                        <MenuItem value={2}>Medium</MenuItem>
                                        <MenuItem value={3}>Hard</MenuItem>
                                    </TextField>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleSave(index)}
                                        disabled={isSaving === q.questionID}
                                    >
                                        {isSaving === q.questionID ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleOpenDeleteDialog(q.questionID)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Delete
                                    </Button>
                                </Grid>
                            </Grid>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() => setExpandedQuestion(q.questionID)}
                            >
                                Edit
                            </Button>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this question? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProblemSet;
