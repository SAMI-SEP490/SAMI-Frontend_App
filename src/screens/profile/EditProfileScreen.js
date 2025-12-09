import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  Alert,
  Pressable,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker"; // <-- Import Picker

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { updateUser } from "../../service/api/user";

// --- HELPERS ---

// Format Date Object -> "DD/MM/YYYY" for display
const formatDateDisplay = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("vi-VN"); // e.g. 10/03/2000
};

const CustomInput = ({ label, value, onChangeText, placeholder, keyboardType, editable = true }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.labelText}>
      {label} <Text style={{ color: "red" }}>*</Text>
    </Text>
    <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            editable={editable}
        />
    </View>
  </View>
);

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const incoming = route?.params?.user || {};

  // Parse initial Gender
  const getInitialGender = (g) => {
      const lower = String(g).toLowerCase();
      if (lower === 'male' || lower === 'nam') return 'Nam';
      if (lower === 'female' || lower === 'nữ') return 'Nữ';
      return 'Khác';
  };

  // --- STATE ---
  const [name, setName] = useState(incoming.full_name || incoming.name || "");
  const [email, setEmail] = useState(incoming.email || "");
  const [phone, setPhone] = useState(incoming.phone || "");
  const [gender, setGender] = useState(getInitialGender(incoming.gender));
  const [avatar] = useState(incoming.avatar_url || "https://placehold.co/120x120");

  // Date Logic
  const [dob, setDob] = useState(incoming.birthday ? new Date(incoming.birthday) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // --- HANDLERS ---

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const onSave = async () => {
    // 1️⃣ Validate Empty
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ tất cả các trường.");
      return;
    }

    // 2️⃣ Validate Phone
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert("Sai định dạng", "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.");
      return;
    }

    // 3️⃣ Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Sai định dạng", "Email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
        const payload = {
            full_name: name.trim(),
            birthday: dob.toISOString(), // Send ISO format to backend
            gender: gender === "Nam" ? "male" : gender === "Nữ" ? "female" : "other",
            email: email.trim(),
            phone: phone.trim()
        };

        await updateUser(incoming.user_id || incoming.id, payload);

        Alert.alert("Thành công", "Thông tin đã được cập nhật!", [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);

    } catch (err) {
        console.error("Update User Error:", err);
        Alert.alert("Lỗi", err.message || "Không thể cập nhật thông tin.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Chỉnh sửa hồ sơ" isHome={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentContainer}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card */}
          <View style={styles.card}>
            
            {/* Avatar Section */}
            <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
              <View>
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatar}
                />
                <Pressable
                  onPress={() => Alert.alert("Tính năng đang phát triển", "Chức năng tải ảnh sẽ sớm ra mắt.")}
                  style={styles.cameraBtn}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Basic Info */}
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <CustomInput
                label="Họ và tên"
                value={name}
                onChangeText={setName}
                placeholder="Nguyễn Văn A"
            />
            
            {/* Date Picker Input */}
            <View style={{ marginBottom: 12 }}>
                <Text style={styles.labelText}>
                    Ngày sinh <Text style={{ color: "red" }}>*</Text>
                </Text>
                <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)} 
                    style={styles.dateInput}
                >
                    <Text style={{color: '#111827', fontSize: 14}}>
                        {formatDateDisplay(dob)}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={{position: 'absolute', right: 12}} />
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default" // Android default picker
                    maximumDate={new Date()} // Can't be born in the future
                    onChange={handleDateChange}
                />
            )}

            <Text style={styles.labelText}>
                Giới tính <Text style={{ color: "red" }}>*</Text>
            </Text>
            <GenderChips value={gender} onChange={setGender} />

            <View style={styles.divider} />

            {/* Contact Info */}
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

            {/* Note: Often email/phone are unique keys, be careful letting users edit them without OTP verification */}
            <CustomInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
            />

            <CustomInput
                label="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                placeholder="0912345678"
                keyboardType="phone-pad"
            />

          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12, marginTop: 10 }}>
            <Pressable
                onPress={onSave}
                disabled={loading}
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Lưu thay đổi</Text>}
            </Pressable>

            <Pressable
                onPress={() => navigation.goBack()}
                disabled={loading}
                style={styles.cancelBtn}
            >
                <Text style={[styles.btnText, { color: colors.brand }]}>Hủy bỏ</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Gender Selection Component
function GenderChips({ value, onChange }) {
  const items = ["Nam", "Nữ", "Khác"];
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
      {items.map((it) => {
        const active = value === it;
        return (
          <Pressable
            key={it}
            onPress={() => onChange(it)}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: active ? colors.brand : "#E5E7EB",
              backgroundColor: active ? "#EFF6FF" : "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{
                color: active ? colors.brand : "#374151",
                fontWeight: active ? "700" : "500",
                fontSize: 14
            }}>
              {it}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue Background
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray Sheet
    marginTop: -24, // Overlap Header
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24, 
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#F3F4F6"
  },
  cameraBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    marginTop: 8
  },
  labelText: {
    fontSize: 13, 
    fontWeight: "600", 
    color: "#374151", 
    marginBottom: 6 
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "white",
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
  },
  // Mimics TextInput but touchable
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center'
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827"
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16
  },
  saveBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2
  },
  cancelBtn: {
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brand
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white"
  }
});
