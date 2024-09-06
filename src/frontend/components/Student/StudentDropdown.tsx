import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent, Avatar, ListItemText, ListItemIcon, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export type User = {
    userID: string;
    firstname: string;
    lastname: string;
    email: string;
    userType: string;
};

interface StudentDropdownProps {
    onSelectStudent: (studentEmail: string) => void;
}

const StudentDropdown: React.FC<StudentDropdownProps> = ({ onSelectStudent }) => {
    const [students, setStudents] = useState<User[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('/api/students');
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const studentsData: User[] = await response.json();

                // Filter out students without a first or last name
                const validStudents = studentsData.filter(student => student.firstname && student.lastname);

                setStudents(validStudents);

                // Automatically select the first student if none is selected
                if (validStudents.length > 0 && !selectedStudent) {
                    const firstStudentEmail = validStudents[0].email;
                    setSelectedStudent(firstStudentEmail);
                    onSelectStudent(firstStudentEmail);
                }
            } catch (error) {
                console.error("Failed to fetch students:", error);
            }
        };

        fetchStudents();
    }, [selectedStudent, onSelectStudent]);

    const handleStudentChange = (event: SelectChangeEvent<string>) => {
        const selectedEmail = event.target.value as string;
        setSelectedStudent(selectedEmail);
        onSelectStudent(selectedEmail);  // Notify parent component of selection
    };

    return (
        <Box sx={{ minWidth: 120, maxWidth: 200 }}> {/* Set min and max width for the dropdown */}
            <FormControl fullWidth>
                <Select
                    value={selectedStudent || ''}
                    onChange={handleStudentChange}
                    displayEmpty // To keep it blank when no student is selected
                    renderValue={(selected) => {
                        if (!selected) {
                            return null; // Show nothing when nothing is selected
                        }
                        const student = students.find(s => s.email === selected);
                        return (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                    <AccountCircleIcon sx={{ fontSize: 20 }} />
                                </Avatar>
                                <span style={{ marginLeft: 8 }}>
                                    {student?.firstname} {student?.lastname}
                                </span>
                            </Box>
                        );
                    }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        '.MuiOutlinedInput-notchedOutline': {
                            border: 'none', // Remove the outline
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: 'none', // Ensure no border on hover as well
                        },
                        '& .MuiSelect-select': {
                            padding: 0, // Remove padding to make it more compact
                        },
                    }}
                >
                    {students.map((student) => (
                        <MenuItem
                            key={student.email}
                            value={student.email}
                            sx={{
                                color: 'black',
                                backgroundColor: 'white',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                    <AccountCircleIcon sx={{ fontSize: 20 }} />
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText primary={`${student.firstname} ${student.lastname}`} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default StudentDropdown;