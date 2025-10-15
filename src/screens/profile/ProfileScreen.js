// src/screens/profile/ProfileScreen.js
import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
} from "react-native";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { UserContext } from "../../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const { userData, userIdLogin, setUserIdChangepassword } =
    useContext(UserContext);
  const navigation = useNavigation();
  // dữ liệu DEMO – sau này lấy từ context/API
  const findingUser = userData.find((user) => user.id == userIdLogin);
  console.log(findingUser);

  const user = {
    name: findingUser.full_name,
    dob: findingUser.birthday,
    gender:
      findingUser.gender === "male"
        ? "Nam"
        : findingUser.gender === "female"
        ? "Nữ"
        : "Khác",
    role: findingUser.role,
    email: findingUser.email,
    phone: findingUser.phone,
    avatar: findingUser.avatar_url,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{ paddingBottom: spacing.lg, paddingTop: spacing.xxl }}>
        <Header />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: spacing.lg,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
          </View>

          {/* Thông tin cơ bản */}
          <Section title="Thông tin cơ bản">
            <InfoRow label="Tên" value={user.name} />
            <InfoRow label="Ngày sinh" value={user.dob} />
            <InfoRow label="Giới tính" value={user.gender} />
            <InfoRow label="Vai trò" value={user.role} />
          </Section>

          <View style={{ height: spacing.lg }} />

          {/* Thông tin liên hệ */}
          <Section title="Thông tin liên hệ">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="SĐT" value={user.phone} />
          </Section>

          {/* Nút hành động */}
          <View
            style={{
              flexDirection: "row",
              gap: spacing.md,
              marginTop: spacing.lg,
            }}
          >
            <Button
              title="Thay đổi mật khẩu"
              variant="outline"
              onPress={() => {
                setUserIdChangepassword(userIdLogin);
                navigation.navigate("ChangePasswordScreen");
              }}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: colors.brand,
              }}
            />
            <Button
              title="Sửa"
              variant="filled"
              onPress={() => navigation.navigate("EditProfile", { user })}
              style={{ flex: 1, backgroundColor: colors.brand }}
            />
          </View>
          <Button
            title="Quay lại"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{
              marginTop: spacing.md,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: colors.brand,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View>
      {/* Thanh tiêu đề xanh */}
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: colors.brand,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>{title}</Text>
      </View>

      {/* Khung nội dung */}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          padding: spacing.md,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 8 }}>
      <Text style={{ flex: 1, color: colors.muted }}>{label}:</Text>
      <Text style={{ flex: 1, color: colors.text, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}
