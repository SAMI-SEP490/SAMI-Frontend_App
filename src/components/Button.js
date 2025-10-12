// src/components/Button.js
import React from "react";
import { Pressable, Text } from "react-native";
import { colors } from "../theme/colors";

export default function Button({
  title,
  onPress,
  disabled,
  style,
  textStyle,
  color = colors.brand, // màu chủ đạo
  variant = "filled", // 'filled' | 'outline'
}) {
  const isOutline = variant === "outline";

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
          paddingHorizontal: 16,
          backgroundColor: isOutline
            ? "transparent"
            : disabled
            ? "#aaa"
            : color,
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline ? color : "transparent",
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          { fontWeight: "700", color: isOutline ? color : "#fff" },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
