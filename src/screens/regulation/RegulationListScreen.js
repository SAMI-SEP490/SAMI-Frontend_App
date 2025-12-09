import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

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
  const [expandedId, setExpandedId] = useState(null); // Track expanded item

  // 🔹 Fetch list regulations
  const fetchRegulations = async () => {
    try {
      setLoading(true);
      const res = await listRegulations();
      const regs = res?.data ?? [];

      // Filter: tenants/all & published
      const publishedRegs = regs.filter(
        (r) =>
          (r.target === "tenants" || r.target === "all") &&
          r.status === "published"
      );

      // Fetch content details
      const regsWithContent = await Promise.all(
        publishedRegs.map(async (r) => {
          try {
            const detail = await getRegulationById(r.regulation_id);
            return { ...r, content: detail?.data?.content || "" };
          } catch (err) {
            return { ...r, content: "" };
          }
        })
      );

      setRegulations(regsWithContent);
    } catch (err) {
      console.error("❌ Lỗi tải quy định:", err);
      setRegulations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // 🔹 Render item
  const renderRegulationItem = ({ item, index }) => {
    const isExpanded = expandedId === item.regulation_id;
    const dateStr = item.effective_date
      ? new Date(item.effective_date).toLocaleDateString("vi-VN")
      : "N/A";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.regulation_id)}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
            <View style={styles.iconBox}>
              <Ionicons name="book-outline" size={22} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.itemDate}>Hiệu lực từ: {dateStr}</Text>
            </View>
          </View>
          
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.muted} 
          />
        </View>

        {/* Content (Collapsible) */}
        {isExpanded && (
          <View style={styles.contentBox}>
            <View style={styles.divider} />
            <Text style={styles.itemContent}>
              {item.content || "Không có nội dung chi tiết."}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header title="Nội quy & Quy định" isHome={false} />

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
             <ActivityIndicator size="large" color={colors.brand} />
             <Text style={{ marginTop: 10, color: colors.muted }}>Đang tải quy định...</Text>
          </View>
        ) : (
          <FlatList
            data={regulations}
            renderItem={renderRegulationItem}
            keyExtractor={(item) => item.regulation_id.toString()}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Text style={{ color: colors.muted }}>
                  Hiện chưa có quy định nào được ban hành.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand, // Blue Root
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Gray Sheet
    marginTop: -24, // Overlap Header
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: spacing.md,
    // Add extra padding to clear the header curve
    paddingTop: spacing.xl + 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E0F2FE", // Light Blue
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  contentBox: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  itemContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
});

export default RegulationListScreen;
