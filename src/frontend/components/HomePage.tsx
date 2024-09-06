import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
      <Typography variant="h3" gutterBottom>
        Welcome
      </Typography>
      <Typography variant="h5" gutterBottom>
        Please choose your role:
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          to="/student"
          style={{ marginRight: '20px' }}
        >
          Student
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={Link}
          to="/teacher/signup"
        >
          Teacher
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;