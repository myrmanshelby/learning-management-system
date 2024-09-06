import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Button, Container, Box } from '@mui/material';
import ProblemSet from './Teacher/ProblemSet';
import OverwriteQuestion from './Teacher/OverwriteQuestion';
import CourseOverview from '../PreviewPage';
import ViewScoresTeacher from './Teacher/ViewScoresTeacher'; 
import theme from '../theme'; 
import ViewStudentScore from './Teacher/ViewStudentScore';
import CreateProblemSet from './Teacher/CreateProblemSet';
import QuestionsTable from './Teacher/QuestionsTable';

const TeacherRoutes: React.FC = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" sx={{ marginBottom: '32px' }}>
            <Toolbar>
                <Box sx={{ flexGrow: 1 }}>
                    <Button color="inherit" component={Link} to="/teacher/preview">Courses</Button>
                    <Button color="inherit" component={Link} to="/teacher/view-students">Students</Button>
                </Box>
            </Toolbar>
        </AppBar>
        <Container>
            <Routes>
                <Route path="/" element={<CourseOverview />} />
                <Route path="/preview" element={<CourseOverview />} />
                <Route path="/create-problem-set" element={<CreateProblemSet classID={''}/>} />
                <Route path="/:classID/create-problem-set" element={<CreateProblemSet classID={''} />} />
                <Route path="/:classID/questions" element={<QuestionsTable classID={''} />} />
                <Route path="/problem-set/:sectionID" element={<ProblemSet />} />
                <Route path="/edit-question/:questionID" element={<OverwriteQuestion />} />
                <Route path="/view-students" element={<ViewScoresTeacher />} />
                <Route path="/scores/:userID/:classID" element={<ViewStudentScore userID={''} classID={''} />} />
            </Routes>
        </Container>
    </ThemeProvider>
);

export default TeacherRoutes;