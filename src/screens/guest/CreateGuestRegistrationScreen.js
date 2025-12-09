import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView
} from "react-native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { createGuestRegistration } from "../../service/api/guest";
import { getRoomsByUserId } from "../../service/api/room";

export default function CreateGuestRegistrationScreen() {
  const navigation = useNavigation();

  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [departureDate, setDepartureDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [guestDetails, setGuestDetails] = useState([
    { full_name: "", id_type: "national_id", id_number: "", errors: {} },
  ]);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);

  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        const token = await SecureStore.getItemAsync("sami_access_token");
        if (!token) return;
        const decoded = jwtDecode(token);
        const userId = decoded?.id || decoded?.userId;
        const roomRes = await getRoomsByUserId(userId);
        const currentRoom = roomRes?.data?.current_room;
        if (currentRoom) setRoomId(currentRoom.room_id);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoomId();
  }, []);

  const addGuest = () =>
    setGuestDetails([
      ...guestDetails,
      { full_name: "", id_type: "national_id", id_number: "", errors: {} },
    ]);

  const removeGuest = (index) => {
    if (guestDetails.length === 1) return; // Keep at least one
    const newDetails = [...guestDetails];
    newDetails.splice(index, 1);
    setGuestDetails(newDetails);
  };

  const updateGuestField = (index, field, value) => {
    const newDetails = [...guestDetails];
    newDetails[index][field] = value;
    if (newDetails[index].errors[field]) newDetails[index].errors[field] = "";
    setGuestDetails(newDetails);
  };

  const validateGuests = () => {
    let isValid = true;
    const newDetails = guestDetails.map((guest) => ({ ...guest, errors: {} }));

    newDetails.forEach((guest) => {
      if (!guest.full_name.trim()) {
        guest.errors.full_name = "Vui lòng nhập tên khách";
        isValid = false;
      }
      if (!guest.id_number.trim()) {
        guest.errors.id_number = "Nhập CCCD";
        isValid = false;
      }
    });

    setGuestDetails(newDetails);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!roomId) return Alert.alert("Lỗi", "Không tìm thấy phòng của bạn.");
    if (!validateGuests()) return Alert.alert("Thiếu thông tin", "Vui lòng kiểm tra lại thông tin khách.");

    setLoading(true);
    try {
      const payload = {
        room_id: roomId,
        arrival_date: arrivalDate.toISOString().split("T")[0],
        departure_date: departureDate.toISOString().split("T")[0],
        note,
        guest_details: guestDetails.map(({ full_name, id_type, id_number }) => ({
          full_name,
          id_type,
          id_number,
        })),
      };

      await createGuestRegistration(payload);
      Alert.alert("Thành công", "Đã tạo đơn đăng ký khách.", [
          { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo đơn đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (date) => date.toLocaleDateString("vi-VN");

  return (
    <View style={styles.container}>
      <Header title="Đăng ký khách" isHome={false} />

      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          {/* Section 1: General Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin chung</Text>
            
            <View style={{flexDirection: 'row', gap: 12}}>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Ngày đến</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowArrivalPicker(true)}>
                        <Text style={{color: '#111827'}}>{formatDateDisplay(arrivalDate)}</Text>
                        <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={{position: 'absolute', right: 10}}/>
                    </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Ngày đi</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowDeparturePicker(true)}>
                        <Text style={{color: '#111827'}}>{formatDateDisplay(departureDate)}</Text>
                        <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={{position: 'absolute', right: 10}}/>
                    </TouchableOpacity>
                </View>
            </View>

            {showArrivalPicker && (
              <DateTimePicker
                value={arrivalDate}
                mode="date"
                display="default"
                onChange={(e, d) => { setShowArrivalPicker(false); if(d) setArrivalDate(d); }}
              />
            )}
            {showDeparturePicker && (
              <DateTimePicker
                value={departureDate}
                mode="date"
                display="default"
                onChange={(e, d) => { setShowDeparturePicker(false); if(d) setDepartureDate(d); }}
              />
            )}

            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Nhập ghi chú..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Section 2: Guests */}
          <View style={styles.guestHeaderRow}>
             <Text style={styles.sectionTitle}>Danh sách khách</Text>
             <TouchableOpacity onPress={addGuest} style={{flexDirection: 'row', alignItems: 'center'}}>
                 <Ionicons name="add-circle" size={20} color={colors.brand} />
                 <Text style={{color: colors.brand, fontWeight: '600', marginLeft: 4}}>Thêm</Text>
             </TouchableOpacity>
          </View>

          {guestDetails.map((guest, index) => (
            <View key={index} style={styles.guestCard}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={styles.guestIndex}>Khách #{index + 1}</Text>
                  {guestDetails.length > 1 && (
                      <TouchableOpacity onPress={() => removeGuest(index)}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                  )}
              </View>

              <Text style={styles.label}>Họ và tên <Text style={{color:'red'}}>*</Text></Text>
              <TextInput
                style={[styles.input, guest.errors.full_name && {borderColor: '#EF4444'}]}
                value={guest.full_name}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => updateGuestField(index, "full_name", text)}
              />
              
              <Text style={styles.label}>Số CCCD/CMND <Text style={{color:'red'}}>*</Text></Text>
              <TextInput
                style={[styles.input, guest.errors.id_number && {borderColor: '#EF4444'}]}
                value={guest.id_number}
                keyboardType="numeric"
                placeholder="00109..."
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => updateGuestField(index, "id_number", text)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
             {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Tạo đăng ký</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
  sectionTitle: {
      fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12
  },
  label: {
      fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6, marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "white",
    color: "#111827",
    justifyContent: 'center',
    marginBottom: 8
  },
  guestHeaderRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10
  },
  guestCard: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#E5E7EB"
  },
  guestIndex: {
      fontSize: 14, fontWeight: '700', color: colors.brand, marginBottom: 8
  },
  submitButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },
  submitText: { color: "white", fontSize: 16, fontWeight: "700" },
});
