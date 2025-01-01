import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import {
  Portal,
  Dialog,
  Paragraph,
  Button as PaperButton,
} from "react-native-paper";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Input from "../components/Input";
import Button from "../components/Button";
import { register } from "../services/api";
import { RootStackParamList } from "../types";

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setDialogMessage("Please fill in all fields.");
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await register(username, password, email);
      if (response.message) {
        setDialogMessage("Registration successful! Please login.");
        setVisible(true);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      const apiError = error as any;
      const errorMessage = apiError.message || "Network error";
      setDialogMessage(errorMessage);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogDismiss = () => {
    setVisible(false);
    if (dialogMessage.includes("successful")) {
      navigation.navigate("Login");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us and start tracking your books
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title={loading ? "Creating Account..." : "Create Account"}
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Portal>
          <Dialog
            visible={visible}
            onDismiss={handleDialogDismiss}
            style={styles.dialog}
          >
            <Dialog.Title
              style={[
                styles.dialogTitle,
                {
                  color: dialogMessage.includes("successful")
                    ? "#4CAF50"
                    : "#F44336",
                },
              ]}
            >
              {dialogMessage.includes("successful") ? "Success" : "Error"}
            </Dialog.Title>
            <Dialog.Content>
              <Paragraph style={styles.dialogMessage}>
                {dialogMessage}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton
                onPress={handleDialogDismiss}
                labelStyle={styles.dialogButton}
              >
                OK
              </PaperButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 160 : 40,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    color: "#1A237E",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "800",
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
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  registerButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginButton: {
    marginLeft: 8,
    padding: 4,
  },
  loginButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  dialogButton: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegisterScreen;
