import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { VehicleContext } from "./VehicleContext";

export default function UpdateVehicleInfoScreen({ navigation, route }) {
  const { updateVehicle } = useContext(VehicleContext);
  const { vehicle } = route.params || {};

  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setVehicleType(vehicle.vehicleType || "");
      setLicensePlate(vehicle.licensePlate || "");
      setDescription(vehicle.description || "");
      setImage(vehicle.image || null);
    } else {
      Alert.alert("Lỗi", "Không tìm thấy phương tiện.");
      navigation.goBack();
    }
  }, [vehicle]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleUpdate = () => {
    if (!vehicleType || !licensePlate) {
      Alert.alert("Lỗi", "Thông tin không hợp lệ. Vui lòng sửa và thử lại.");
      return;
    }

    try {
      updateVehicle(vehicle.id, {
        vehicleType,
        licensePlate,
        description,
        image,
      });
      Alert.alert("Thành công", "Cập nhật thông tin phương tiện thành công.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin phương tiện.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Loại phương tiện *</Text>
      <Picker
        selectedValue={vehicleType}
        onValueChange={(val) => setVehicleType(val)}
        style={{ marginVertical: 8 }}
      >
        <Picker.Item label="-- Chọn loại phương tiện --" value="" />
        <Picker.Item label="Xe hơi" value="car" />
        <Picker.Item label="Xe máy" value="motorbike" />
      </Picker>

      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Biển số *</Text>
      <TextInput
        value={licensePlate}
        onChangeText={setLicensePlate}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginVertical: 8,
        }}
      />

      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Mô tả</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          height: 80,
          marginVertical: 8,
        }}
      />

      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Ảnh</Text>
      <TouchableOpacity
        onPress={handlePickImage}
        style={{ alignItems: "center", marginVertical: 10 }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 120, height: 120, borderRadius: 10 }}
          />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>🖼️</Text>
          </View>
        )}
      </TouchableOpacity>

      <View
        style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: "#f0f0f0",
            padding: 10,
            borderRadius: 5,
            width: "45%",
            alignItems: "center",
          }}
        >
          <Text>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdate}
          style={{
            backgroundColor: "#007bff",
            padding: 10,
            borderRadius: 5,
            width: "45%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
