import type {
    AuthResponse,
    FilesListResponse,
    UploadUrlResponse,
    DownloadUrlResponse,
} from '../types';

const API_BASE_URL = '/api';

class ApiService {
    private token: string | null = null;

    constructor() {
        // Load token from localStorage on initialization
        this.token = localStorage.getItem('token');
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    getToken() {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }

        return response.json();
    }

    // Auth endpoints
    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    // File endpoints
    async getFiles(region: string = 'all'): Promise<FilesListResponse> {
        return this.request<FilesListResponse>(`/files?region=${region}`);
    }

    async getUploadUrl(fileName: string, fileSize: number, region: string): Promise<UploadUrlResponse> {
        return this.request<UploadUrlResponse>('/files/upload-url', {
            method: 'POST',
            body: JSON.stringify({ fileName, fileSize, region }),
        });
    }

    async uploadToS3(uploadUrl: string, file: File, contentType: string): Promise<void> {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
            body: file,
        });

        if (!response.ok) {
            throw new Error('Failed to upload file to S3');
        }
    }

    async getDownloadUrl(fileId: string, region: string): Promise<DownloadUrlResponse> {
        return this.request<DownloadUrlResponse>(`/files/${fileId}/download-url?region=${region}`);
    }

    async deleteFile(fileId: string, region: string): Promise<{ success: boolean; message: string }> {
        return this.request(`/files/${fileId}?region=${region}`, {
            method: 'DELETE',
        });
    }
}

export const apiService = new ApiService();
