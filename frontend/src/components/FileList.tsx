import { useState, useEffect } from 'react';
import type { File } from '../types';
import { apiService } from '../services/api';

interface FileListProps {
    refreshTrigger: number;
}

export default function FileList({ refreshTrigger }: FileListProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [regionFilter, setRegionFilter] = useState<'all' | 'UK' | 'IRE'>('all');

    const loadFiles = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiService.getFiles(regionFilter);
            setFiles(response.data.files);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [refreshTrigger, regionFilter]);

    const handleDownload = async (fileId: string, region: string) => {
        try {
            const response = await apiService.getDownloadUrl(fileId, region);
            // Open download URL in new tab
            window.open(response.data.downloadUrl, '_blank');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to get download URL');
        }
    };

    const handleDelete = async (fileId: string, region: string) => {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            await apiService.deleteFile(fileId, region);
            // Reload file list
            loadFiles();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete file');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2>📋 Your Files</h2>
                </div>
                <div className="loading">Loading files...</div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2>📋 Your Files</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value as 'all' | 'UK' | 'IRE')}
                        className="region-filter"
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="all">🌍 All Regions</option>
                        <option value="UK">🇬🇧 UK</option>
                        <option value="IRE">🇮🇪 Ireland</option>
                    </select>
                    <button onClick={loadFiles} className="btn btn-secondary btn-small">
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {error && <div className="message error show">{error}</div>}

            {files.length === 0 ? (
                <div className="empty-state">
                    <p>No files yet</p>
                    <small>Upload your first file to get started!</small>
                </div>
            ) : (
                <div className="files-list">
                    {files.map((file) => (
                        <div key={file.key} className="file-item">
                            <div className="file-info">
                                <div className="file-name">
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.1rem 0.4rem',
                                        marginRight: '0.5rem',
                                        background: file.region === 'UK' ? '#e3f2fd' : '#e8f5e9',
                                        color: file.region === 'UK' ? '#1976d2' : '#388e3c',
                                        borderRadius: '3px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {file.region === 'UK' ? '🇬🇧 UK' : '🇮🇪 IRE'}
                                    </span>
                                    {file.fileName}
                                </div>
                                <div className="file-meta">
                                    {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                                </div>
                            </div>
                            <div className="file-actions">
                                <button
                                    onClick={() => handleDownload(file.fileId, file.region)}
                                    className="btn btn-success btn-small"
                                >
                                    📥 Download
                                </button>
                                <button
                                    onClick={() => handleDelete(file.fileId, file.region)}
                                    className="btn btn-danger btn-small"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
