// src/screens/profile/EditProfileScreen.js
import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  Alert,
  Pressable, StatusBar,
} from "react-native";
import Header from "../../components/Header";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../../contexts/UserContext";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function EditProfileScreen({ route, navigation }) {
  // nhận dữ liệu từ ProfileScreen (nếu có)
  const { userData, userIdLogin, setUserData } = useContext(UserContext);
  const incoming = route?.params?.user;

  const [name, setName] = useState(incoming.name);
  const [dob, setDob] = useState(incoming.dob);
  const [gender, setGender] = useState(incoming.gender);
  const [email, setEmail] = useState(incoming.email);
  const [phone, setPhone] = useState(incoming.phone);
  const [avatar] = useState(incoming.avatar); // demo: chưa cho đổi ảnh

  const onSave = () => {
    // 1️⃣ Kiểm tra trống
    if (!name.trim() || !dob.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ tất cả các trường.");
      return;
    }

    // 2️⃣ Kiểm tra định dạng ngày sinh DD-MM-YYYY hoặc DD/MM/YYYY
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[0-2])[-/]\d{4}$/;
    if (!dobRegex.test(dob.trim())) {
      Alert.alert(
        "Sai định dạng",
        "Ngày sinh phải theo định dạng DD-MM-YYYY (ví dụ: 06-03-1998)."
      );
      return;
    }

    // 3️⃣ Kiểm tra số điện thoại (10 số, bắt đầu bằng 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert(
        "Sai định dạng",
        "Số điện thoại phải gồm 10 số và bắt đầu bằng 0."
      );
      return;
    }

    // 4️⃣ Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Sai định dạng",
        "Email không hợp lệ, vui lòng kiểm tra lại."
      );
      return;
    }

    // 5️⃣ Cập nhật dữ liệu user trong context
    setUserData((prevData) =>
      prevData.map((u) =>
        u.id === userIdLogin
          ? {
              ...u,
              full_name: name.trim(),
              birthday: dob.trim(),
              gender:
                gender === "Nam"
                  ? "male"
                  : gender === "Nữ"
                  ? "female"
                  : "other",
              email: email.trim(),
              phone: phone.trim(),
            }
          : u
      )
    );

    // 6️⃣ Thông báo thành công
    Alert.alert("Đã lưu", "Thông tin đã được cập nhật thành công!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{ paddingBottom: spacing.lg, paddingTop: spacing.xxl }}>
        <Header />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
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
            {/* Avatar + nút đổi ảnh (demo: chưa xử lý chọn ảnh) */}
            <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
              <View>
                <Image
                  source={{ uri: avatar }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                />
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Chọn ảnh (demo)",
                      "Bạn có thể dùng expo-image-picker sau này."
                    )
                  }
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.brand,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Thông tin cơ bản */}
            <Section title="Thông tin cơ bản">
              <TextField
                label="Tên"
                value={name}
                onChangeText={setName}
                placeholder="VD: Nguyễn Văn A"
              />
              <TextField
                label="Ngày sinh"
                value={dob}
                onChangeText={setDob}
                placeholder="VD: 1/1/2000"
              />
              <Text style={{ marginBottom: 6, color: colors.muted }}>
                Giới tính
              </Text>
              <GenderChips value={gender} onChange={setGender} />
            </Section>

            <View style={{ height: spacing.lg }} />

            {/* Thông tin liên hệ */}
            <Section title="Thông tin liên hệ">
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TextField
                label="SĐT"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
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
                title="Quay lại"
                variant="outline"
                onPress={() => navigation.goBack()}
              />
              <Button
                title="Lưu"
                onPress={onSave}
                style={{ backgroundColor: colors.brand }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View>
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

function GenderChips({ value, onChange }) {
  const items = ["Nam", "Nữ", "Khác"];
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: spacing.md }}>
      {items.map((it) => {
        const active = value === it;
        return (
          <Pressable
            key={it}
            onPress={() => onChange(it)}
            style={{
              paddingHorizontal: 14,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: active ? colors.brand : colors.border,
              backgroundColor: active ? "#E6F0FF" : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: active ? colors.brand : colors.text,
                fontWeight: "600",
              }}
            >
              {it}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
