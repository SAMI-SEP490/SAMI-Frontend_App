// Updated: 2025-11-08
// By: MinhBH
// src/screens/maintenance/CreateMaintenanceRequestScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import RNPickerSelect from "react-native-picker-select";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getRoomsByUserId } from "../../service/api/room";
import { createMaintenanceRequest } from "../../service/api/maintenance";

const maintenanceTypes = [
  { key: "plumbing", label: "Điện nước" },
  { key: "electrical", label: "Điện" },
  { key: "hvac", label: "Điều hòa" },
  { key: "carpentry", label: "Mộc" },
  { key: "cleaning", label: "Vệ sinh" },
  { key: "other", label: "Khác" },
];

const priorityLevels = [
  { key: "low", label: "Thấp" },
  { key: "normal", label: "Bình thường" },
  { key: "high", label: "Cao" },
  { key: "urgent", label: "Khẩn cấp" },
];

const CreateMaintenanceRequestScreen = () => {
  const navigation = useNavigation();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [roomInfo, setRoomInfo] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null); // Loại bảo trì
  const [priority, setPriority] = useState("low"); // Mặc định "low"
  const [note, setNote] = useState(""); // Bắt buộc

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync("sami_access_token");
      if (!storedToken) {
        Alert.alert(
          "Lỗi",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
        return;
      }
      setToken(storedToken);

      try {
        const decoded = jwtDecode(storedToken);
        const userId = decoded?.id || decoded?.userId;
        if (!userId) throw new Error("Token không hợp lệ");

        const roomRes = await getRoomsByUserId(userId);
        const currentRoom = roomRes.data?.current_room;
        if (!currentRoom) {
          Alert.alert("Lỗi", "User chưa được gán phòng");
          return;
        }
        setRoomId(currentRoom.room_id);
        setRoomInfo(currentRoom);
      } catch (err) {
        console.error("❌ Lỗi khi lấy phòng:", err);
        Alert.alert("Lỗi", "Không thể lấy thông tin phòng");
      }
    };
    loadToken();
  }, []);

  const handleSubmit = async () => {
    if (!title || !description || !category || !note) {
      Alert.alert(
        "Lỗi",
        "Vui lòng điền đầy đủ thông tin bắt buộc, bao gồm ghi chú"
      );
      return;
    }
    if (!roomId) {
      Alert.alert("Lỗi", "Phòng chưa được xác định");
      return;
    }

    setLoading(true);
    try {
      await createMaintenanceRequest({
        room_id: roomId,
        title,
        description,
        category,
        priority,
        note,
      });

      Alert.alert("Thành công", "Yêu cầu bảo trì đã được tạo", [
        {
          text: "OK",
          onPress: () => navigation.navigate("MaintenanceListScreen"),
        },
      ]);
    } catch (err) {
      console.error("❌ Lỗi khi tạo yêu cầu:", err);
      // Nếu backend trả về message
      const message =
        err.response?.data?.message || err.message || "Không thể tạo yêu cầu bảo trì";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tạo yêu cầu bảo trì</Text>

        {roomInfo.room_number && (
          <Text style={styles.roomText}>
            Phòng hiện tại: {roomInfo.room_number} - {roomInfo.building_name}
          </Text>
        )}

        <Text style={styles.label}>Tiêu đề *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Mô tả *</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Nhập mô tả chi tiết"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Loại bảo trì *</Text>
        <RNPickerSelect
          onValueChange={(value) => setCategory(value)}
          value={category}
          placeholder={{ label: "Chọn loại bảo trì...", value: null }}
          items={maintenanceTypes.map((t) => ({ label: t.label, value: t.key }))}
          style={{
            inputIOS: styles.pickerInput,
            inputAndroid: styles.pickerInput,
            placeholder: { color: "#999" },
          }}
        />
        {category && (
          <Text style={styles.selectedText}>
            Đã chọn: {maintenanceTypes.find((t) => t.key === category)?.label}
          </Text>
        )}

        <Text style={styles.label}>Mức độ ưu tiên</Text>
        <RNPickerSelect
          onValueChange={(value) => setPriority(value)}
          value={priority}
          placeholder={{}}
          items={priorityLevels.map((p) => ({ label: p.label, value: p.key }))}
          style={{
            inputIOS: styles.pickerInput,
            inputAndroid: styles.pickerInput,
          }}
        />
        {priority && (
          <Text style={styles.selectedText}>
            Đã chọn: {priorityLevels.find((p) => p.key === priority)?.label}
          </Text>
        )}

        <Text style={styles.label}>Ghi chú *</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Nhập ghi chú"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Tạo yêu cầu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  roomText: { fontSize: 16, marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: "bold" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  pickerInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  selectedText: { fontSize: 14, color: "#333", marginBottom: 16 },
  submitButton: {
    backgroundColor: colors.brand,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default CreateMaintenanceRequestScreen;
