import React from 'react';
import { Fab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const RoleSwitchButton: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isTeacherView = location.pathname.startsWith('/teacher');
    const isStudentView = location.pathname.startsWith('/student');
    const isMainApp = location.pathname === '/';  // Check if it's the main app

    const handleSwitch = () => {
        if (isTeacherView) {
            navigate('/student');
        } else if (isStudentView) {
            navigate('/teacher');
        }
    };

    // Don't render the button on the main app page
    if (isMainApp) {
        return null;
    }

    return (
        <Fab 
            variant="extended" 
            color="secondary" 
            aria-label="switch role" 
            onClick={handleSwitch}
            sx={{
                position: 'fixed',
                bottom: 16,  // Distance from the bottom
                right: 16,   // Distance from the right side
                color: 'white',
                textTransform: 'none',  // Prevents text from being uppercased
            }}
        >
            {isTeacherView ? 'Switch to Student' : 'Switch to Teacher'}
        </Fab>
    );
};

export default RoleSwitchButton;