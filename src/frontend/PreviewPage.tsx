import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import TeacherUpload from './components/Teacher/TeacherUpload';
import ScoreChart from './components/Teacher/ScoreChart';
import { Class, ListClassesOutput, User } from '../models/frontend-models';
import { Button, TextField } from '@mui/material';
import { TutoringAPI } from './proxy/tutor-backend/TutorBackendProxy';
import QuestionsTable from './components/Teacher/QuestionsTable';
import { useUser } from './UserContext';

const CourseOverview: React.FC = () => {

  const { user, setUser } = useUser();
  const [classes, setClasses] = useState<Class[]>([]);

  const api = new TutoringAPI();

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      console.log(`Fetching classes for ${user.userID}`);
      const response: ListClassesOutput = await api.listClasses({
        userID: user.userID
      });

      console.log(`Fetched Class Ids`);
      console.log(response);

      if (response != null && response.classes.length > 0) {
        const classesPromises = response.classes.map((classId) => {
          console.log(`Fetching details for classId: ${classId}`);
          return api.getClass({
            classID: classId
          });
        });

        const classes = await Promise.all(classesPromises);
        console.log("Fetched your classes");
        console.log(classes);
        setClasses(classes);
      }
    };

    fetchClasses();
  }, [user]); // Dependencies array ensures the effect runs when user changes

  return (
    <Container>
      {user != null && classes.length < 1 
        ? <Box my={5}>
            <TeacherUpload 
              getCreatorId={() => {return user.userID}}
              onUploadComplete={(newClass) => setClasses([newClass])} 
            />
          </Box> : null
        }

      {classes.map((c) => (
           <Box my={5} key={c.classID}>
              <Box my={5}>
                <Typography variant="h4" gutterBottom>
                  {c.title}
                </Typography>
              </Box>
              <Box my={5}>
                <QuestionsTable classID={c.classID} />
              </Box>
              <Box my={5}>
                <Typography variant="h5" gutterBottom>
                  Scores
                </Typography>
                <ScoreChart classID={c.classID} />
              </Box>
            </Box>
          )
        )
      }
    </Container>
  );
};

export default CourseOverview;