import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Collapse, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const formatPercentage = (score: number): string => {
    return `${(score * 100).toFixed(2)}%`;
};

interface ViewScoresStudentProps {
    userID: string;
    classID: string;
}

const ViewScoresStudent: React.FC<ViewScoresStudentProps> = ({userID, classID}) => {
    // State to hold the fetched data
    const [chapters, setChapters] = useState<any[]>([]);
    const [totalScore, setTotalScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State to track open chapters and sections
    const [openChapters, setOpenChapters] = useState<{ [key: number]: boolean }>({});
    const [openSections, setOpenSections] = useState<{ [key: number]: { [key: number]: boolean } }>({});

    // Fetch the data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/student-score-list/${userID}/${classID}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setChapters(data);

                const totalScoreResponse = await fetch(`/api/student-total-score/${userID}/${classID}`);
                if (!totalScoreResponse.ok) {
                    throw new Error('Failed to fetch total score');
                }
                const totalScoreData: number = await totalScoreResponse.json();
                setTotalScore(totalScoreData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Toggle chapter visibility
    const handleChapterToggle = (chapterIndex: number) => {
        setOpenChapters(prevState => ({
            ...prevState,
            [chapterIndex]: !prevState[chapterIndex],
        }));
    };

    // Toggle section visibility
    const handleSectionToggle = (chapterIndex: number, sectionIndex: number) => {
        setOpenSections(prevState => ({
            ...prevState,
            [chapterIndex]: {
                ...prevState[chapterIndex],
                [sectionIndex]: !prevState[chapterIndex]?.[sectionIndex],
            },
        }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Chapter</TableCell>
                        <TableCell>Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {chapters.map((chapter, chapterIndex) => (
                        <React.Fragment key={chapterIndex}>
                            <TableRow>
                                <TableCell>
                                    <IconButton onClick={() => handleChapterToggle(chapterIndex)}>
                                        {openChapters[chapterIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                    {chapter.name}
                                </TableCell>
                                <TableCell>{formatPercentage(chapter.score)}</TableCell>
                            </TableRow>
                            <Collapse in={openChapters[chapterIndex]}>
                                {chapter.sections.map((section, sectionIndex) => (
                                    <React.Fragment key={sectionIndex}>
                                        <TableRow>
                                            <TableCell style={{ paddingLeft: 40 }}>
                                                <IconButton onClick={() => handleSectionToggle(chapterIndex, sectionIndex)}>
                                                    {openSections[chapterIndex]?.[sectionIndex] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                                {section.name}
                                            </TableCell>
                                            <TableCell>{formatPercentage(section.score)}</TableCell>
                                        </TableRow>
                                        <Collapse in={openSections[chapterIndex]?.[sectionIndex]}>
                                            {section.objectives.map((objective, objectiveIndex) => (
                                                <TableRow key={objectiveIndex}>
                                                    <TableCell style={{ paddingLeft: 80 }}>
                                                        {objective.name}
                                                    </TableCell>
                                                    <TableCell>{formatPercentage(objective.score)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </Collapse>
                                    </React.Fragment>
                                ))}
                            </Collapse>
                        </React.Fragment>
                    ))}
                    {/* Total Score Row */}
                    <TableRow>
                        <TableCell align="right"><strong>Total Score</strong></TableCell>
                        <TableCell><strong>{totalScore ? formatPercentage(totalScore) : 'N/A'}</strong></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ViewScoresStudent;