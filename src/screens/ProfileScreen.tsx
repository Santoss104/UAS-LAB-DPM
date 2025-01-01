import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  Portal,
  Dialog,
  TextInput,
  Button as PaperButton,
  ActivityIndicator,
  useTheme,
  Avatar,
} from "react-native-paper";
import { getAuthToken } from "../utils/auth";
import { fetchUserProfile, updateProfile, logout } from "../services/api";
import { RootStackParamList, User } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";

const { width, height } = Dimensions.get("window");

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });
  const theme = useTheme();
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (!loading && user) {
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
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]).start();
    }
  }, [loading, user]);

  const loadUserProfile = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      const profileData = await fetchUserProfile();
      if (!profileData) {
        Alert.alert("Error", "Failed to load profile data");
        return;
      }

      setUser(profileData);
      setFormData({
        username: profileData.username,
        email: profileData.email,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
    };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setUpdateLoading(true);
    try {
      const updatedProfile = await updateProfile({
        username: formData.username,
        email: formData.email,
      });

      setUser(updatedProfile);
      setModalVisible(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
      });
      setModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={80}
              label={user ? getInitials(user.username) : "?"}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={styles.title}>{user?.username}</Text>
          <Text style={styles.subtitle}>Personal Account</Text>
        </Animated.View>

        {user && (
          <Animated.View
            style={[
              styles.profileContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Account Information</Text>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>USERNAME</Text>
                <Text style={styles.value}>{user.username}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoContainer}>
                <Text style={styles.label}>EMAIL</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={openUpdateModal}
                activeOpacity={0.8}
              >
                <Text style={styles.updateButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Edit Profile</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, username: text }))
              }
              error={!!errors.username}
              style={styles.input}
              mode="outlined"
              theme={{
                colors: { primary: theme.colors.primary },
              }}
            />
            {errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
            ) : null}

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              error={!!errors.email}
              style={styles.input}
              mode="outlined"
              theme={{
                colors: { primary: theme.colors.primary },
              }}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <PaperButton
              onPress={() => setModalVisible(false)}
              disabled={updateLoading}
              style={styles.dialogButton}
              labelStyle={[styles.dialogButtonText, styles.cancelButtonText]}
            >
              Cancel
            </PaperButton>
            <PaperButton
              onPress={handleUpdateProfile}
              disabled={updateLoading}
              style={[styles.dialogButton, styles.saveButton]}
              labelStyle={[styles.dialogButtonText, styles.saveButtonText]}
              mode="contained"
            >
              {updateLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                "Save Changes"
              )}
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    paddingTop:
      Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 20) + 20,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    backgroundColor: "#2196F3",
  },
  onlineIndicator: {
    width: 16,
    height: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  profileContainer: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    letterSpacing: 1,
  },
  value: {
    fontSize: 16,
    color: "#1A237E",
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F6F8",
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonContainer: {
    marginTop: 24,
  },
  updateButton: {
    backgroundColor: "#2196F3",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#FF3B30",
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#1A237E",
    paddingTop: 20,
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderRadius: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 8,
  },
  dialogActions: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  dialogButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#666666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
  },
});

export default ProfileScreen;
