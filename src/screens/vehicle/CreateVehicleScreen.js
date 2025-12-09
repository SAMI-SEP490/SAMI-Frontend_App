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
    type: "", 
    license_plate: "",
    brand: "",
    color: "",
    start_date: today,
    end_date: null,
    note: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("end_date", selectedDate.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async () => {
    if (!form.type) {
      return Alert.alert("Thiếu thông tin", "Vui lòng chọn loại phương tiện.");
    }
    if (!form.license_plate) {
      return Alert.alert("Thiếu thông tin", "Vui lòng nhập biển số xe.");
    }
    
    setLoading(true);
    try {
      await createVehicleRegistration(form);
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
            
            <Text style={styles.label}>Loại phương tiện <Text style={{color:'red'}}>*</Text></Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.type}
                onValueChange={(val) => handleChange("type", val)}
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

            <Text style={styles.label}>Biển số xe <Text style={{color:'red'}}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 51A-123.45"
              placeholderTextColor="#9CA3AF"
              value={form.license_plate}
              onChangeText={(text) => handleChange("license_plate", text)}
            />

            <View style={{flexDirection: 'row', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Thương hiệu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Honda"
                        placeholderTextColor="#9CA3AF"
                        value={form.brand}
                        onChangeText={(text) => handleChange("brand", text)}
                    />
                </View>
                <View style={{flex: 1}}>
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

            <Text style={styles.label}>Ngày bắt đầu</Text>
            <View style={[styles.input, { backgroundColor: "#F3F4F6", justifyContent: 'center' }]}>
                <Text style={{color: '#6B7280'}}>{form.start_date}</Text>
            </View>

            <Text style={styles.label}>Ngày kết thúc (Tùy chọn)</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                 <Text style={{color: form.end_date ? '#111827' : '#9CA3AF'}}>
                     {form.end_date || "Chọn ngày kết thúc"}
                 </Text>
                 <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={{position: 'absolute', right: 10, top: 12}} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={form.end_date ? new Date(form.end_date) : new Date()}
                mode="date"
                display="default"
                minimumDate={new Date(today)}
                onChange={handleDateChange}
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
            style={[styles.submitButton, loading && {opacity: 0.7}]} 
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
