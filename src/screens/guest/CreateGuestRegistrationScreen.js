import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { GuestRegistrationContext } from "../../contexts/GuestRegistrationContext";

export default function CreateGuestRegistrationScreen() {
  const navigation = useNavigation();
  const { guestRegistration, setGuestRegistration } = useContext(
    GuestRegistrationContext
  );

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );
  const [reason, setReason] = useState("Thăm người thân");
  const [note, setNote] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (d) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleCancel = () => navigation.goBack();

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại.");
      return;
    }
    if (endDate < startDate) {
      Alert.alert("Lỗi", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
      return;
    }

    const newGuest = {
      id: guestRegistration.length
        ? Math.max(...guestRegistration.map((g) => g.id)) + 1
        : 1,
      name: fullName.trim(),
      phone: phone.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason,
      note: note.trim(),
      status: "Chờ xử lý",
    };

    setGuestRegistration([...guestRegistration, newGuest]);

    Alert.alert("Thành công", "Đăng ký tạm trú đã được gửi.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("GuestRegistrationListScreen"),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f6fa" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />
            <View style={{ paddingBottom: spacing.lg, paddingTop: spacing.xxl }}>
              <Header />
            </View>

            <ScrollView
              style={styles.container}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Đăng kí tạm trú cho khách</Text>

                <Text style={styles.label}>Tên đầy đủ:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Nguyễn Văn A"
                  value={fullName}
                  onChangeText={setFullName}
                  returnKeyType="next"
                />

                <Text style={styles.label}>Sđt của khách:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: 0912123456"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  returnKeyType="next"
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
                    onChange={onChangeStart}
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
                    onChange={onChangeEnd}
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

                <Text style={styles.label}>Thông tin thêm:</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Ghi chú thêm tại đây"
                  textAlignVertical="top"
                  value={note}
                  onChangeText={setNote}
                />

                <View style={styles.buttonsRow}>
                  <Pressable
                    style={[styles.btn, styles.btnCancel]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.btnText}>Hủy</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.btnSubmit]}
                    onPress={handleSubmit}
                  >
                    <Text style={[styles.btnText, { color: "#fff" }]}>Gửi</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTitle: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textarea: {
    minHeight: 100,
  },
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
  dateText: {
    color: "#111",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  btn: {
    minWidth: 110,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  btnCancel: {
    backgroundColor: "#6b7280",
  },
  btnSubmit: {
    backgroundColor: "#2b6be6",
  },
  btnText: {
    fontWeight: "700",
    color: "#fff",
  },
});
