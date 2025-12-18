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
  KeyboardAvoidingView,
  Platform
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { updateMaintenanceRequest, getMaintenanceRequestById } from "../../service/api/maintenance";

const maintenanceTypes = [
  { key: "plumbing", label: "Ống nước" },
  { key: "electrical", label: "Điện" },
  { key: "hvac", label: "Điều hòa" },
  { key: "carpentry", label: "Mộc" },
  { key: "structural", label: "Kết cấu" },
  { key: "cleaning", label: "Vệ sinh" },
  { key: "other", label: "Khác" },
];

const priorityLevels = [
  { key: "low", label: "Thấp" },
  { key: "normal", label: "Bình thường" },
  { key: "high", label: "Cao" },
  { key: "urgent", label: "Khẩn cấp" },
];

// Translation Map
const maintenanceStatus = {
  pending: "Đang chờ",
  in_progress: "Đang xử lý",
  on_hold: "Tạm hoãn",
  resolved: "Đã xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Từ chối"
};

const UpdateMaintenanceRequestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestData, setRequestData] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [priority, setPriority] = useState("low");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const res = await getMaintenanceRequestById(requestId);
      const data = res.data;
      setRequestData(data);

      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setPriority(data.priority);
      setNote(data.note || "");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải thông tin yêu cầu.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title || !description || !category) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);
    try {
      await updateMaintenanceRequest(requestId, {
        title,
        description,
        category,
        priority,
        note,
      });

      Alert.alert("Thành công", "Cập nhật yêu cầu thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể cập nhật yêu cầu.";
      Alert.alert("Lỗi", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết yêu cầu" isHome={false} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </View>
    );
  }

  const isEditable = requestData?.status === 'pending';
  const statusLabel = maintenanceStatus[requestData?.status] || requestData?.status;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title={isEditable ? "Cập nhật yêu cầu" : "Chi tiết yêu cầu"} isHome={false} />

      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <Text style={styles.statusLabel}>
                Trạng thái: <Text style={{fontWeight: 'bold', color: colors.brand}}>{statusLabel}</Text>
            </Text>

            <Text style={styles.label}>Tiêu đề <Text style={{color:'red'}}>*</Text></Text>
            <TextInput
              style={[styles.input, !isEditable && styles.disabledInput]}
              value={title}
              onChangeText={setTitle}
              editable={isEditable}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Loại bảo trì <Text style={{color:'red'}}>*</Text></Text>
            <View style={[styles.pickerWrapper, !isEditable && styles.disabledInput]}>
                <RNPickerSelect
                    onValueChange={(value) => setCategory(value)}
                    value={category}
                    placeholder={{ label: "Chọn loại...", value: null }}
                    items={maintenanceTypes.map((t) => ({ label: t.label, value: t.key }))}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    disabled={!isEditable}
                    Icon={() => <Ionicons name="chevron-down" size={20} color="#9CA3AF" style={{marginTop: 12, marginRight: 10}} />}
                />
            </View>

            <Text style={styles.label}>Mức độ ưu tiên</Text>
            <View style={[styles.pickerWrapper, !isEditable && styles.disabledInput]}>
                <RNPickerSelect
                    onValueChange={(value) => setPriority(value)}
                    value={priority}
                    placeholder={{}}
                    items={priorityLevels.map((p) => ({ label: p.label, value: p.key }))}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    disabled={!isEditable}
                    Icon={() => <Ionicons name="chevron-down" size={20} color="#9CA3AF" style={{marginTop: 12, marginRight: 10}} />}
                />
            </View>

            <Text style={styles.label}>Mô tả chi tiết <Text style={{color:'red'}}>*</Text></Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }, !isEditable && styles.disabledInput]}
              value={description}
              onChangeText={setDescription}
              multiline
              editable={isEditable}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Ghi chú thêm</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }, !isEditable && styles.disabledInput]}
              value={note}
              onChangeText={setNote}
              multiline
              editable={isEditable}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {isEditable && (
            <TouchableOpacity 
                style={[styles.submitButton, submitting && {opacity: 0.7}]} 
                onPress={handleUpdate}
                disabled={submitting}
            >
                {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Lưu thay đổi</Text>}
            </TouchableOpacity>
          )}

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
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  statusLabel: { fontSize: 14, marginBottom: 12, color: "#4B5563", alignSelf: 'flex-end' },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600", color: "#374151", marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280"
  },
  pickerWrapper: { marginBottom: 0 },
  submitButton: {
    backgroundColor: colors.brand,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    color: '#111827',
    paddingRight: 30,
    backgroundColor: 'white',
    marginBottom: 0
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    color: '#111827',
    paddingRight: 30,
    backgroundColor: 'white',
    marginBottom: 0
  },
});

export default UpdateMaintenanceRequestScreen;
