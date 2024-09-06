import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import TeacherRoutes from './components/TeacherRoutes';
import StudentRoutes from './components/StudentRoutes';
import HomePage from './components/HomePage';
import theme from './theme';
import RoleSwitchButton from './components/RoleSwitchButton';
import TeacherSignUp from './components/Teacher/TeacherSignUp';
import TeacherSignIn from './components/Teacher/TeacherSignIn';
import { UserProvider } from './UserContext';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <UserProvider>
    <Router>
      <Box sx={{ width: '100%', height: '100vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher/signup" element={<TeacherSignUp />} />
          <Route path="/teacher/signin" element={<TeacherSignIn />} />
          <Route path="/teacher/*" element={<TeacherRoutes />} />
          <Route path="/student/*" element={<StudentRoutes />} />
        </Routes>
      </Box>
      <RoleSwitchButton /> {/* Add the FAB outside of the nav bar */}
    </Router>
    </UserProvider>
  </ThemeProvider>
);

export default App;