import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  Portal,
  Dialog,
  Paragraph,
  Button as PaperButton,
} from "react-native-paper";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../services/api";
import { setAuthToken } from "../utils/auth";
import { RootStackParamList } from "../types";

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setDialogMessage("Please fill in all fields");
      setVisible(true);
      return;
    }

    setLoading(true);
    try {
      const { token } = await login(username, password);
      if (token) {
        await setAuthToken(token);
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } else {
        throw new Error("Login failed - no token received");
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
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.registerButton}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Portal>
          <Dialog
            visible={visible}
            onDismiss={() => setVisible(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Error</Dialog.Title>
            <Dialog.Content>
              <Paragraph style={styles.dialogMessage}>
                {dialogMessage}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <PaperButton
                onPress={() => setVisible(false)}
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
    paddingTop: Platform.OS === "ios" ? 250 : 40,
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
  loginButton: {
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#666",
  },
  registerButton: {
    marginLeft: 8,
    padding: 4,
  },
  registerButtonText: {
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
    color: "#F44336",
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

export default LoginScreen;