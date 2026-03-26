import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { supabase, isDemoMode } from '../supabase_client';

function SignUp() {
    const navigate = useNavigate();

    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#F8F8F4';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isDemoMode) {
            alert('Account created successfully! (Demo mode)');
            navigate('/login');
            return;
        }

        // 1. Create the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    username: formData.username
                }
            }
        });

        if (error) {
            alert(error.message);
            return;
        }

        // 2. Create the profile row in the backend
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: data.user.id,
                    name: formData.username,
                    email: formData.email
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('Profile creation error:', errData);
                alert('User created but profile failed. Check console.');
                return;
            }
        } catch (err) {
            console.error('Failed to create profile:', err);
            alert('Network error creating profile');
            return;
        }

        alert('Account created successfully!');
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-blob"></div>
            
            <div className="auth-content">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome.</h1>
                    <p className="auth-subtitle">Ready to beat procrastination?</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        Sign Up
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
