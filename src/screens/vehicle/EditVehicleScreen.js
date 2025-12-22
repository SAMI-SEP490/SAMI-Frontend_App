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
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import {
  getVehicleRegistrationById,
  updateVehicleRegistration,
  cancelVehicleRegistration,
} from "../../service/api/vehicle";

const VEHICLE_TYPES = [
  { label: "Ô tô", value: "car" },
  { label: "Xe máy", value: "motorcycle" },
  { label: "Xe tải", value: "truck" },
  { label: "Xe van", value: "van" },
  { label: "Khác", value: "other" },
];

// --- HELPER ---
const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN"); // DD/MM/YYYY
};

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
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false); 

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    const startDateObj = new Date(form.start_date);
    startDateObj.setHours(0,0,0,0);
    selectedDate.setHours(0,0,0,0);

    if (selectedDate <= startDateObj) {
        Alert.alert("Lỗi ngày", "Ngày kết thúc phải sau ngày bắt đầu.");
        return;
    }
    handleChange("end_date", selectedDate.toISOString().split("T")[0]);
  };

  const clearEndDate = () => handleChange("end_date", null);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await getVehicleRegistrationById(vehicleId);
      const data = res?.data?.registration || res?.registration || res;

      let details = {};
      try {
        if (data.reason && typeof data.reason === 'string') {
            if (data.reason.trim().startsWith('{')) {
                details = JSON.parse(data.reason);
            }
        }
      } catch (err) {
        console.log("Error parsing vehicle JSON:", err);
      }

      setForm({
        type: details.type || "motorcycle",
        license_plate: details.license_plate || "",
        brand: details.brand || "",
        color: details.color || "",
        start_date: data.start_date ? data.start_date.split("T")[0] : today,
        end_date: data.end_date ? data.end_date.split("T")[0] : null,
        note: data.note || "",
      });

    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải thông tin xe.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) fetchVehicle();
  }, [vehicleId]);

  // --- SAVE HANDLER ---
  const handleSubmit = async () => {
    if (!form.type || !form.license_plate) {
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập loại xe và biển số.");
    }
    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        license_plate: form.license_plate,
        brand: form.brand,
        color: form.color,
        start_date: form.start_date,
        end_date: form.end_date,
        note: form.note,
      };
      
      await updateVehicleRegistration(vehicleId, payload);
      Alert.alert("Thành công", "Cập nhật thông tin xe thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", err?.message || "Không thể cập nhật.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- CANCEL HANDLER ---
  const handleCancel = () => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc chắn muốn hủy yêu cầu đăng ký xe này không? Hành động này không thể hoàn tác.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Đồng ý hủy",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              // Passing a generic reason
              await cancelVehicleRegistration(vehicleId, { reason: "Người dùng tự hủy qua App" });
              Alert.alert("Đã hủy", "Yêu cầu đăng ký xe đã được hủy thành công.", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);
            } catch (err) {
              Alert.alert("Lỗi", err?.message || "Không thể hủy đơn.");
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chỉnh sửa" isHome={false} />
        <View style={[styles.contentContainer, {alignItems: 'center', justifyContent: 'center'}]}>
             <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Chỉnh sửa xe" isHome={false} />

      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            {/* Loại xe */}
            <Text style={styles.label}>Loại phương tiện</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.type}
                onValueChange={(val) => handleChange("type", val)}
                dropdownIconColor="#111827"
                style={{ color: '#111827', backgroundColor: 'white', height: Platform.OS === 'ios' ? 200 : 50 }}
                itemStyle={{ color: '#111827', fontSize: 14, height: 120 }}
              >
                <Picker.Item label="Chọn loại phương tiện..." value="" color="#9CA3AF" style={{fontSize: 14}} />
                {VEHICLE_TYPES.map((t) => (
                  <Picker.Item key={t.value} label={t.label} value={t.value} color="#111827" style={{fontSize: 14, backgroundColor: 'white'}} />
                ))}
              </Picker>
            </View>

            {/* Biển số */}
            <Text style={styles.label}>Biển số xe</Text>
            <TextInput
              style={styles.input}
              value={form.license_plate}
              placeholder="VD: 51A-123.45"
              placeholderTextColor="#9CA3AF"
              onChangeText={(text) => handleChange("license_plate", text)}
            />

            <View style={{flexDirection: 'row', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Thương hiệu</Text>
                    <TextInput
                        style={styles.input}
                        value={form.brand}
                        placeholder="Honda"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={(text) => handleChange("brand", text)}
                    />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Màu xe</Text>
                    <TextInput
                        style={styles.input}
                        value={form.color}
                        placeholder="Đen"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={(text) => handleChange("color", text)}
                    />
                </View>
            </View>

            {/* Ngày bắt đầu */}
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <View style={[styles.input, { backgroundColor: "#F3F4F6", justifyContent: 'center' }]}>
                {/* FIX: Use helper function */}
                <Text style={{color: '#6B7280'}}>{formatDateDisplay(form.start_date)}</Text>
            </View>

            <Text style={styles.label}>Ngày kết thúc</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, {flex: 1}]}>
                    <Text style={{color: form.end_date ? '#111827' : '#9CA3AF'}}>
                        {/* FIX: Use helper function */}
                        {form.end_date ? formatDateDisplay(form.end_date) : "Chọn ngày"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={{position: 'absolute', right: 10, top: 12}} />
                </TouchableOpacity>
                {form.end_date && (
                    <TouchableOpacity onPress={clearEndDate} style={{marginLeft: 8, padding: 4}}>
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
            {showDatePicker && (
                <DateTimePicker 
                    value={form.end_date ? new Date(form.end_date) : new Date(new Date().getTime() + 86400000)} 
                    mode="date" 
                    minimumDate={new Date(new Date().getTime() + 86400000)} 
                    onChange={handleDateChange} 
                />
            )}

            {/* Ghi chú */}
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              numberOfLines={3}
              value={form.note}
              placeholder="Nhập ghi chú..."
              placeholderTextColor="#9CA3AF"
              onChangeText={(text) => handleChange("note", text)}
            />
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity 
                style={[styles.submitButton, (submitting || cancelling) && {opacity: 0.7}]} 
                onPress={handleSubmit}
                disabled={submitting || cancelling}
            >
                {submitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.submitText}>Lưu thay đổi</Text>
                )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity 
                style={[styles.cancelButton, (submitting || cancelling) && {opacity: 0.7}]} 
                onPress={handleCancel}
                disabled={submitting || cancelling}
            >
                {cancelling ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.cancelButtonText}>Hủy đơn này</Text>
                )}
            </TouchableOpacity>
          </View>

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
    marginBottom: 24
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
    backgroundColor: 'white'
  },
  // Submit Button (Blue)
  submitButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2
  },
  submitText: { color: "white", fontSize: 16, fontWeight: "700" },
  
  // Cancel Button (Red)
  cancelButton: {
    backgroundColor: "#EF4444", // Red
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2
  },
  cancelButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
});

export default EditVehicleScreen;
