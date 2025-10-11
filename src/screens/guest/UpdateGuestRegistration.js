import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { GuestRegistrationContext } from "../../contexts/GuestRegistrationContext";

export default function UpdateGuestRegistration() {
  const navigation = useNavigation();
  const route = useRoute();
  const { guest } = route.params;

  const { updateGuestRegistration, deleteGuestRegistration } = useContext(
    GuestRegistrationContext
  );

  // Hàm parse DD/MM/YYYY sang Date
  const parseDate = (str) => {
    if (!str) return new Date();
    const [dd, mm, yyyy] = str.split("/");
    return new Date(yyyy, mm - 1, dd);
  };

  const [fullName, setFullName] = useState(guest.name || "");
  const [phone, setPhone] = useState(guest.phone || "");
  const [startDate, setStartDate] = useState(parseDate(guest.startDate));
  const [endDate, setEndDate] = useState(parseDate(guest.endDate));
  const [reason, setReason] = useState(guest.reason || "Thăm người thân");
  const [note, setNote] = useState(guest.note || "");

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (d) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Update guest
  const handleSubmit = () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (endDate < startDate) {
      Alert.alert("Lỗi", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
      return;
    }

    const updated = {
      ...guest,
      name: fullName,
      phone,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      reason,
      note,
    };

    updateGuestRegistration(updated);

    Alert.alert("Thành công", "Cập nhật đăng ký thành công.", [
      {
        text: "OK",
        onPress: () =>
          navigation.navigate("Main", { screen: "GuestRegistrationList" }),
      },
    ]);
  };

  // Delete guest
  const handleDelete = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chấp nhận",
          style: "destructive",
          onPress: () => {
            deleteGuestRegistration(guest.id);
            navigation.navigate("Main", { screen: "GuestRegistrationList" });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cập nhật thông tin khách</Text>

          <Text style={styles.label}>Tên đầy đủ:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>SĐT của khách:</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Ngày bắt đầu:</Text>
          <Pressable
            style={styles.dateRow}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#555" />
          </Pressable>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              onChange={(e, d) => {
                setShowStartPicker(false);
                if (d) setStartDate(d);
              }}
            />
          )}

          <Text style={styles.label}>Ngày kết thúc:</Text>
          <Pressable
            style={styles.dateRow}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#555" />
          </Pressable>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              onChange={(e, d) => {
                setShowEndPicker(false);
                if (d) setEndDate(d);
              }}
            />
          )}

          <Text style={styles.label}>Lí do tạm trú:</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={reason} onValueChange={setReason}>
              <Picker.Item label="Thăm người thân" value="Thăm người thân" />
              <Picker.Item label="Công tác" value="Công tác" />
              <Picker.Item label="Du lịch" value="Du lịch" />
              <Picker.Item label="Khác" value="Khác" />
            </Picker>
          </View>

          <Text style={styles.label}>Ghi chú:</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.buttonsRow}>
            <Pressable
              style={[styles.btn, styles.btnDelete]}
              onPress={handleDelete}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Xóa</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.btnCancel]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.btnText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.btnSubmit]}
              onPress={handleSubmit}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Cập nhật</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 16,
  },
  label: { fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  textarea: { minHeight: 100 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  dateText: { color: "#111" },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  buttonsRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  btn: {
    minWidth: 70,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  btnCancel: { backgroundColor: "#6b7280" },
  btnSubmit: { backgroundColor: "#2b6be6" },
  btnDelete: { backgroundColor: "#dc2626" },
  btnText: { fontWeight: "700", color: "#fff" },
});
