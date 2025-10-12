import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const CreateMaintenanceRequestScreen = () => {
  const navigation = useNavigation();
  const [selectedRoom, setSelectedRoom] = useState("Phòng 105");
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState("");

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Placeholder action for the "Gửi" button
    Alert.alert("Gửi yêu cầu", "Chức năng đang được phát triển.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tạo đơn bảo trì</Text>

        {/* Room Picker */}
        <Text style={styles.label}>Phòng</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRoom}
            onValueChange={(itemValue) => setSelectedRoom(itemValue)}
          >
            <Picker.Item label="Phòng 102" value="Phòng 102" />
            <Picker.Item label="Phòng 103" value="Phòng 103" />
            <Picker.Item label="Phòng 104" value="Phòng 104" />
            <Picker.Item label="Phòng 105" value="Phòng 105" />
          </Picker>
        </View>

        {/* Maintenance Type Picker */}
        <Text style={styles.label}>Loại bảo trì</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedType}
            onValueChange={(itemValue) => setSelectedType(itemValue)}
            style={!selectedType ? { color: colors.muted } : {}}
          >
            <Picker.Item
              label="Chọn loại bảo trì ở đây"
              value={null}
              enabled={false}
            />
            <Picker.Item label="Dịch vụ" value="Dịch vụ" />
            <Picker.Item label="Kiểm tra" value="Kiểm tra" />
            <Picker.Item label="Sửa chữa" value="Sửa chữa" />
          </Picker>
        </View>

        {/* Description Input */}
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={styles.descriptionInput}
          multiline
          numberOfLines={4}
          maxLength={255}
          value={description}
          onChangeText={setDescription}
          placeholder="Viết mô tả ở đây, 255 kí tự"
          placeholderTextColor={colors.muted}
        />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    justifyContent: "center",
  },
  descriptionInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    marginRight: spacing.md,
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: colors.brand,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateMaintenanceRequestScreen;
