import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { supabase, isDemoMode } from '../supabase_client';

function Login() {
    const navigate = useNavigate();

    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#F8F8F4';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const [formData, setFormData] = useState({
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
            navigate('/home');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if (error) {
            alert(error.message);
            return;
        }

        navigate('/home');
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
                        Log in
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
