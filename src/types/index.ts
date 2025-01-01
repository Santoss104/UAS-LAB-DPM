export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface Book {
    _id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    totalPages: number;
    userId: string; 
    createdAt: string; 
    updatedAt: string;
}


export interface AuthResponse {
    data: {
        token: string;
    };
}

export interface ApiError {
    data: {
        message: string;
        errors?: {
            password?: string;
            username?: string;
        };
    };
}

export type RootStackParamList = {
    Splash: undefined;
    MainTabs: undefined;
    Register: undefined;
    Login: undefined;
    Profile: undefined;
    Home: undefined;
    Book: undefined;
    BookDetail: undefined;
  };