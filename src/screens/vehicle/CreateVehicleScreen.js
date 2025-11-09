// Updated: 2025-11-07
// by: MinhBH

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../service/http";

const CreateVehicleScreen = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    color: "",
    tenantId: "",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.plateNumber || !form.brand || !form.model) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin xe.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token. Hãy đăng nhập lại.");
        return;
      }

      const res = await axios.post(`${BASE_URL}/vehicle`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("✅ Thành công", "Thêm xe mới thành công!");
      navigation.goBack();
    } catch (err) {
      console.error("CreateVehicle Error:", err.response?.data || err.message);
      Alert.alert("❌ Lỗi", err.response?.data?.message || "Không thể thêm xe.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thêm Xe Mới</Text>

      <Text style={styles.label}>Biển số xe</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: 51A-12345"
        value={form.plateNumber}
        onChangeText={(text) => handleChange("plateNumber", text)}
      />

      <Text style={styles.label}>Thương hiệu</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Toyota"
        value={form.brand}
        onChangeText={(text) => handleChange("brand", text)}
      />

      <Text style={styles.label}>Mẫu xe</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Vios"
        value={form.model}
        onChangeText={(text) => handleChange("model", text)}
      />

      <Text style={styles.label}>Màu xe</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Đỏ, Trắng, Xanh..."
        value={form.color}
        onChangeText={(text) => handleChange("color", text)}
      />

      <Text style={styles.label}>Tenant ID (tùy chọn)</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập ID người thuê (nếu có)"
        value={form.tenantId}
        onChangeText={(text) => handleChange("tenantId", text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Thêm xe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateVehicleScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
