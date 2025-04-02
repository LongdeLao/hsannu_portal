// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { API_URL } from '../config';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // For testing/development, we'll add a simple local login option
      if (username === 'staff' && password === 'password') {
        const userData = {
          username: 'staff',
          role: 'staff',
          name: 'Staff User',
          id: 1001,
          additional_roles: ['teacher', 'admin'],
          status: 'active'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loggedIn', 'true');
        navigate('/staff/dashboard');
        return;
      } else if (username === 'student' && password === 'password') {
        const userData = {
          username: 'student',
          role: 'student',
          name: 'Student User',
          id: 2001,
          additional_roles: ['class_representative'],
          status: 'active'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loggedIn', 'true');
        navigate('/student/dashboard');
        return;
      }
      
      // If not using test credentials, try to authenticate with the server
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        console.log("Login successful", data);

        // Create user data object without password
        const userData = {
          ...data,
          id: data.id ? parseInt(data.id, 10) : null,
          additional_roles: data.additional_roles || []
        };
        
        // Remove password from userData if it exists
        delete userData.password;
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loggedIn', 'true');

        // Log everything stored in localStorage
        console.log('=== LOGIN SUCCESS: API USER ===');
        console.log('User data stored:', userData);
        console.log('ID type:', typeof userData.id);
        console.log('Role:', userData.role);
        console.log('Additional Roles:', userData.additional_roles);
        console.log('Status:', userData.status);
        console.log('Name:', userData.name);
        console.log('Username:', userData.username);
        console.log('All user data:', userData);
        console.log('loggedIn:', localStorage.getItem('loggedIn'));
        console.log('localStorage user object:', localStorage.getItem('user'));
        console.log('Parsed localStorage user:', JSON.parse(localStorage.getItem('user')));
        console.log('=====================================');

        if (data.role === 'student') {
          navigate('/student/dashboard');
        } else if (data.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/');
        }
      } else {
        console.error("Login error", data.error);
        setErrorMsg(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error during login", error);
      setErrorMsg("An error occurred while logging in.");
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Add your forgot password action here.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Login</h1>

        <InputField
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          Icon={UserIcon}
        />

        <div className="mt-6">
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            Icon={LockClosedIcon}
          />
        </div>

        {errorMsg && (
          <div className="mt-4 text-center text-red-500">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 text-right">
          <button onClick={handleForgotPassword} className="text-sm text-black">
            Forgot Password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 mt-6 bg-black text-white font-semibold rounded-lg flex justify-center items-center space-x-2"
        >
          <span>Login</span>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function InputField({ id, label, value, onChange, type = 'text', Icon }) {
  const [isFocused, setIsFocused] = useState(false);
  const active = isFocused || value.length > 0;

  return (
    <div className="relative mb-4">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="block w-full border-b border-gray-300 focus:border-black outline-none py-2 pl-10 bg-transparent"
      />
      <label
        htmlFor={id}
        className={`absolute left-10 transition-all duration-150 ${active ? '-top-3 text-xs text-black' : 'top-2 text-gray-400'}`}
      >
        {label}
      </label>
    </div>
  );
}

export default Login;
