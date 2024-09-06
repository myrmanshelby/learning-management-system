import React from 'react';
import { List, ListItem, ListItemText, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Question, Chapter, Section } from '../../../models/firebase-types';

interface SidebarProps {
    questions: Question[];
    selectedQuestion: string;
    correctlyAnsweredQuestions: string[];
    onSelectQuestion: (question: Question) => void;
    chapters?: Chapter[];  // Optional
    sections?: Section[];  // Optional
    selectedChapter?: string | null;  // Optional
    selectedSection?: string | null;  // Optional
    onSelectChapter?: (chapterId: string) => void;  // Optional
    onSelectSection?: (sectionId: string) => void;  // Optional
}

const Sidebar: React.FC<SidebarProps> = ({
    questions, chapters, sections, selectedChapter, selectedSection, selectedQuestion,
    correctlyAnsweredQuestions, onSelectChapter, onSelectSection, onSelectQuestion
}) => {
    console.log("Sidebar received correctlyAnsweredQuestions:", correctlyAnsweredQuestions);
    return (
        <>
            {/* Conditionally render chapter selection if chapters are provided */}
            {chapters && (
                <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel id="chapter-label" shrink>Select Chapter</InputLabel>
                    <Select
                        labelId="chapter-label"
                        value={selectedChapter || ''}
                        onChange={(e) => onSelectChapter && onSelectChapter(e.target.value as string)}
                        label="Select Chapter"
                    >
                        {chapters.map((chapter) => (
                            <MenuItem key={chapter.chapterID} value={chapter.chapterID}>
                                {chapter.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Conditionally render section selection if sections are provided */}
            {sections && (
                <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel id="section-label" shrink>Select Section</InputLabel>
                    <Select
                        labelId="section-label"
                        value={selectedSection || ''}
                        onChange={(e) => onSelectSection && onSelectSection(e.target.value as string)}
                        disabled={!selectedChapter}
                        label="Select Section"
                    >
                        {sections.map((section) => (
                            <MenuItem key={section.sectionID} value={section.sectionID}>
                                {section.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Render the list of questions */}
            <List>
                {questions.map((question) => (
                    <ListItem
                        key={question.questionID}
                        button
                        onClick={() => onSelectQuestion(question)}
                        selected={question.question === selectedQuestion}
                        style={{
                            backgroundColor: correctlyAnsweredQuestions.includes(question.questionID) ? '#C8F4E2' : '#EEEEEE',
                            border: question.question === selectedQuestion ? '2px solid blue' : 'none',
                            borderRadius: '4px',
                            margin: '4px 0',
                            width: '100%',
                        }}
                    >
                        <ListItemText 
                            primary={question.question} 
                            style={{ 
                                color: 'black',
                                margin: 0,
                                padding: 0,
                            }} 
                        />
                    </ListItem>
                ))}
            </List>
        </>
    );
};

export default Sidebar;
