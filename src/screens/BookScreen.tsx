import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  fetchBooks,
  createBook,
  updateBook,
  deleteBook,
  fetchBook,
} from "../services/api";
import { Book } from "../types";
import { RootStackParamList } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BookScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    totalPages: "0",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [addButtonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, [books]);

  const handlePressIn = () => {
    Animated.spring(addButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(addButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

const loadBooks = async () => {
  try {
    const booksData = await fetchBooks();
    setBooks(
      booksData.map((book) => ({
        _id: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        totalPages:
          typeof book.totalPages === "number"
            ? book.totalPages
            : parseInt(String(book.totalPages)) || 0,
        userId: book.userId || "",
        createdAt: book.createdAt || new Date().toISOString(),
        updatedAt: book.updatedAt || new Date().toISOString(),
      }))
    );
  } catch (err) {
    const apiError = err as any;
    setError(apiError.message || "Failed to load books");
  }
};

  const handleInputChange = (name: string, value: string) => {
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

const handleAddBook = async () => {
  try {
    const bookData = {
      title: newBook.title,
      author: newBook.author,
      genre: newBook.genre,
      description: newBook.description,
      totalPages: parseInt(newBook.totalPages) || 0,
      userId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const addedBook = await createBook(bookData);

    const formattedBook: Book = {
      _id: addedBook._id,
      title: addedBook.title,
      author: addedBook.author,
      genre: addedBook.genre,
      description: bookData.description,
      totalPages: addedBook.totalPages,
      userId: addedBook.userId || "",
      createdAt: addedBook.createdAt || new Date().toISOString(),
      updatedAt: addedBook.updatedAt || new Date().toISOString(),
    };

    setBooks((prev) => [...prev, formattedBook]);
    setNewBook({
      title: "",
      author: "",
      genre: "",
      description: "",
      totalPages: "0",
    });
    setIsModalVisible(false);
  } catch (err) {
    console.error("Error adding book:", err);
    setError("Failed to add book");
  }
};

  const handleUpdateBook = async () => {
    if (!selectedBook) return;

    try {
      const totalPages = Number(selectedBook.totalPages);
      if (isNaN(totalPages) || totalPages < 0) {
        setError("Please enter a valid number of pages");
        return;
      }

      const bookData = {
        title: selectedBook.title,
        author: selectedBook.author,
        genre: selectedBook.genre,
        description: selectedBook.description,
        totalPages: parseInt(String(selectedBook.totalPages)) || 0,
      };

      const updatedBook = await updateBook(selectedBook._id, bookData);

      const formattedBook: Book = {
        _id: updatedBook._id,
        title: updatedBook.title,
        author: updatedBook.author,
        genre: updatedBook.genre,
        description: bookData.description,
        totalPages: updatedBook.totalPages,
        userId: updatedBook.userId || "",
        createdAt: updatedBook.createdAt || new Date().toISOString(),
        updatedAt: updatedBook.updatedAt || new Date().toISOString(),
      };

      setBooks((prev) =>
        prev.map((book) =>
          book._id === formattedBook._id ? formattedBook : book
        )
      );
      setSelectedBook(null);
      setIsEditing(false);
      setIsModalVisible(false);
    } catch (err) {
      console.error("Error updating book:", err);
      setError("Failed to update book");
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBook(id);
      setBooks((prev) => prev.filter((book) => book._id !== id));
    } catch (err) {
      setError("Failed to delete book");
    }
  };

const handleEditBook = async (id: string) => {
  try {
    const bookData = await fetchBook(id);

    if (bookData) {
      const totalPages =
        bookData.totalPages && !isNaN(Number(bookData.totalPages))
          ? Number(bookData.totalPages)
          : bookData.total_pages
          ? Number(bookData.total_pages)
          : 0;

      const formattedBook: Book = {
        _id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre,
        description: bookData.description,
        totalPages: totalPages,
        userId: bookData.userId,
        createdAt: bookData.createdAt,
        updatedAt: bookData.updatedAt,
      };
      setSelectedBook(formattedBook);
      setIsEditing(true);
      setIsModalVisible(true);
    }
  } catch (err) {
    const apiError = err as any;
    setError(apiError.message || "Failed to fetch book details");
  }
};

  const renderBookCard = (book: Book, index: number) => {
    return (
      <Animated.View
        key={book._id}
        style={[
          styles.bookCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.bookContent}>
          <View style={styles.bookHeader}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <View style={styles.bookActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditBook(book._id)}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteBook(book._id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.bookDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Author</Text>
              <Text style={styles.detailValue}>{book.author}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Genre</Text>
              <Text style={styles.detailValue}>{book.genre}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pages</Text>
              <Text style={styles.detailValue}>
                {book.totalPages ? book.totalPages.toString() : "0"}
              </Text>
            </View>
          </View>
          {book.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{book.description}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.header}>My Library</Text>
          <Text style={styles.subtitle}>Manage your book collection</Text>
        </Animated.View>

        {error && (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            setIsEditing(false);
            setNewBook({
              title: "",
              author: "",
              genre: "",
              description: "",
              totalPages: "0",
            });
            setIsModalVisible(true);
          }}
        >
          <Animated.View
            style={[
              styles.addButton,
              {
                transform: [{ scale: addButtonScale }],
              },
            ]}
          >
            <Text style={styles.addButtonText}>Add New Book</Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.bookList}>
          {books.map((book, index) => renderBookCard(book, index))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit Book" : "Add New Book"}
            </Text>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                value={isEditing ? selectedBook?.title : newBook.title}
                onChangeText={(value) =>
                  isEditing
                    ? setSelectedBook({ ...selectedBook!, title: value })
                    : handleInputChange("title", value)
                }
                placeholder="Title"
                placeholderTextColor="#9E9E9E"
              />
              <TextInput
                style={styles.input}
                value={isEditing ? selectedBook?.author : newBook.author}
                onChangeText={(value) =>
                  isEditing
                    ? setSelectedBook({ ...selectedBook!, author: value })
                    : handleInputChange("author", value)
                }
                placeholder="Author"
                placeholderTextColor="#9E9E9E"
              />
              <TextInput
                style={styles.input}
                value={isEditing ? selectedBook?.genre : newBook.genre}
                onChangeText={(value) =>
                  isEditing
                    ? setSelectedBook({ ...selectedBook!, genre: value })
                    : handleInputChange("genre", value)
                }
                placeholder="Genre"
                placeholderTextColor="#9E9E9E"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={
                  isEditing ? selectedBook?.description : newBook.description
                }
                onChangeText={(value) =>
                  isEditing
                    ? setSelectedBook({ ...selectedBook!, description: value })
                    : handleInputChange("description", value)
                }
                placeholder="Description"
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TextInput
                style={styles.input}
                value={
                  isEditing
                    ? String(selectedBook?.totalPages)
                    : newBook.totalPages
                }
                onChangeText={(value) =>
                  isEditing
                    ? setSelectedBook({
                        ...selectedBook!,
                        totalPages: parseInt(value) || 0,
                      })
                    : handleInputChange("totalPages", value)
                }
                placeholder="Total Pages"
                placeholderTextColor="#9E9E9E"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={isEditing ? handleUpdateBook : handleAddBook}
              >
                <Text style={styles.buttonText}>
                  {isEditing ? "Update Book" : "Add Book"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  header: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1A237E",
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "sans-serif-medium" },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    letterSpacing: 0.5,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#2196F3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  bookList: {
    gap: 16,
  },
  bookCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  bookContent: {
    padding: 20,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A237E",
    flex: 1,
    marginRight: 16,
  },
  bookActions: {
    flexDirection: "row",
    gap: 8,
  },
  bookDetails: {
    backgroundColor: "#F5F6F8",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#1A237E",
    fontWeight: "500",
  },
  noPages: {
    color: "#999",
    fontStyle: "italic",
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 24,
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: "#F5F6F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1A237E",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#2196F3",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default BookScreen;
