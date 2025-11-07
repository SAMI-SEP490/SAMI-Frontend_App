// Updated: 2025-11-07
// by: MinhBH

import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../../service/http";

const EditVehicleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId } = route.params || {};

  const [form, setForm] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    color: "",
    tenantId: "",
  });

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_URL}/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(res.data);
    } catch (err) {
      console.error("FetchVehicle Error:", err);
      Alert.alert("❌ Lỗi", "Không thể tải thông tin xe.");
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token. Hãy đăng nhập lại.");
        return;
      }

      await axios.put(`${BASE_URL}/vehicle/${vehicleId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("✅ Thành công", "Cập nhật thông tin xe thành công!");
      navigation.goBack();
    } catch (err) {
      console.error("UpdateVehicle Error:", err.response?.data || err.message);
      Alert.alert("❌ Lỗi", err.response?.data?.message || "Không thể cập nhật xe.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin xe</Text>

      <Text style={styles.label}>Biển số xe</Text>
      <TextInput
        style={styles.input}
        value={form.plateNumber}
        onChangeText={(text) => handleChange("plateNumber", text)}
      />

      <Text style={styles.label}>Thương hiệu</Text>
      <TextInput
        style={styles.input}
        value={form.brand}
        onChangeText={(text) => handleChange("brand", text)}
      />

      <Text style={styles.label}>Mẫu xe</Text>
      <TextInput
        style={styles.input}
        value={form.model}
        onChangeText={(text) => handleChange("model", text)}
      />

      <Text style={styles.label}>Màu xe</Text>
      <TextInput
        style={styles.input}
        value={form.color}
        onChangeText={(text) => handleChange("color", text)}
      />

      <Text style={styles.label}>Tenant ID</Text>
      <TextInput
        style={styles.input}
        value={form.tenantId}
        onChangeText={(text) => handleChange("tenantId", text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditVehicleScreen;

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
    backgroundColor: "#2196F3",
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
