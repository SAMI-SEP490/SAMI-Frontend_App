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
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { createVehicleRegistration } from "../../service/api/vehicle";

const VEHICLE_TYPES = [
  { label: "Xe 2 bánh", value: "two_wheeler" },
  { label: "Xe 4 bánh", value: "four_wheeler" }
];

// --- HELPER ---
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN"); // DD/MM/YYYY
};

const CreateVehicleScreen = () => {
  const navigation = useNavigation();
  const today = new Date();

  const [form, setForm] = useState({
    vehicle_type: "",
    license_plate: "",
    brand: "",
    color: "",
    start_date: null,
    end_date: null,
    note: "",
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
const LICENSE_PLATE_REGEX =
  /^(?=.{1,10}$)(?=\d{2})(?=.*[A-Z])[0-9A-Z.-]+$/;
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (!selectedDate) return;

    selectedDate.setHours(0, 0, 0, 0);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (selectedDate < todayObj) {
      Alert.alert("Lỗi ngày", "Ngày bắt đầu phải từ hôm nay trở đi.");
      return;
    }

    handleChange("start_date", selectedDate.toISOString().split("T")[0]);

    // 🔥 Reset end_date khi đổi start_date
    handleChange("end_date", null);
  };
  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (!selectedDate) return;

    const startDateObj = new Date(form.start_date);
    startDateObj.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= startDateObj) {
      Alert.alert("Lỗi ngày", "Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    handleChange("end_date", selectedDate.toISOString().split("T")[0]);
  };

  const clearEndDate = () => {
    handleChange("end_date", null);
  }

  const handleSubmit = async () => {
    if (!form.vehicle_type) {
      return Alert.alert("Thiếu thông tin", "Vui lòng chọn loại phương tiện.");
    }
    if (!form.license_plate) {
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập biển số xe.");
    }
if (!LICENSE_PLATE_REGEX.test(form.license_plate.toUpperCase())) {
  return Alert.alert("Biển số xe không đúng định dạng (VD: 30A-123.45)");
}
    setLoading(true);
    try {
      await createVehicleRegistration({
        vehicle_type: form.vehicle_type,
        license_plate: form.license_plate,
        brand: form.brand,
        color: form.color,
        start_date: form.start_date,
        end_date: form.end_date,
        note: form.note,
      });

      Alert.alert("Thành công", "Gửi yêu cầu đăng ký xe thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", err?.message || "Không thể gửi yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Đăng ký xe mới" isHome={false} />

      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          <View style={styles.card}>

            <Text style={styles.label}>Loại phương tiện <Text style={{ color: 'red' }}>*</Text></Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.vehicle_type}
                onValueChange={(val) => handleChange("vehicle_type", val)}
                dropdownIconColor="#111827"
                // FIX 1: Force White Background to avoid Dark Mode issues
                style={{
                  color: '#111827',
                  backgroundColor: 'white',
                  height: Platform.OS === 'ios' ? 200 : 50 // Standard height adjustment
                }}
                // FIX 2: Reduce font size for iOS Wheel
                itemStyle={{ color: '#111827', fontSize: 14, height: 120 }}
              >
                {/* Placeholder */}
                <Picker.Item label="Chọn loại phương tiện..." value="" color="#9CA3AF" style={{ fontSize: 14 }} />

                {VEHICLE_TYPES.map((t) => (
                  <Picker.Item
                    key={t.value}
                    label={t.label}
                    value={t.value}
                    color="#111827"
                    // FIX 3: Reduce font size for Android Dropdown
                    style={{ fontSize: 14, backgroundColor: 'white' }}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Biển số xe <Text style={{ color: 'red' }}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 51A-123.45"
              placeholderTextColor="#9CA3AF"
              value={form.license_plate}
              onChangeText={(text) => handleChange("license_plate", text)}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Thương hiệu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Honda"
                  placeholderTextColor="#9CA3AF"
                  value={form.brand}
                  onChangeText={(text) => handleChange("brand", text)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Màu xe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Đen"
                  placeholderTextColor="#9CA3AF"
                  value={form.color}
                  onChangeText={(text) => handleChange("color", text)}
                />
              </View>
            </View>

            <Text style={styles.label}>Ngày bắt đầu <Text style={{ color: 'red' }}>*</Text></Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={[styles.input, { justifyContent: "center" }]}
            >
              <Text style={{ color: form.start_date ? "#111827" : "#9CA3AF" }}>
                {form.start_date ? formatDateDisplay(form.start_date) : "Chọn ngày bắt đầu"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#9CA3AF"
                style={{ position: "absolute", right: 10, top: 12 }}
              />
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={form.start_date ? new Date(form.start_date) : today}
                mode="date"
                display="default"
                minimumDate={today}
                onChange={handleStartDateChange}
              />
            )}

            <Text style={styles.label}>Ngày kết thúc <Text style={{ color: 'red' }}>*</Text></Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                disabled={!form.start_date}
                onPress={() => setShowEndPicker(true)}
                style={[
                  styles.input,
                  { flex: 1, backgroundColor: form.start_date ? "white" : "#F3F4F6" }
                ]}
              >
                <Text style={{ color: form.end_date ? "#111827" : "#9CA3AF" }}>
                  {form.end_date
                    ? formatDateDisplay(form.end_date)
                    : form.start_date
                      ? "Chọn ngày kết thúc"
                      : "Chọn ngày bắt đầu trước"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#9CA3AF"
                  style={{ position: "absolute", right: 10, top: 12 }}
                />
              </TouchableOpacity>

              {form.end_date && (
                <TouchableOpacity onPress={clearEndDate} style={{ marginLeft: 8 }}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            {showEndPicker && form.start_date && (
              <DateTimePicker
                value={
                  form.end_date
                    ? new Date(form.end_date)
                    : new Date(new Date(form.start_date).getTime() + 86400000)
                }
                mode="date"
                display="default"
                minimumDate={new Date(new Date(form.start_date).getTime() + 86400000)}
                onChange={handleEndDateChange}
              />
            )}

            {showDatePicker && (
              <DateTimePicker
                value={form.end_date ? new Date(form.end_date) : new Date(new Date().getTime() + 86400000)}
                mode="date"
                display="default"
                minimumDate={new Date(new Date().getTime() + 86400000)}
                onChange={handleEndDateChange}
              />
            )}

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              numberOfLines={3}
              placeholder="Nhập ghi chú..."
              placeholderTextColor="#9CA3AF"
              value={form.note}
              onChangeText={(text) => handleChange("note", text)}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    marginTop: -24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "white",
    color: "#111827",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: "white", // Force white wrapper bg
  },
  submitButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20
  },
  submitText: { color: "white", fontSize: 16, fontWeight: "700" },
});

export default CreateVehicleScreen;
