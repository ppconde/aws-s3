import { useState } from 'react';
import type { User } from '../types';
import { apiService } from '../services/api';

interface AuthProps {
    onAuthSuccess: (user: User) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = isLogin
                ? await apiService.login(formData.email, formData.password)
                : await apiService.register(formData.name, formData.email, formData.password);

            apiService.setToken(response.data.token);
            setSuccess(response.message);
            onAuthSuccess(response.data.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h2>Authentication</h2>
                <div className="tabs">
                    <button
                        className={`tab-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`tab-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required={!isLogin}
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                {error && <div className="message error show">{error}</div>}
                {success && <div className="message success show">{success}</div>}
            </div>
        </div>
    );
}
