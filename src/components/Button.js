import React from "react";
import { Pressable, Text } from "react-native";

export default function Button({ title, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          height: 48,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: disabled ? "#aaa" : "#2e7d32",
          paddingHorizontal: 16,
        },
        style,
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}
