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
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import * as ImagePicker from "expo-image-picker"; // <--- Import Image Picker

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
// FIX: Import the new updateProfile API
import { updateProfile } from "../../service/api/auth"; 

// --- HELPERS ---
const formatDateDisplay = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("vi-VN"); 
};

const CustomInput = ({ label, value, onChangeText, placeholder, keyboardType, editable = true, note }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.labelText}>
      {label} {editable && <Text style={{ color: "red" }}>*</Text>}
    </Text>
    <View style={[styles.inputContainer, !editable && styles.disabledInput]}>
        <TextInput
            style={[styles.input, !editable && { color: "#6B7280" }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            editable={editable}
        />
    </View>
    {note && <Text style={styles.noteText}>{note}</Text>}
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
  const [email] = useState(incoming.email || ""); // Read-only
  const [phone] = useState(incoming.phone || ""); // Read-only
  const [gender, setGender] = useState(getInitialGender(incoming.gender));
  
  // Avatar State
  const [avatarUri, setAvatarUri] = useState(incoming.avatar_url || "https://placehold.co/120x120");
  const [newAvatarAsset, setNewAvatarAsset] = useState(null); // Stores the picked file

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

  const pickImage = async () => {
    // Request permission (optional on newer Android/iOS but good practice)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Chúng tôi cần quyền truy cập thư viện ảnh để thay đổi avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compress image
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri); // Show preview
      setNewAvatarAsset(asset); // Save for upload
    }
  };

  const onSave = async () => {
    // 1️⃣ Validate Name
    if (!name.trim()) {
      Alert.alert("Thiếu thông tin", "Họ và tên không được để trống.");
      return;
    }

    setLoading(true);
    try {
        // Create FormData
        const formData = new FormData();
        
        // Append fields matches updateProfileSchema
        formData.append("full_name", name.trim());
        formData.append("birthday", dob.toISOString());
        formData.append("gender", gender === "Nam" ? "Male" : gender === "Nữ" ? "Female" : "Other");
        
        // Append Avatar if changed
        if (newAvatarAsset) {
            // Get filename or generate one
            let filename = newAvatarAsset.uri.split('/').pop();
            
            // Infer type from extension
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;

            formData.append("avatar", {
                uri: newAvatarAsset.uri,
                name: filename,
                type: type,
            });
        }

        // Call the new API
        await updateProfile(formData);

        Alert.alert("Thành công", "Thông tin đã được cập nhật!", [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);

    } catch (err) {
        console.error("Update Profile Error:", err);
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
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.cameraBtn}
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.changePhotoText}>Chạm vào biểu tượng máy ảnh để đổi ảnh</Text>
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
                    display="default" 
                    maximumDate={new Date()} 
                    onChange={handleDateChange}
                />
            )}

            <Text style={styles.labelText}>
                Giới tính <Text style={{ color: "red" }}>*</Text>
            </Text>
            <GenderChips value={gender} onChange={setGender} />

            <View style={styles.divider} />

            {/* Contact Info (READ ONLY) */}
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

            <CustomInput
                label="Email"
                value={email}
                editable={false}
                placeholder="example@email.com"
                note="Liên hệ quản lý để thay đổi email."
            />

            <CustomInput
                label="Số điện thoại"
                value={phone}
                editable={false}
                placeholder="0912345678"
                note="Liên hệ quản lý để thay đổi số điện thoại."
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
    backgroundColor: colors.brand, 
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", 
    marginTop: -24, 
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
    borderColor: "white",
    elevation: 2
  },
  changePhotoText: {
      marginTop: 8,
      fontSize: 12,
      color: '#6B7280'
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
    backgroundColor: "#F3F4F6", // Gray background for disabled
    borderColor: "#E5E7EB"
  },
  noteText: {
      fontSize: 11,
      color: '#9CA3AF',
      marginTop: 4,
      fontStyle: 'italic'
  },
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
