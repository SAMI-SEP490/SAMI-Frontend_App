// Updated: 2025-11-10
// By: GPT-5 mini (CreateVehicleScreen refactor)

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
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

import { createVehicleRegistration } from "../../service/api/vehicle";

const VEHICLE_TYPES = [
  { label: "Ô tô", value: "car" },
  { label: "Xe máy", value: "motorcycle" },
  { label: "Xe tải", value: "truck" },
  { label: "Xe van", value: "van" },
  { label: "Khác", value: "other" },
];

const CreateVehicleScreen = () => {
  const navigation = useNavigation();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    type: "", // enum: car, motorcycle, ...
    license_plate: "",
    brand: "",
    color: "",
    start_date: today,
    end_date: null, // null nếu chưa chọn
    note: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("end_date", selectedDate.toISOString().split("T")[0]);
    } else {
      handleChange("end_date", null);
    }
  };

  const handleSubmit = async () => {
    if (!form.type || !form.license_plate) {
      return Alert.alert(
        "⚠️ Thiếu thông tin",
        "Vui lòng nhập loại xe và biển số."
      );
    }

    try {
      const token = await SecureStore.getItemAsync("sami_access_token");
      if (!token) return Alert.alert("❌ Lỗi", "Không tìm thấy token.");

      // Gửi form lên API
      await createVehicleRegistration(form);

      Alert.alert("✅ Thành công", "Gửi yêu cầu đăng ký xe thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("CreateVehicle Error:", err);
      Alert.alert(
        "❌ Lỗi",
        err?.message || "Không thể gửi yêu cầu. Vui lòng thử lại."
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

        {/* Loại xe */}
        <Text style={styles.label}>Loại xe</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.type}
            onValueChange={(val) => handleChange("type", val)}
          >
            <Picker.Item label="Chọn loại xe" value="" />
            {VEHICLE_TYPES.map((t) => (
              <Picker.Item key={t.value} label={t.label} value={t.value} />
            ))}
          </Picker>
        </View>

        {/* Biển số */}
        <Text style={styles.label}>Biển số xe</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: 51A-12345"
          value={form.license_plate}
          onChangeText={(text) => handleChange("license_plate", text)}
        />

        {/* Thương hiệu */}
        <Text style={styles.label}>Thương hiệu (tùy chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Toyota, Honda"
          value={form.brand}
          onChangeText={(text) => handleChange("brand", text)}
        />

        {/* Màu xe */}
        <Text style={styles.label}>Màu xe (tùy chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Đỏ, Trắng, Xanh"
          value={form.color}
          onChangeText={(text) => handleChange("color", text)}
        />

        {/* Ngày bắt đầu */}
        <Text style={styles.label}>Ngày bắt đầu</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f2f2f2" }]}
          value={form.start_date}
          editable={false}
        />

        {/* Ngày kết thúc */}
        <Text style={styles.label}>Ngày kết thúc (tùy chọn)</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="Chọn ngày kết thúc"
            value={form.end_date ?? ""}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.end_date ? new Date(form.end_date) : new Date()}
            mode="date"
            display="calendar"
            minimumDate={new Date(today)}
            onChange={handleDateChange}
          />
        )}

        {/* Ghi chú */}
        <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          multiline
          numberOfLines={4}
          placeholder="Nhập ghi chú nếu có..."
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
  container: { padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { fontWeight: "600", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 5,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16 },
});
