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
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getRoomsByUserId } from "../../service/api/room";
import { createMaintenanceRequest } from "../../service/api/maintenance";
import { useAuthStore } from "../../auth"; // Import store

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

const CreateMaintenanceRequestScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [roomInfo, setRoomInfo] = useState({});
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [priority, setPriority] = useState("low");
  const [note, setNote] = useState("");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const init = async () => {
      try {
        const userId = user?.id || user?.user_id;
        if (!userId) return;

        const roomRes = await getRoomsByUserId(userId);
        const currentRoom = roomRes?.current_room || roomRes?.data?.current_room;
        
        if (currentRoom) {
            setRoomId(currentRoom.room_id);
            setRoomInfo(currentRoom);
        } else {
            Alert.alert("Thông báo", "Tài khoản của bạn chưa được gán vào phòng nào.");
        }
      } catch (err) {
        console.error("Room Init Error:", err);
      }
    };
    init();
  }, [user]);

  const handleSubmit = async () => {
    if (!title || !description || !category ) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (!roomId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin phòng của bạn.");
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

      Alert.alert("Thành công", "Đã gửi yêu cầu bảo trì.", [
        { text: "OK", onPress: () => navigation.navigate("MaintenanceListScreen") },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể tạo yêu cầu.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Tạo yêu cầu" isHome={false} />

      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {roomInfo.room_number ? (
              <View style={styles.roomBanner}>
                  <Ionicons name="home" size={18} color={colors.brand} />
                  <Text style={styles.roomText}>
                      Phòng {roomInfo.room_number} - {roomInfo.building_name}
                  </Text>
              </View>
          ) : (
             <View style={[styles.roomBanner, {borderColor: '#EF4444', backgroundColor: '#FEF2F2'}]}>
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={[styles.roomText, {color: '#EF4444'}]}>
                      Chưa có thông tin phòng
                  </Text>
              </View>
          )}

          <View style={styles.card}>
            <Text style={styles.label}>Tiêu đề <Text style={{color:'red'}}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Hỏng vòi nước..."
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Loại bảo trì <Text style={{color:'red'}}>*</Text></Text>
            <View style={styles.pickerWrapper}>
                <RNPickerSelect
                    onValueChange={(value) => setCategory(value)}
                    value={category}
                    placeholder={{ label: "Chọn loại bảo trì...", value: null, color: '#9CA3AF' }}
                    items={maintenanceTypes.map((t) => ({ label: t.label, value: t.key }))}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => <Ionicons name="chevron-down" size={20} color="#9CA3AF" style={{marginTop: 12, marginRight: 10}} />}
                />
            </View>

            <Text style={styles.label}>Mức độ ưu tiên</Text>
            <View style={styles.pickerWrapper}>
                <RNPickerSelect
                    onValueChange={(value) => setPriority(value)}
                    value={priority}
                    placeholder={{}}
                    items={priorityLevels.map((p) => ({ label: p.label, value: p.key }))}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => <Ionicons name="chevron-down" size={20} color="#9CA3AF" style={{marginTop: 12, marginRight: 10}} />}
                />
            </View>

            <Text style={styles.label}>Mô tả chi tiết <Text style={{color:'red'}}>*</Text></Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Mô tả kỹ tình trạng hư hỏng..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Ghi chú thêm</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="VD: Thời gian rảnh để thợ đến..."
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
             {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>}
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
  roomBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EFF6FF',
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: '#DBEAFE'
  },
  roomText: { fontSize: 14, color: '#1E40AF', fontWeight: '600' },
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
  pickerWrapper: { marginBottom: 0 },
  submitButton: {
    backgroundColor: colors.brand,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
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

export default CreateMaintenanceRequestScreen;
