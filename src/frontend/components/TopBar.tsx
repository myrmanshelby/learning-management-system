import React from 'react';
import { Button, Box } from '@mui/material';

interface TopBarProps {
    learningObjectives: { id: string, objective: string }[];
    selectedObjective: string | null;
    handleObjectiveClick: (objectiveId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ learningObjectives, selectedObjective, handleObjectiveClick }) => {
    return (
        <Box display="flex" justifyContent="center" marginBottom={2} padding={2} bgcolor="grey.100">
            {learningObjectives.map((objective) => (
                <Button
                    key={objective.id}
                    variant={objective.id === selectedObjective ? 'contained' : 'outlined'}
                    color={objective.id === selectedObjective ? 'primary' : 'inherit'}
                    onClick={() => handleObjectiveClick(objective.id)}
                    sx={{ margin: 1, fontSize: '0.875rem', padding: '6px 12px', bgcolor: objective.id === selectedObjective ? undefined : 'grey.300' }}
                >
                    {objective.objective}
                </Button>
            ))}
        </Box>
    );
};

export default TopBar;