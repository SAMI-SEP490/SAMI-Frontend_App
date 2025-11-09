// Updated: 2025-11-09
// by: MinhBH + GPT-5 (improved UX for date fields)

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BASE_URL } from "../../service/http";

const CreateVehicleScreen = () => {
  const navigation = useNavigation();

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  const [form, setForm] = useState({
    type: "",
    license_plate: "",
    brand: "",
    color: "",
    start_date: today, // mặc định hôm nay
    end_date: "",
    note: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleChange("end_date", formattedDate);
    }
  };

  const handleSubmit = async () => {
    if (!form.type || !form.license_plate || !form.brand) {
      Alert.alert(
        "⚠️ Thiếu thông tin",
        "Vui lòng nhập đủ loại xe, biển số và thương hiệu."
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("❌ Lỗi", "Không tìm thấy token. Hãy đăng nhập lại.");
        return;
      }

      const res = await axios.post(`${BASE_URL}/vehicle-registration`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("✅ Thành công", "Gửi yêu cầu đăng ký xe thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("CreateVehicle Error:", err.response?.data || err.message);
      Alert.alert(
        "❌ Lỗi",
        err.response?.data?.message ||
          "Không thể gửi yêu cầu đăng ký xe. Vui lòng thử lại."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Đăng Ký Xe Mới</Text>

        <Text style={styles.label}>Loại xe</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Ô tô, Xe máy..."
          value={form.type}
          onChangeText={(text) => handleChange("type", text)}
        />

        <Text style={styles.label}>Biển số xe</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 51A-12345"
          value={form.license_plate}
          onChangeText={(text) => handleChange("license_plate", text)}
        />

        <Text style={styles.label}>Thương hiệu</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Toyota, Honda..."
          value={form.brand}
          onChangeText={(text) => handleChange("brand", text)}
        />

        <Text style={styles.label}>Màu xe</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Đỏ, Trắng, Xanh..."
          value={form.color}
          onChangeText={(text) => handleChange("color", text)}
        />

        <Text style={styles.label}>Ngày bắt đầu</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f2f2f2" }]}
          value={form.start_date}
          editable={false} // không cho sửa
        />

        <Text style={styles.label}>Ngày kết thúc</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="Chọn ngày kết thúc"
            value={form.end_date}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={form.end_date ? new Date(form.end_date) : new Date()}
            mode="date"
            display="calendar"
            minimumDate={new Date(today)} // không cho chọn ngày trong quá khứ
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          multiline
          numberOfLines={4}
          placeholder="Nhập ghi chú thêm nếu có..."
          value={form.note}
          onChangeText={(text) => handleChange("note", text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateVehicleScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
