import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { VehicleContext } from "./VehicleContext";

export default function CreateVehicleRegistration({ navigation }) {
  const { addVehicle } = useContext(VehicleContext);
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = () => {
    if (!vehicleType || !licensePlate) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    const newVehicle = {
      id: Date.now(),
      vehicleType,
      licensePlate,
      description,
      image,
      status: "requested",
    };

    addVehicle(newVehicle);
    Alert.alert("Thành công", "Phương tiện đã được đăng kí thành công.");
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>Loại phương tiện *</Text>
      <Picker
        selectedValue={vehicleType}
        onValueChange={(itemValue) => setVehicleType(itemValue)}
        style={{ borderWidth: 1, borderColor: "#ccc", marginVertical: 8 }}
      >
        <Picker.Item label="-- Chọn loại phương tiện --" value="" />
        <Picker.Item label="Car" value="car" />
        <Picker.Item label="Motorbike" value="motorbike" />
      </Picker>

      <Text style={{ fontSize: 16, fontWeight: "bold" }}>Biển số *</Text>
      <TextInput
        placeholder="VD: 29A-12345"
        value={licensePlate}
        onChangeText={setLicensePlate}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginVertical: 8 }}
      />

      <Text style={{ fontSize: 16, fontWeight: "bold" }}>Mô tả</Text>
      <TextInput
        placeholder="Thông tin thêm..."
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, height: 80, marginVertical: 8 }}
      />

      <Text style={{ fontSize: 16, fontWeight: "bold" }}>Thêm ảnh</Text>
      <TouchableOpacity onPress={handlePickImage} style={{ marginVertical: 10, alignItems: "center" }}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 10 }} />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderWidth: 1,
              borderColor: "#ccc",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
            }}
          >
            <Text>🖼️</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 5, width: "45%", alignItems: "center" }}
        >
          <Text>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          style={{ backgroundColor: "#007bff", padding: 10, borderRadius: 5, width: "45%", alignItems: "center" }}
        >
          <Text style={{ color: "#fff" }}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
