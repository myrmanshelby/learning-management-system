import React from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import { School, Work } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const RoleSwitchSpeedDial: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isTeacherView = location.pathname.startsWith('/teacher');
    const isStudentView = location.pathname.startsWith('/student');

    // Determine which actions to show based on the current path
    const actions = [
        isTeacherView && { icon: <School />, name: 'Switch to Student', action: () => navigate('/student') },
        isStudentView && { icon: <Work />, name: 'Switch to Teacher', action: () => navigate('/teacher') },
    ].filter(Boolean); // Filter out any `false` values

    // Don't show the Speed Dial on the home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <Box position="fixed" bottom={16} right={16}>
            <SpeedDial
                ariaLabel="Switch Role"
                icon={<SpeedDialIcon />}
                direction="up"
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action!.name}
                        icon={action!.icon}
                        tooltipTitle={action!.name}
                        onClick={action!.action}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
};

export default RoleSwitchSpeedDial;