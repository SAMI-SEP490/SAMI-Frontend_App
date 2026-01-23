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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Header from "../../components/Header";
import { spacing } from "../../theme/spacing";
import { colors } from "../../theme/colors";
import { createGuestRegistration } from "../../service/api/guest";
import { getRoomsByUserId } from "../../service/api/room";
import { useAuthStore } from "../../auth"; // Import store

export default function CreateGuestRegistrationScreen() {
  const navigation = useNavigation();

  // Initialize dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [arrivalDate, setArrivalDate] = useState(today);
  const [departureDate, setDepartureDate] = useState(tomorrow);

  const [note, setNote] = useState("");
  const [guestDetails, setGuestDetails] = useState([
    { full_name: "", id_type: "national_id", id_number: "", errors: {} },
  ]);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);

  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);

  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const userId = user?.id || user?.user_id;
        if (!userId) return;

        const res = await getRoomsByUserId(userId);
        const roomsData = res?.data?.rooms || [];

        setRooms(roomsData);

        // 👉 Chỉ auto-select khi CHƯA có room được chọn
        if (!roomId && roomsData.length > 0) {
          const primaryRoom = roomsData.find(
            r => r.role === "Primary"
          );

          setRoomId(
            primaryRoom
              ? primaryRoom.room_id
              : roomsData[0].room_id
          );
        }
      } catch (err) {
        console.error("Fetch rooms error:", err);
      }
    };

    fetchRooms();
  }, [user]);

  // --- DATE LOGIC ---
  const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const handleArrivalChange = (event, selectedDate) => {
    setShowArrivalPicker(false);
    if (!selectedDate) return; // User cancelled

    const currentToday = normalizeDate(new Date());
    const newArrival = normalizeDate(selectedDate);

    // 1. Prevent Past Dates
    if (newArrival < currentToday) {
      Alert.alert("Ngày không hợp lệ", "Ngày đến không thể là ngày trong quá khứ.");
      return;
    }

    setArrivalDate(selectedDate);

    // 2. Auto-adjust Departure if it conflicts (Arrival >= Departure)
    const currentDeparture = normalizeDate(departureDate);
    if (newArrival >= currentDeparture) {
      const newDeparture = new Date(selectedDate);
      newDeparture.setDate(selectedDate.getDate() + 1); // Departure = Arrival + 1
      setDepartureDate(newDeparture);
    }
  };

  const handleDepartureChange = (event, selectedDate) => {
    setShowDeparturePicker(false);
    if (!selectedDate) return;

    const newDeparture = normalizeDate(selectedDate);
    const currentArrival = normalizeDate(arrivalDate);

    // 3. Ensure Departure > Arrival
    if (newDeparture <= currentArrival) {
      Alert.alert("Ngày không hợp lệ", "Ngày đi phải sau ngày đến ít nhất 1 ngày.");
      // Reset to Arrival + 1
      const resetDate = new Date(arrivalDate);
      resetDate.setDate(arrivalDate.getDate() + 1);
      setDepartureDate(resetDate);
      return;
    }

    setDepartureDate(selectedDate);
  };
  // ------------------

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
      const msg = error?.message || "Không thể tạo đơn đăng ký.";
      Alert.alert("Lỗi", msg);
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
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Chọn phòng <Text style={{ color: 'red' }}>*</Text></Text>

            {rooms.map(room => {
              const isSelected = roomId === room.room_id;
              const isPrimary = room.role === "Primary";

              return (
                <TouchableOpacity
                  key={room.room_id}
                  style={[
                    styles.roomCard,
                    isSelected && styles.roomCardActive,
                    !isPrimary && styles.roomSecondary
                  ]}
                  onPress={() => setRoomId(room.room_id)}
                  activeOpacity={0.85}
                >
                  {/* Left */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.roomHeader}>
                      <Text style={styles.roomTitle}>
                        Phòng {room.room_number}
                      </Text>

                      <View
                        style={[
                          styles.roleBadge,
                          isPrimary ? styles.primaryBadge : styles.secondaryBadge
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleBadgeText,
                            isPrimary ? styles.primaryText : styles.secondaryText
                          ]}
                        >
                          {isPrimary ? "Người thuê chính" : "Người thuê phụ"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.roomHint}>
                      {isPrimary
                        ? "Quyền đầy đủ với phòng này"
                        : "Quyền hạn giới hạn"}
                    </Text>
                  </View>

                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.brand}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {/* Section 1: General Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin chung</Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ngày đến <Text style={{ color: 'red' }}>*</Text></Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowArrivalPicker(true)}>
                  <Text style={{ color: '#111827' }}>{formatDateDisplay(arrivalDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={{ position: 'absolute', right: 10 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ngày đi <Text style={{ color: 'red' }}>*</Text></Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDeparturePicker(true)}>
                  <Text style={{ color: '#111827' }}>{formatDateDisplay(departureDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={{ position: 'absolute', right: 10 }} />
                </TouchableOpacity>
              </View>
            </View>

            {showArrivalPicker && (
              <DateTimePicker
                value={arrivalDate}
                mode="date"
                display="default"
                minimumDate={new Date()} // Can't pick past dates
                onChange={handleArrivalChange}
              />
            )}
            {showDeparturePicker && (
              <DateTimePicker
                value={departureDate}
                mode="date"
                display="default"
                // Can't pick date before arrival
                minimumDate={new Date(arrivalDate.getTime() + 86400000)}
                onChange={handleDepartureChange}
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
            <TouchableOpacity onPress={addGuest} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="add-circle" size={20} color={colors.brand} />
              <Text style={{ color: colors.brand, fontWeight: '600', marginLeft: 4 }}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {guestDetails.map((guest, index) => (
            <View key={index} style={styles.guestCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.guestIndex}>Khách #{index + 1}</Text>
                {guestDetails.length > 1 && (
                  <TouchableOpacity onPress={() => removeGuest(index)}>
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.label}>Họ và tên <Text style={{ color: 'red' }}>*</Text></Text>
              <TextInput
                style={[styles.input, guest.errors.full_name && { borderColor: '#EF4444' }]}
                value={guest.full_name}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#9CA3AF"
                onChangeText={(text) => updateGuestField(index, "full_name", text)}
              />

              <Text style={styles.label}>Số CCCD/CMND <Text style={{ color: 'red' }}>*</Text></Text>
              <TextInput
                style={[styles.input, guest.errors.id_number && { borderColor: '#EF4444' }]}
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
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  roomCardActive: {
    borderColor: colors.brand,
    backgroundColor: "#EFF6FF",
  },

  roomSecondary: {
    backgroundColor: "#FAFAFA",
  },

  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  roomTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  primaryBadge: {
    backgroundColor: "#DBEAFE",
  },

  secondaryBadge: {
    backgroundColor: "#E5E7EB",
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  primaryText: {
    color: "#2563EB",
  },

  secondaryText: {
    color: "#374151",
  },

  roomHint: {
    fontSize: 13,
    color: "#6B7280",
  },
});
