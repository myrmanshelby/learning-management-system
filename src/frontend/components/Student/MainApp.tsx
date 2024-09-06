import React, { useEffect, useState } from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import ChatInput from './ChatInput/ChatInput';
import ChatDisplay from './ChatDisplay/ChatDisplay';
import Sidebar from '../Sidebar/Sidebar';
import ProgressSection from './ProgressSection/ProgressSection';
import FeedbackDisplay from '../FeedbackDisplay';
import { fetchChapters, fetchSectionsForChapter, fetchQuestionsBySection } from '../../../services/firebaseService';
import { Chapter, Section, Question } from '../../../models/firebase-types';
import { useChat } from '../../../hooks/useChat';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface MainAppProps {
    currentUser: string; // Accept the currentUser prop
}

const MainApp: React.FC<MainAppProps> = ({ currentUser }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [headerText, setHeaderText] = useState('Select a chapter to start');
    const [selectedObjectiveID, setSelectedObjectiveID] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [learningObjective, setLearningObjective] = useState<string | null>(null);
    const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState<string[]>([]); // State to track correctly answered questions

    const {
        inputValue,
        conversations,
        questionFeedback,
        handleInputChange,
        handleInputSubmit
    } = useChat(selectedSection?.toString() || '', selectedObjectiveID, currentUser, selectedQuestion, currentQuestions);

    // Fetch chapters on initial load
    useEffect(() => {
        const fetchInitialData = async () => {
            const fetchedChapters = await fetchChapters();
            
            const filteredChapters = await Promise.all(
                fetchedChapters.map(async (chapter) => {
                    const sections = await fetchSectionsForChapter(chapter.chapterID);
                    if (sections.length > 0) {
                        return chapter;
                    }
                    return null;
                })
            );
        
            const availableChapters = filteredChapters.filter(chapter => chapter !== null) as Chapter[];
            setChapters(availableChapters);
        
            if (availableChapters.length > 0) {
                const firstChapterId = availableChapters[0].chapterID;
                setSelectedChapter(firstChapterId);
        
                const fetchedSections = await fetchSectionsForChapter(firstChapterId);
                setSections(fetchedSections);
        
                if (fetchedSections.length > 0) {
                    const firstSectionId = fetchedSections[0].sectionID;
                    setSelectedSection(firstSectionId);
        
                    const questions = await fetchQuestionsBySection(firstSectionId);
                    const filteredQuestions = questions.filter(
                        (q) => q.question && q.answer && q.learningObjectiveID // Ensure valid question, answer, and learning objective
                    );
                    setCurrentQuestions(filteredQuestions);
        
                    if (filteredQuestions.length > 0) {
                        const firstQuestion = filteredQuestions[0];
                        setSelectedQuestion(firstQuestion);
                        setHeaderText(firstQuestion.question);
        
                        const objectiveID = firstQuestion.learningObjectiveID;
                        try {
                            const response = await fetch(`/api/learning-objective/${objectiveID}`);
                            const data = await response.json();
                            setLearningObjective(data.objective || 'Objective not found');
                        } catch (error) {
                            console.error('Error fetching learning objective:', error);
                            setLearningObjective('Failed to fetch objective');
                        }
                    }
                }
            }
        };
        
    
        fetchInitialData();
    }, []);

    // Fetch correctly answered questions from Firebase
    useEffect(() => {
        const fetchCorrectlyAnsweredQuestions = async () => {
            if (currentUser) {
                const userQuestionsRef = collection(db, 'conversations', currentUser, 'questions');
                const querySnapshot = await getDocs(userQuestionsRef);
    
                const correctQuestions: string[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.isCorrect) {
                        correctQuestions.push(doc.id); // doc.id is the questionID
                    }
                });
    
                setCorrectlyAnsweredQuestions(correctQuestions);  // Ensure this updates correctly
            }
        };
    
        fetchCorrectlyAnsweredQuestions();
    }, [currentUser]);  // Add currentUser as a dependency to re-fetch data when it changes

    const handleSelectChapter = async (chapterId: string) => {
        setSelectedChapter(chapterId);
        
        // Fetch sections for the selected chapter
        const fetchedSections = await fetchSectionsForChapter(chapterId);
        
        const filteredSections = await Promise.all(
            fetchedSections.map(async (section) => {
                const questions = await fetchQuestionsBySection(section.sectionID);
                if (questions.length > 0) {
                    return section;
                }
                return null;
            })
        );
    
        const availableSections = filteredSections.filter(section => section !== null) as Section[];
        setSections(availableSections);
        
        if (availableSections.length > 0) {
            // Automatically select the first section
            const firstSectionId = availableSections[0].sectionID;
            setSelectedSection(firstSectionId);
        
            // Fetch questions for the first section
            const questions = await fetchQuestionsBySection(firstSectionId);
            setCurrentQuestions(questions);
        
            if (questions.length > 0) {
                // Automatically select the first question
                const firstQuestion = questions[0];
                setSelectedQuestion(firstQuestion);
                setHeaderText(firstQuestion.question);
        
                // Fetch and set the learning objective for the first question
                const objectiveID = firstQuestion.learningObjectiveID;
                try {
                    const response = await fetch(`/api/learning-objective/${objectiveID}`);
                    const data = await response.json();
                    setLearningObjective(data.objective || 'Objective not found');
                } catch (error) {
                    console.error('Error fetching learning objective:', error);
                    setLearningObjective('Failed to fetch objective');
                }
            } else {
                setSelectedQuestion(null);
                setHeaderText('No questions available');
                setLearningObjective(null);
            }
        } else {
            setSelectedSection(null);
            setSelectedQuestion(null);
            setCurrentQuestions([]);
            setHeaderText('No sections available');
            setLearningObjective(null);
        }
    };

    const handleSelectSection = async (sectionId: string) => {
        setSelectedSection(sectionId);
        const questions = await fetchQuestionsBySection(sectionId);
    
        const filteredQuestions = questions.filter(
            (q) => q.question && q.answer && q.learningObjectiveID // Ensure valid question, answer, and learning objective
        );
    
        setCurrentQuestions(filteredQuestions);
        setHeaderText(filteredQuestions.length > 0 ? filteredQuestions[0].question : 'No questions available');
        setSelectedQuestion(filteredQuestions.length > 0 ? filteredQuestions[0] : null);
    };

    const handleSelectQuestion = async (question: Question) => {
        setSelectedQuestion(question);
        setHeaderText(question?.question || 'Ask a question');

        if (question) {
            const objectiveID = question.learningObjectiveID;
            try {
                const response = await fetch(`/api/learning-objective/${objectiveID}`);
                const data = await response.json();
                setLearningObjective(data.objective || 'Objective not found');
            } catch (error) {
                console.error('Error fetching learning objective:', error);
                setLearningObjective('Failed to fetch objective');
            }
        } else {
            setLearningObjective(null);
        }
    };

    useEffect(() => {
        if (selectedQuestion) {
            setSelectedObjectiveID(selectedQuestion.learningObjectiveID || null);
        }
    }, [selectedQuestion]);

    return (
        <Container>
            <Grid container spacing={3}>
             <Grid item xs={3}>
                 <Sidebar
                    key={correctlyAnsweredQuestions.join(',')}  // Force re-render when correctlyAnsweredQuestions updates
                    questions={currentQuestions}
                    chapters={chapters}
                    sections={sections}
                    selectedChapter={selectedChapter}
                    selectedSection={selectedSection}
                    selectedQuestion={selectedQuestion?.question || ''}
                    correctlyAnsweredQuestions={correctlyAnsweredQuestions}
                    onSelectChapter={handleSelectChapter}
                    onSelectSection={handleSelectSection}
                    onSelectQuestion={handleSelectQuestion}
                 />
                </Grid>
                <Grid item xs={9}>
                        <Box mb={3} className="chat-container" style={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}>
                        <Typography variant="h4" gutterBottom>{headerText}</Typography> {/* Display selected question */}
                        {learningObjective && (
                            <Typography variant="h6" gutterBottom>
                                Learning Objective: {learningObjective} {/* Display learning objective */}
                            </Typography>
                        )}
                        <ChatDisplay conversation={conversations[selectedQuestion?.question || ''] || []} />
                        <ChatInput
                            inputValue={inputValue}
                            onInputChange={handleInputChange}
                            onAskQuestion={handleInputSubmit}
                        />
                    </Box>
                    {selectedQuestion && questionFeedback[selectedQuestion.question]?.length > 0 && (
                        <FeedbackDisplay question={selectedQuestion.question} feedback={questionFeedback[selectedQuestion.question]} />
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default MainApp;
