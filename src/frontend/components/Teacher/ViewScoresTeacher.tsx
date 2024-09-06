import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { TutoringAPI } from '../../proxy/tutor-backend/TutorBackendProxy'
import { Class, ListClassesOutput, User } from '../../../models/frontend-models';
import { useUser } from '../../UserContext';

interface ViewScoresTeacherProps {
    userID: string;
}

const formatPercentage = (score: number): string => {
    return `${(score * 100).toFixed(2)}%`;
};

const ViewScoresTeacher: React.FC = () => {
    const { user, setUser } = useUser();
    const [loading, setLoading] = useState<boolean>(true);
    const [studentScores, setStudentScores] = useState<{ 
        firstname: string, 
        lastname: string, 
        email: string, 
        score: number | null,
        className: string 
    }[]>([]);

    const userID = user.userID;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassesAndScores = async () => {
            setLoading(true);
            try {
                const api = new TutoringAPI();
                
                // Fetch classes associated with the userID
                const response: ListClassesOutput = await api.listClasses({ userID });
                if (response != null && response.classes.length > 0) {
                    const classesPromises = response.classes.map((classId) => {
                        return api.getClass({ classID: classId });
                    });

                    const classes = await Promise.all(classesPromises);

                    // Fetch student scores for each class
                    const scoresPromises = classes.map(async (classData) => {
                        const classID = classData.classID;
                        const studentsResponse = await axios.get(`/api/class/${classID}/students-scores`);
                        return studentsResponse.data.map(student => ({
                            ...student,
                            className: classData.title
                        }));
                    });

                    const allScores = await Promise.all(scoresPromises);
                    const flattenedScores = allScores.flat(); // Flatten the array of arrays

                    setStudentScores(flattenedScores);
                }
            } catch (error) {
                console.error('Error fetching classes and scores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClassesAndScores();
    }, [userID]);

    if (loading) {
        return <CircularProgress />;
    }

    const handleClick = (userID: string) => {
        navigate(`/teacher/scores/${userID}`);
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Class</TableCell> {/* New column for Class Name */}
                        <TableCell>Email</TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {studentScores.map((student, index) => (
                        <TableRow key={index} onClick={() => handleClick(student.email)}>
                            <TableCell>{student.className}</TableCell> {/* Display the Class Name */}
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.firstname}</TableCell>
                            <TableCell>{student.lastname}</TableCell>
                            <TableCell>
                                {student.score !== null ? formatPercentage(student.score) : 'No Data'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {studentScores.length === 0 && (
                <Typography variant="h6" style={{ marginTop: '16px' }}>
                    No students found.
                </Typography>
            )}
        </TableContainer>
    );
};

export default ViewScoresTeacher;