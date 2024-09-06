import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import { User } from '../../../models/frontend-models';
import { TutoringAPI } from '../../proxy/tutor-backend/TutorBackendProxy';
import { Container, Typography, Button, Box } from '@mui/material';


const TeacherSignIn: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [email, setEmail] = useState('');

    const api = new TutoringAPI();

    const handleLogin = async () => {
        console.log(`About to fetch the information for ${email}`);
    
        const user: User = await api.getUserByEmail({
          email: email,
        });
    
        if (user) {
          console.log(`Found user for ${email}`);
          console.log(user);
          setUser(user);

          navigate('/teacher');
        }
    };

    const handleSignUp = () => {
        navigate('/teacher/signup')
    }

    return ( 
        <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
            <Typography variant="h4" gutterBottom>
                Sign Up
            </Typography>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Box mt={4}>
                <Button variant="contained" color="primary" size="large" onClick={handleLogin}>
                    Sign In
                </Button>
            </Box>
            <Box mt={4}>
                <Button variant="contained" color="primary" size="large" onClick={handleSignUp}>
                    Go to Sign Up
                </Button>
            </Box>
        </Container>    
        );
};

export default TeacherSignIn;