import { useState } from 'react';
import { apiService } from '../services/api';

interface FileUploadProps {
    onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [region, setRegion] = useState<'UK' | 'IRE'>('UK');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setMessage('Please select a file');
            setMessageType('error');
            return;
        }

        setUploading(true);
        setMessage('');

        try {
            // Step 1: Get pre-signed upload URL
            const uploadUrlResponse = await apiService.getUploadUrl(file.name, file.size, region);

            // Step 2: Upload file directly to S3
            await apiService.uploadToS3(
                uploadUrlResponse.data.uploadUrl,
                file,
                uploadUrlResponse.data.contentType
            );

            setMessage('File uploaded successfully!');
            setMessageType('success');
            setFile(null);

            // Reset file input
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Notify parent to refresh file list
            onUploadSuccess();
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to upload file');
            setMessageType('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card">
            <h2>📤 Upload File</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="region-select">Region</label>
                    <select
                        id="region-select"
                        value={region}
                        onChange={(e) => setRegion(e.target.value as 'UK' | 'IRE')}
                        disabled={uploading}
                        required
                    >
                        <option value="UK">🇬🇧 UK</option>
                        <option value="IRE">🇮🇪 Ireland</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="file-input">Select File</label>
                    <input
                        type="file"
                        id="file-input"
                        onChange={handleFileChange}
                        disabled={uploading}
                        required
                    />
                    <small className="help-text">
                        Supported: Images (jpg, png, gif), PDF, Text, Markdown
                    </small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
                    {uploading ? 'Uploading...' : 'Upload to S3'}
                </button>
            </form>

            {uploading && (
                <div className="progress">
                    <div className="progress-bar"></div>
                    <span className="progress-text">Uploading...</span>
                </div>
            )}

            {message && (
                <div className={`message ${messageType} show`}>{message}</div>
            )}
        </div>
    );
}
