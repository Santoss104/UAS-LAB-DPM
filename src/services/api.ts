// @ts-ignore
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { getAuthToken, setAuthToken } from "../utils/auth";
import { performCleanup } from "../utils/cleanup";

const API_URL = "https://backendbooktrack-production.up.railway.app/api"; 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// LOGIN
export const login = async (username: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    const token = response.data.data.token;

    if (!token) {
      throw new Error("No token received from login");
    }

    await setAuthToken(token);
    return { token };
  } catch (error) {
    const apiError = error as any;

    if (apiError.response?.data?.errors) {
      const errors = apiError.response.data.errors;
      const errorMessages = Object.values(errors).join(", ");
      throw { message: errorMessages };
    }

    if (apiError.response?.data?.message) {
      throw { message: apiError.response.data.message };
    }

    throw { message: "Network error" };
  }
};

// REGISTER
export const register = async (
  username: string,
  password: string,
  email: string
) => {
  try {
    const response = await api.post("/auth/register", {
      username,
      password,
      email,
    });

    if (response.data.message === "User registered successfully") {
      return { message: "Registration successful" };
    } else {
      throw new Error("Registration failed");
    }
  } catch (error) {
    const apiError = error as any;

    if (apiError.response?.data?.errors) {
      const errors = apiError.response.data.errors;
      const errorMessages = Object.values(errors).join(", ");
      throw { message: errorMessages };
    }

    throw apiError.response?.data || { message: "Network error" };
  }
};

// LOGOUT
export const logout = async () => {
  try {
    await performCleanup();

    api.defaults.headers.common["Authorization"] = "";

    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

// GET PROFILE
export const fetchUserProfile = async () => {
  try {
    const response = await api.get("/profile");
    console.log("API Response:", response.data);

    const userData = response.data.data || response.data;

    if (!userData || !userData.username || !userData.email) {
      throw new Error("Invalid profile data received");
    }

    return userData;
  } catch (error) {
    const apiError = error as any;
    console.error("Error in fetchUserProfile:", error);
    throw apiError.response?.data || { message: "Network error" };
  }
};

// UPDATE PROFILE
export const updateProfile = async (data: {
  username: string;
  email: string;
}) => {
  try {
    const response = await api.put("/profile", data);
    return (response.data as { data: any }).data;
  } catch (error) {
    const apiError = error as any;
    console.error("Error updating profile:", apiError.response?.data);
    throw apiError.response?.data || { message: "Network error" };
  }
};

// GET ALL BOOK
export const fetchBooks = async (params?: {
  genre?: string;
  author?: string;
  limit?: number;
  page?: number;
}) => {
  try {
    const response = await api.get("/books", { params });
    return (
      response.data as {
        data: {
          _id: string;
          title: string;
          author: string;
          genre: string;
          description: string;
          userId: string;
          createdAt: string;
          updatedAt: string;
          totalPages: number;
        }[];
      }
    ).data.map((book) => ({
      id: book._id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      userId: book.userId,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      totalPages: book.totalPages,
    }));
  } catch (error) {
    const apiError = error as any;
    console.error("Error fetching books:", apiError.response?.data);
    throw apiError.response?.data || { message: "Network error" };
  }
};

// GET BOOK BY ID
export const fetchBook = async (id: string) => {
  try {
    const response = await api.get(`/books/${id}`);
    return (response.data as { data: any }).data;
  } catch (error) {
    const apiError = error as any;
    console.error(
      `Error fetching book with id ${id}:`,
      apiError.response?.data
    );
    throw apiError.response?.data || { message: "Network error" };
  }
};

// CREATE BOOK
export const createBook = async (book: {
  title: string;
  author: string;
  genre: string;
  description: string;
  totalPages: number;
}) => {
  try {
    const response = await api.post("/books", book);
    return (
      response.data as {
        data: {
          _id: string;
          title: string;
          author: string;
          genre: string;
          userId: string;
          createdAt: string;
          updatedAt: string;
          totalPages: number;
        };
      }
    ).data;
  } catch (error) {
    const apiError = error as any;
    console.error("Error creating book:", apiError.response?.data);
    console.error("Request data:", book);
    throw apiError.response?.data || { message: "Network error" };
  }
};

// UPDATE BOOK
export const updateBook = async (
  id: string,
  book: {
    title: string;
    author: string;
    genre: string;
    description: string;
    totalPages: number;
  }
) => {
  try {
    const response = await api.put(`/books/${id}`, {

      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      totalPages: book.totalPages,
    });
    return (
      response.data as {
        data: {
          _id: string;
          title: string;
          author: string;
          genre: string;
          userId: string;
          createdAt: string;
          updatedAt: string;
          totalPages: number;
        };
      }
    ).data;
  } catch (error) {
    const apiError = error as any;
    console.error(
      `Error updating book with id ${id}:`,
      apiError.response?.data
    );
    throw apiError.response?.data || { message: "Network error" };
  }
};

// DELETE BOOK
export const deleteBook = async (id: string) => {
  try {
    await api.delete(`/books/${id}`);
  } catch (error) {
    const apiError = error as any;
    console.error(
      `Error deleting book with id ${id}:`,
      apiError.response?.data
    );
    throw apiError.response?.data || { message: "Network error" };
  }
};