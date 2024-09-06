import { last } from 'lodash';
import React, { useState } from 'react';

const SignUpPage: React.FC = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [classID, setClassID] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [userType, setUserType] = useState('student'); // Default to 'student'
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    try {
      const response = await fetch('/api/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classID,
          firstname,
          lastname,
          email,
          birthday,
          userType
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`User signed up successfully! Received input: ${JSON.stringify(data.receivedInput)}`);
      } else {
        setMessage('Sign up failed.');
      }
    } catch (error) {
      setMessage(`Sign up failed: ${error.message}`);
    }
  };

  return (
    <div className="sign-up-container">
      <h1>Sign Up</h1>
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
        type="classID"
        placeholder="Course Code"
        value={classID}
        onChange={(e) => setLastname(e.target.value)}
      />
      <input
        type="date"
        placeholder="Birthday"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
      />
      <select value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button onClick={handleSignUp}>Sign Up</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignUpPage;
