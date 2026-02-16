import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import type { User } from './types';
import { apiService } from './services/api';
import './App.css';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        // Check if user is already logged in
        const token = apiService.getToken();
        if (token) {
            // Token exists, assume user is logged in
            // In a real app, you might want to validate the token
        }
    }, []);

    const handleAuthSuccess = (user: User) => {
        setUser(user);
    };

    const handleLogout = () => {
        apiService.clearToken();
        setUser(null);
    };

    const handleUploadSuccess = () => {
        // Trigger file list refresh
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="container">
            <header>
                <h1>📁 S3 File Manager</h1>
                {user && (
                    <div className="user-info">
                        <span>{user.email}</span>
                        <button onClick={handleLogout} className="btn btn-secondary btn-small">
                            Logout
                        </button>
                    </div>
                )}
            </header>

            {!user ? (
                <Auth onAuthSuccess={handleAuthSuccess} />
            ) : (
                <div className="files-section">
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                    <FileList refreshTrigger={refreshTrigger} />
                </div>
            )}
        </div>
    );
}

export default App;
