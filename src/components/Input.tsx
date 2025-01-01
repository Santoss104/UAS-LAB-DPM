import React from "react";
import { TextInput, TextInputProps, StyleSheet, Platform } from "react-native";

export interface InputProps extends Omit<TextInputProps, "style"> {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  ...props
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholderTextColor="#9E9E9E"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A237E",
    width: "100%",
    ...Platform.select({
      ios: {
        height: 48,
      },
      android: {
        height: 48,
        paddingVertical: 8,
      },
    }),
  },
});

export default Input;
