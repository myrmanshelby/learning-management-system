import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Button, Container, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import MainApp from './Student/MainApp';
import ViewScoresStudent from './Student/ViewScoresStudent';
import theme from '../theme';
import RoleSwitchButton from './RoleSwitchButton';
import StudentDropdown from './Student/StudentDropdown';

const StudentRoutes: React.FC = () => {
    const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);

    const handleStudentSelect = (studentEmail: string) => {
        setSelectedStudentEmail(studentEmail);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static" sx={{ marginBottom: '32px' }}>
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Button color="inherit" component={Link} to="/student/">Tutor</Button>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/student/view-scores"
                            disabled={!selectedStudentEmail} // Disable if no student is selected
                        >
                            View Scores
                        </Button>
                    </Box>
                    <StudentDropdown onSelectStudent={handleStudentSelect} />
                </Toolbar>
            </AppBar>
            {selectedStudentEmail && (
                <Container>
                    <Routes>
                        <Route 
                            path="/" 
                            element={<MainApp currentUser={selectedStudentEmail} />} 
                        />
                        <Route 
                            path="/view-scores" 
                            element={<ViewScoresStudent userID={selectedStudentEmail} classID="class1" />} 
                        />
                    </Routes>
                </Container>
            )}
        </ThemeProvider>
    );
};

export default StudentRoutes;