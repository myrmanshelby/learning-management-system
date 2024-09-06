import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chapter, Section } from '../../../models/firebase-types';
import { TutoringAPI } from '../../proxy/tutor-backend/TutorBackendProxy';

interface CreateProblemSetProps {
    classID: string;
}

const CreateProblemSet: React.FC<CreateProblemSetProps> = ( { classID } ) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapterId, setSelectedChapterId] = useState('');
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [numberOfEasy, setNumberOfEasy] = useState(0);
    const [numberOfMedium, setNumberOfMedium] = useState(0);
    const [numberOfHard, setNumberOfHard] = useState(0);
    const navigate = useNavigate(); 
    const location = useLocation();

    const api = new TutoringAPI()

    const getQueryParams = () => new URLSearchParams(location.search);
    const queryParams = getQueryParams();
    const finalClassId = classID ? classID : queryParams.get('classID')

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const response = await api.getChaptersAndSections({
                    classID: finalClassId
                })

                setChapters(response.chapters);

                const chapterIdFromParams = queryParams.get('chapterID');
                const isAvailable = response.chapters.some((c) => c.chapterID === chapterIdFromParams)
                if (isAvailable) {
                    setSelectedChapterId(chapterIdFromParams);
                }

                const chapterSections = response.sections.filter(
                    section => section.chapterId == chapterIdFromParams
                ).map(
                    section => section.sections
                ).reduce((accumulator, value) => accumulator.concat(value), [])

                setSections(chapterSections);

                const sectionIdFromParams = queryParams.get('sectionID');
                const isSectionAvailable = chapterSections.some((c) => c.sectionID === sectionIdFromParams)
                if (isSectionAvailable) {
                    setSelectedSectionId(sectionIdFromParams);
                } else {
                    setSelectedSectionId(''); // Clear if no match
                }
            } catch (error) {
                console.error('Error fetching chapters:', error);
            }
        };

        fetchChapters();
    }, []);

    const handleSubmit = async () => {
        try {
            const classResponse = await api.getClass({
                classID: finalClassId
            })

            await api.generateProblems({
                sourceID: classResponse.sourceID, 
                sectionID: selectedSectionId, 
                numberOfEasy: numberOfEasy, 
                numberOfMedium: numberOfMedium, 
                numberOfHard: numberOfHard
            })
            navigate(`/teacher/${finalClassId}/questions?classID=${finalClassId}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating problem set.');
        }
    };

    return (
        <Box mt={4}>
            <Typography variant="h5" mb={2}>Create Problem Set</Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel id="chapter-label">Select Chapter</InputLabel>
                <Select
                    labelId="chapter-label"
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value as string)}
                >
                    {chapters.map((chapter) => (
                        <MenuItem key={chapter.chapterID} value={chapter.chapterID}>
                            {chapter.title}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedChapterId && (
                <FormControl fullWidth margin="normal">
                    <InputLabel id="section-label">Select Section</InputLabel>
                    <Select
                        labelId="section-label"
                        value={selectedSectionId}
                        onChange={(e) => setSelectedSectionId(e.target.value as string)}
                    >
                        {sections.map((section) => (
                            <MenuItem key={section.sectionID} value={section.sectionID}>
                                {section.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {selectedSectionId && (
                <>
                    <TextField
                        label="Number of Easy Problems"
                        type="number"
                        value={numberOfEasy}
                        onChange={(e) => setNumberOfEasy(Number(e.target.value))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Number of Medium Problems"
                        type="number"
                        value={numberOfMedium}
                        onChange={(e) => setNumberOfMedium(Number(e.target.value))}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Number of Hard Problems"
                        type="number"
                        value={numberOfHard}
                        onChange={(e) => setNumberOfHard(Number(e.target.value))}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" onClick={handleSubmit}>Create</Button>
                </>
            )}
        </Box>
    );
};

export default CreateProblemSet;