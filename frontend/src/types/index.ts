export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface File {
    key: string;
    fileId: string;
    fileName: string;
    region: string;
    size: number;
    lastModified: string;
    contentType?: string;
}

export interface FilesListResponse {
    success: boolean;
    message: string;
    data: {
        files: File[];
        count: number;
    };
}

export interface UploadUrlResponse {
    success: boolean;
    message: string;
    data: {
        uploadUrl: string;
        fileId: string;
        key: string;
        region: string;
        contentType: string;
        expiresIn: number;
    };
}

export interface DownloadUrlResponse {
    success: boolean;
    message: string;
    data: {
        downloadUrl: string;
        fileId: string;
        expiresIn: number;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}
