import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Chapter, Question, Section } from '../../../models/firebase-types'; // Adjust the path as necessary
import { TutoringAPI } from '../../proxy/tutor-backend/TutorBackendProxy';
import { SectionQuestion } from '../../../models/frontend-models';

interface QuestionsTableProps {
    classID: string;
}

const QuestionsTable: React.FC<QuestionsTableProps> = ( { classID } ) => {
    const [questions, setQuestions] = useState<SectionQuestion[]>();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const api = new TutoringAPI()

    const getQueryParams = () => new URLSearchParams(location.search);
    const queryParams = getQueryParams();
    const finalClassId = classID ? classID : queryParams.get('classID')

    const loadChaptersAndSections = async () => {
        const api = new TutoringAPI()
        const response = await api.getChaptersAndSections({
            classID: finalClassId
        })

        const result = response.sections
            .map(s => s.sections)
            .reduce((accumulator, value) => accumulator.concat(value), []);

        setChapters(response.chapters)
        setSections(result)
    }

    useEffect(() => {
        if (sections.length > 0) {
            fetchQuestions(sections);
        } else {
            loadChaptersAndSections()
        }

    }, [chapters, sections]);

    const fetchQuestions = async (sections: Section[]) => {
        setLoading(true); // Start loading before fetching
        try {
            const results = await Promise.all( 
                sections.map(async (section) => {
                    return await api.getProblems({
                        sectionID: section.sectionID
                    })
                })
            )

            const questions: SectionQuestion[] = results.map(section => {
                return  section.problems.map((problem): SectionQuestion => {
                    return { sectionID: section.sectionID, question: problem}
                })
            }).reduce((accumulator, value) => accumulator.concat(value), [])
            
            setQuestions(questions)
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false); // Stop loading after fetching
        }
    };    

    if (loading) {
        return <CircularProgress />;
    }

    if (chapters.length === 0) {
        return <Typography variant="h6">No chapters found.</Typography>;
    }

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                View and Edit Questions
            </Typography>  
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Chapter Title</TableCell>
                            <TableCell>Section Title</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chapters.map((chapter) => (
                            <React.Fragment key={chapter.chapterID}>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <Typography variant="h6">{chapter.title}</Typography>
                                    </TableCell>
                                </TableRow>
                                {sections.filter(section => chapter.sectionIDs.includes(section.sectionID)).map((section) => (
                                    <React.Fragment key={section.sectionID}>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>
                                                <Typography variant="subtitle1">{section.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {questions.filter(q => q.sectionID === section.sectionID).length > 0 ? (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        component={Link}
                                                        to={`/teacher/problem-set/${section.sectionID}`} // Edit existing questions
                                                        onClick={() => console.log('Navigating to:', section.sectionID)} // Debug log
                                                    >
                                                        Edit Questions
                                                    </Button>
                                                    ) : (
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        component={Link}
                                                        to={`/teacher/create-problem-set?classID=${finalClassId}&chapterID=${chapter.chapterID}&sectionID=${section.sectionID}`} // Generate new questions
                                                        onClick={() => console.log('Navigating to generate questions for:', section.sectionID)} // Debug log
                                                    >
                                                        Generate Questions
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default QuestionsTable;