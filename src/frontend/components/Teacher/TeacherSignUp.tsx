import React, { useContext, useState } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import { User } from '../../../models/frontend-models';
import { v4 as uuidv4 } from 'uuid';



const TeacherSignUp: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');

    const handleSignUp = async () => {
        // Implement sign-up logic here (e.g., form validation, API call)
        // For demonstration, we'll use a mock userID
        const generatedUserID = uuidv4();
        const newUser: User = {
        userID: generatedUserID,
        firstname: firstname,
        lastname: lastname,
        birthday: birthday,
        email: email,
        userType: 'teacher',
    }

    try {
        const response = await fetch('/api/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        if (response.ok) {
            // Update the user context
            setUser(newUser);

            // Redirect to the teacher dashboard
            navigate('/teacher');
        } else {
            const errorData = await response.json();
            console.error('Failed to create user:', errorData.message);
            // Handle error (e.g., show error message to the user)
        }
    } catch (error) {
        console.error('Error during sign-up:', error);
        // Handle error (e.g., show error message to the user)
    }
    };

    const handleSignIn = () => {
        navigate('/teacher/signin')
    };

    return (
        <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
            <Typography variant="h4" gutterBottom>
                Sign Up
            </Typography>
            {/* Add form fields here as needed */}
            <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="firstname"
        placeholder="First Name"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
      />
      <input
        type="lastname"
        placeholder="Last Name"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
      />
      <input
        type="date"
        placeholder="Birthday"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
      />
            <Box mt={4}>
                <Button variant="contained" color="primary" size="large" onClick={handleSignUp}>
                    Sign Up
                </Button>
            </Box>
            <Box mt={4}>
                <Button variant="contained" color="primary" size="large" onClick={handleSignIn}>
                    Go to Sign In
                </Button>
            </Box>
        </Container>
    );
};

export default TeacherSignUp;