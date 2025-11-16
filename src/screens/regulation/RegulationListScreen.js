// src/screens/regulation/RegulationListScreen.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../../components/Header";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

import {
  listRegulations,
  getRegulationById,
} from "../../service/api/regulation";

const RegulationListScreen = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch list regulations published
  const fetchRegulations = async () => {
    try {
      setLoading(true);
      const res = await listRegulations();
      const regs = res?.data ?? [];

      // chỉ lấy target tenants/all và status published
      const publishedRegs = regs.filter(
        (r) =>
          (r.target === "tenants" || r.target === "all") &&
          r.status === "published"
      );

      // Lấy nội dung riêng cho mỗi regulation
      const regsWithContent = await Promise.all(
        publishedRegs.map(async (r) => {
          try {
            const detail = await getRegulationById(r.regulation_id);
            return { ...r, content: detail?.data?.content || "" };
          } catch (err) {
            console.error(
              `❌ Lỗi lấy nội dung regulation ${r.regulation_id}:`,
              err
            );
            return { ...r, content: "" };
          }
        })
      );

      setRegulations(regsWithContent);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách regulation:", err);
      setRegulations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  // 🔹 Render item
  const renderRegulationItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemIndex}>#{index + 1}</Text>
      <Text style={styles.itemTitle}>Tiêu đề: {item.title}</Text>
      <Text style={styles.itemText}>
        Ngày hiệu lực:{" "}
        {item.effective_date
          ? new Date(item.effective_date).toLocaleDateString("vi-VN")
          : "N/A"}
      </Text>
      <Text style={styles.itemContent}>
        {item.content || "Không có nội dung"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Danh sách Regulation</Text>

        <FlatList
          data={regulations}
          renderItem={renderRegulationItem}
          keyExtractor={(item) => item.regulation_id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Không có regulation nào.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  listContainer: { paddingBottom: 16 },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIndex: { fontWeight: "bold", marginBottom: 4 },
  itemTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  itemText: { fontSize: 14, marginBottom: 4 },
  itemContent: { fontSize: 14, marginTop: 6 },
});

export default RegulationListScreen;
