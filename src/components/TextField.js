import React from "react";
import { TextInput, View, Text } from "react-native";

export default function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  placeholder,
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? (
        <Text style={{ marginBottom: 6, fontWeight: "500" }}>{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 44,
        }}
      />
    </View>
  );
}
