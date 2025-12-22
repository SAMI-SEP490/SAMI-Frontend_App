import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView
} from "react-native";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import {
  getGuestRegistrationById,
  updateGuestRegistration,
} from "../../service/api/guest";
import { getRoomsByUserId } from "../../service/api/room";
import { useAuthStore } from "../../auth"; // Import store

export default function UpdateGuestRegistrationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { registrationId } = route.params;

  const [arrivalDate, setArrivalDate] = useState(new Date());
  const [departureDate, setDepartureDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [guestDetails, setGuestDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roomId, setRoomId] = useState(null);

  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);

  const user = useAuthStore((state) => state.user);

  // --- SAME DATE LOGIC AS CREATE SCREEN ---
  const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const handleArrivalChange = (event, selectedDate) => {
    setShowArrivalPicker(false);
    if (!selectedDate) return;

    // Check vs Departure
    const newArrival = normalizeDate(selectedDate);
    const currentDeparture = normalizeDate(departureDate);

    // Note: For Updates, we might allow past dates if the registration was already in the past, 
    // but typically we enforce logic for new inputs.
    // Let's enforce logical order: Arrival must be < Departure
    setArrivalDate(selectedDate);

    if (newArrival >= currentDeparture) {
        const newDeparture = new Date(selectedDate);
        newDeparture.setDate(selectedDate.getDate() + 1);
        setDepartureDate(newDeparture);
        Alert.alert("Cập nhật ngày đi", "Ngày đi đã được tự động điều chỉnh để sau ngày đến 1 ngày.");
    }
  };

  const handleDepartureChange = (event, selectedDate) => {
    setShowDeparturePicker(false);
    if (!selectedDate) return;

    const newDeparture = normalizeDate(selectedDate);
    const currentArrival = normalizeDate(arrivalDate);

    if (newDeparture <= currentArrival) {
        Alert.alert("Lỗi", "Ngày đi phải sau ngày đến ít nhất 1 ngày.");
        // Reset
        const resetDate = new Date(arrivalDate);
        resetDate.setDate(arrivalDate.getDate() + 1);
        setDepartureDate(resetDate);
        return;
    }
    setDepartureDate(selectedDate);
  };
  // ----------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user?.id || user?.user_id;
        if (!userId) return;

        const roomRes = await getRoomsByUserId(userId);
        const currentRoom = roomRes?.current_room || roomRes?.data?.current_room;
        if (currentRoom) setRoomId(currentRoom.room_id);

        const res = await getGuestRegistrationById(registrationId);
        const registration = res?.data?.registration || res?.registration;
        
        if (registration) {
            setArrivalDate(new Date(registration.arrival_date));
            setDepartureDate(new Date(registration.departure_date));
            setNote(registration.note || "");
            setGuestDetails(
            registration.guest_details.map((g) => ({ ...g, errors: {} }))
            );
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải thông tin đơn.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [registrationId, user]);

  const addGuest = () =>
    setGuestDetails([
      ...guestDetails,
      { full_name: "", id_type: "national_id", id_number: "", errors: {} },
    ]);

  const removeGuest = (index) => {
    if (guestDetails.length === 1) return;
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

  const handleSubmit = async () => {
    if (!roomId) {
        Alert.alert("Lỗi", "Không tìm thấy phòng.");
        return;
    }
    setSubmitting(true);
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

      await updateGuestRegistration(registrationId, payload);
      Alert.alert("Thành công", "Cập nhật thành công!", [
          { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể cập nhật.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateDisplay = (date) => date.toLocaleDateString("vi-VN");

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color={colors.brand} style={{marginTop:50}} /></View>;

  return (
    <View style={styles.container}>
      <Header title="Chỉnh sửa đơn" isHome={false} />

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
            {showArrivalPicker && <DateTimePicker value={arrivalDate} mode="date" onChange={handleArrivalChange} />}
            {showDeparturePicker && <DateTimePicker value={departureDate} mode="date" minimumDate={new Date(arrivalDate.getTime() + 86400000)} onChange={handleDepartureChange} />}
            
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              value={note}
              onChangeText={setNote}
              multiline
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

              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={guest.full_name}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => updateGuestField(index, "full_name", text)}
              />
              
              <Text style={styles.label}>Số CCCD/CMND</Text>
              <TextInput
                style={styles.input}
                value={guest.id_number}
                keyboardType="numeric"
                placeholder="00109..."
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => updateGuestField(index, "id_number", text)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
             {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Lưu thay đổi</Text>}
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
