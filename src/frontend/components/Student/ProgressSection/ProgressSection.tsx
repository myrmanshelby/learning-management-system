import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Chapter, Section } from '../../../../models/firebase-types';

interface ProgressSectionProps {
    chapters: Chapter[];
    sections: Section[];
    selectedChapter: string | null;
    selectedSection: string | null;
    onSelectChapter: (chapterId: string) => void;
    onSelectSection: (sectionId: string) => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ chapters, sections, selectedChapter, selectedSection, onSelectChapter, onSelectSection }) => {
    return (
        <Box>
            <Typography variant="h6">Chapters</Typography>
            <Box 
                display="flex" 
                flexWrap="nowrap" 
                overflow="auto" 
                sx={{ gap: 2 }}
            >
                {chapters.map((chapter) => (
                    <Button
                        key={chapter.chapterID}
                        onClick={() => onSelectChapter(chapter.chapterID)}
                        variant={selectedChapter === chapter.chapterID ? 'contained' : 'outlined'}
                        sx={{ flex: chapters.length <= 6 ? `1 1 ${100 / chapters.length}%` : '1 0 auto', minWidth: 0 }} 
                    >
                        {chapter.title}
                    </Button>
                ))}
            </Box>
            {selectedChapter && (
                <>
                    <Typography variant="h6" mt={2}>Sections</Typography>
                    <Box 
                        display="flex" 
                        flexWrap="nowrap" 
                        overflow="auto" 
                        sx={{ gap: 2 }}
                    >
                        {sections.map((section) => (
                            <Button
                                key={section.sectionID}
                                onClick={() => onSelectSection(section.sectionID)}
                                variant={selectedSection === section.sectionID ? 'contained' : 'outlined'}
                                sx={{ flex: sections.length <= 6 ? `1 1 ${100 / sections.length}%` : '1 0 auto', minWidth: 0 }}
                            >
                                {section.title}
                            </Button>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ProgressSection;
