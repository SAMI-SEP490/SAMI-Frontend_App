// Updated: 2025-11-10
// by: GPT-5 (Fix hiển thị dữ liệu + đổi màu chữ)

import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  getVehicleRegistrationById,
  updateVehicleRegistration,
} from "../../service/api/vehicle";

const VEHICLE_TYPES = [
  { label: "Ô tô", value: "car" },
  { label: "Xe máy", value: "motorcycle" },
  { label: "Xe tải", value: "truck" },
  { label: "Xe van", value: "van" },
  { label: "Khác", value: "other" },
];

const EditVehicleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId } = route.params || {};

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    type: "",
    license_plate: "",
    brand: "",
    color: "",
    start_date: today,
    end_date: null,
    note: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // 🔹 Lấy dữ liệu xe theo ID
  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await getVehicleRegistrationById(vehicleId);
      console.log("📦 Vehicle detail:", res);

      let parsedReason = {};
      try {
        parsedReason = res?.reason ? JSON.parse(res.reason) : {};
      } catch (err) {
        console.warn("⚠️ Lỗi parse reason:", err);
      }

      setForm({
        type: parsedReason.type || res.vehicle_type || "",
        license_plate: parsedReason.license_plate || res.license_plate || "",
        brand: parsedReason.brand || res.brand || "",
        color: parsedReason.color || res.color || "",
        start_date: res.start_date ? res.start_date.split("T")[0] : today,
        end_date: res.end_date ? res.end_date.split("T")[0] : null,
        note: res.note || "",
      });
    } catch (err) {
      console.error("❌ Lỗi tải thông tin xe:", err);
      Alert.alert("Lỗi", "Không thể tải thông tin xe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) fetchVehicle();
  }, [vehicleId]);

  const handleSubmit = async () => {
    if (!form.type || !form.license_plate) {
      return Alert.alert(
        "⚠️ Thiếu thông tin",
        "Vui lòng nhập loại xe và biển số."
      );
    }

    try {
      setLoading(true);

      const payload = {
        type: form.type,
        license_plate: form.license_plate,
        brand: form.brand,
        color: form.color,
        start_date: form.start_date,
        end_date: form.end_date,
        note: form.note,
      };

      console.log("📤 Update payload:", payload);
      await updateVehicleRegistration(vehicleId, payload);

      Alert.alert("✅ Thành công", "Cập nhật thông tin xe thành công!", [
        { text: "OK", onPress: () => navigation.navigate("VehicleListScreen") },
      ]);
    } catch (err) {
      console.error("❌ UpdateVehicle Error:", err);
      Alert.alert(
        "❌ Lỗi",
        err?.message || "Không thể cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Chỉnh Sửa Đăng Ký Xe</Text>

        {/* Loại xe */}
        <Text style={styles.label}>Loại xe</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.type || ""}
            onValueChange={(val) => handleChange("type", val)}
            style={{ color: "#000" }}
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
          style={[styles.input, { color: "#000" }]}
          placeholder="VD: 51A-12345"
          value={form.license_plate || ""}
          onChangeText={(text) => handleChange("license_plate", text)}
        />

        {/* Thương hiệu */}
        <Text style={styles.label}>Thương hiệu (tùy chọn)</Text>
        <TextInput
          style={[styles.input, { color: "#000" }]}
          placeholder="VD: Toyota, Honda"
          value={form.brand || ""}
          onChangeText={(text) => handleChange("brand", text)}
        />

        {/* Màu xe */}
        <Text style={styles.label}>Màu xe (tùy chọn)</Text>
        <TextInput
          style={[styles.input, { color: "#000" }]}
          placeholder="VD: Đỏ, Trắng, Xanh"
          value={form.color || ""}
          onChangeText={(text) => handleChange("color", text)}
        />

        {/* Ngày bắt đầu */}
        <Text style={styles.label}>Ngày bắt đầu</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#f2f2f2", color: "#000" }]}
          value={form.start_date || ""}
          editable={false}
        />

        {/* Ngày kết thúc */}
        <Text style={styles.label}>Ngày kết thúc (tùy chọn)</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={[styles.input, { color: "#000" }]}
            placeholder="Chọn ngày kết thúc"
            value={form.end_date || ""}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.end_date ? new Date(form.end_date) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date(today)}
            onChange={handleDateChange}
          />
        )}

        {/* Ghi chú */}
        <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
        <TextInput
          style={[
            styles.input,
            { height: 80, textAlignVertical: "top", color: "#000" },
          ]}
          multiline
          numberOfLines={4}
          placeholder="Nhập ghi chú nếu có..."
          value={form.note || ""}
          onChangeText={(text) => handleChange("note", text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditVehicleScreen;

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
