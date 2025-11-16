// src/screens/guest/UpdateGuestRegistrationScreen.jsx
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
} from "react-native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import {
  getGuestRegistrationById,
  updateGuestRegistration,
} from "../../service/api/guest";
import { getRoomsByUserId } from "../../service/api/room";

export default function UpdateGuestRegistrationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { registrationId } = route.params;

  const [arrivalDate, setArrivalDate] = useState(null);
  const [departureDate, setDepartureDate] = useState(null);
  const [note, setNote] = useState("");
  const [guestDetails, setGuestDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);

  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await SecureStore.getItemAsync("sami_access_token");
        if (!token) throw new Error("Phiên đăng nhập đã hết hạn.");
        const decoded = jwtDecode(token);
        const userId = decoded?.id || decoded?.userId;
        if (!userId) throw new Error("Token không hợp lệ");

        const roomRes = await getRoomsByUserId(userId);
        const currentRoom = roomRes?.data?.current_room;
        if (!currentRoom) throw new Error("Người dùng chưa có phòng.");
        setRoomId(currentRoom.room_id);

        const res = await getGuestRegistrationById(registrationId);
        const registration = res?.data?.registration;
        if (!registration) throw new Error("Không tìm thấy đăng ký khách.");

        setArrivalDate(new Date(registration.arrival_date));
        setDepartureDate(new Date(registration.departure_date));
        setNote(registration.note || "");
        setGuestDetails(
          registration.guest_details.map((g) => ({
            ...g,
            errors: {},
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [registrationId]);

  const addGuest = () =>
    setGuestDetails([
      ...guestDetails,
      { full_name: "", id_type: "national_id", id_number: "", errors: {} },
    ]);

  const removeGuest = (index) => {
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
        guest.errors.id_number = "Vui lòng nhập số CCCD/CMND";
        isValid = false;
      } else if (!/^\d{9}$|^\d{12}$/.test(guest.id_number)) {
        guest.errors.id_number = "CCCD phải gồm 9 hoặc 12 chữ số";
        isValid = false;
      }
    });

    setGuestDetails(newDetails);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!arrivalDate || !departureDate) return;
    if (departureDate <= arrivalDate) return;
    if (!roomId || guestDetails.length === 0) return;
    if (!validateGuests()) return;

    setLoading(true);
    try {
      const payload = {
        room_id: roomId,
        arrival_date: arrivalDate.toISOString().split("T")[0],
        departure_date: departureDate.toISOString().split("T")[0],
        note,
        guest_details: guestDetails.map(
          ({ full_name, id_type, id_number }) => ({
            full_name,
            id_type,
            id_number,
          })
        ),
      };

      await updateGuestRegistration(registrationId, payload);
      navigation.navigate("GuestRegistrationListScreen");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" />
      <Header />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Ngày đến</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowArrivalPicker(true)}
        >
          <Text>
            {arrivalDate ? arrivalDate.toLocaleDateString() : "Chọn ngày"}
          </Text>
        </TouchableOpacity>
        {showArrivalPicker && (
          <DateTimePicker
            value={arrivalDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowArrivalPicker(Platform.OS === "ios");
              if (selectedDate) setArrivalDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Ngày đi</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDeparturePicker(true)}
        >
          <Text>
            {departureDate ? departureDate.toLocaleDateString() : "Chọn ngày"}
          </Text>
        </TouchableOpacity>
        {showDeparturePicker && (
          <DateTimePicker
            value={departureDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDeparturePicker(Platform.OS === "ios");
              if (selectedDate) setDepartureDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Ghi chú</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Thông tin khách</Text>
        {guestDetails.map((guest, index) => (
          <View key={index} style={styles.guestRow}>
            <Text style={styles.fieldLabel}>Tên</Text>
            <TextInput
              style={styles.input}
              value={guest.full_name}
              onChangeText={(text) =>
                updateGuestField(index, "full_name", text)
              }
            />
            {guest.errors.full_name && (
              <Text style={styles.errorText}>{guest.errors.full_name}</Text>
            )}

            <Text style={styles.fieldLabel}>Số CCCD</Text>
            <TextInput
              style={styles.input}
              value={guest.id_number}
              keyboardType="numeric"
              onChangeText={(text) =>
                updateGuestField(index, "id_number", text)
              }
            />
            {guest.errors.id_number && (
              <Text style={styles.errorText}>{guest.errors.id_number}</Text>
            )}

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeGuest(index)}
            >
              <Text style={{ color: "white" }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addGuest}>
          <Text style={styles.addButtonText}>Thêm khách</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Cập nhật đăng ký</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  form: { padding: spacing.lg },
  label: { fontWeight: "600", marginBottom: 6 },
  fieldLabel: { fontWeight: "500", marginBottom: 4, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    justifyContent: "center",
  },
  guestRow: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: "#dc3545",
    padding: 6,
    alignItems: "center",
    borderRadius: 4,
    marginTop: 6,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 12,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  errorText: { color: "#dc3545", fontSize: 12, marginBottom: 4 },
});
