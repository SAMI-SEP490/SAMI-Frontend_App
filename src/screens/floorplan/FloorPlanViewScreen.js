import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Header from "../../components/Header"; // Using our smart header
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { getMyBuildingDetails } from "../../service/api/building";
import {
  getFloorPlansByBuilding,
  getFloorPlanById,
} from "../../service/api/floorPlan";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ========= Helpers tính bounding box layout ========= */
function computeLayoutBounds(nodes = []) {
  if (!nodes.length) {
    return { minX: 0, minY: 0, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const { position = { x: 0, y: 0 }, type, data = {} } = node;
    let w = 0;
    let h = 0;

    if (type === "building") {
      const pts = Array.isArray(data.points) ? data.points : [];
      if (pts.length) {
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const minPx = Math.min(...xs);
        const maxPx = Math.max(...xs);
        const minPy = Math.min(...ys);
        const maxPy = Math.max(...ys);
        w = maxPx - minPx;
        h = maxPy - minPy;
      } else {
        w = data.w || 400;
        h = data.h || 400;
      }
    } else {
      w = data.w || 120;
      h = data.h || 80;
    }

    const left = position.x;
    const top = position.y;
    const right = left + w;
    const bottom = top + h;

    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return { minX: 0, minY: 0, width: 100, height: 100 };
  }

  const width = maxX - minX || 1;
  const height = maxY - minY || 1;

  return { minX, minY, width, height };
}

/* ========= Canvas vẽ layout trên mobile ========= */
function FloorPlanCanvas({ layout }) {
  const nodes = Array.isArray(layout?.nodes) ? layout.nodes : [];

  if (!nodes.length) {
    return (
      <View
        style={{
          marginTop: spacing.lg,
          padding: spacing.lg,
          borderRadius: 12,
          backgroundColor: "#fff",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.muted }}>
          Không có dữ liệu sơ đồ cho tầng này.
        </Text>
      </View>
    );
  }

  const {
    minX,
    minY,
    width: contentW,
    height: contentH,
  } = computeLayoutBounds(nodes);

  const CANVAS_W = SCREEN_WIDTH - spacing.lg * 2;
  const CANVAS_H = SCREEN_HEIGHT * 0.6;

  const scale =
    contentW && contentH
      ? Math.min(CANVAS_W / contentW, CANVAS_H / contentH) * 0.9
      : 1;

  const offsetX = (CANVAS_W - contentW * scale) / 2;
  const offsetY = (CANVAS_H - contentH * scale) / 2;

  return (
    <View
      style={{
        marginTop: spacing.lg,
        borderRadius: 16,
        backgroundColor: "#fff",
        padding: 8,
      }}
    >
      <View
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          borderRadius: 12,
          backgroundColor: "#f8fafc",
          overflow: "hidden",
        }}
      >
        {nodes.map((node) => {
          const { id, type, data = {}, position = { x: 0, y: 0 } } = node;
          let w = 0;
          let h = 0;

          if (type === "building") {
            const pts = Array.isArray(data.points) ? data.points : [];
            if (pts.length) {
              const xs = pts.map((p) => p.x);
              const ys = pts.map((p) => p.y);
              const minPx = Math.min(...xs);
              const maxPx = Math.max(...xs);
              const minPy = Math.min(...ys);
              const maxPy = Math.max(...ys);
              w = maxPx - minPx;
              h = maxPy - minPy;
            } else {
              w = data.w || 400;
              h = data.h || 400;
            }
          } else {
            w = data.w || 120;
            h = data.h || 80;
          }

          const left =
            (position.x - minX) * scale + (offsetX > 0 ? offsetX : 0);
          const top = (position.y - minY) * scale + (offsetY > 0 ? offsetY : 0);
          const width = w * scale;
          const height = h * scale;

          if (type === "building") {
            return (
              <View
                key={id}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width,
                  height,
                  borderWidth: 2,
                  borderColor: "#334155",
                  backgroundColor: "rgba(59,130,246,0.06)",
                  borderRadius: 8,
                }}
              />
            );
          }

          if (type === "small") {
            const label = data.label || "Icon";
            const borderColor = data.color || "#64748b";
            const bg = data.bg || "#f1f5f9";

            return (
              <View
                key={id}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width,
                  height,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor,
                  backgroundColor: bg,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: "#0f172a",
                    fontSize: 11,
                    textAlign: "center",
                  }}
                >
                  {label}
                </Text>
              </View>
            );
          }

          // default: block (Phòng)
          const label = data.label || "Phòng";
          const borderColor = data.color || "#1e40af";

          return (
            <View
              key={id}
              style={{
                position: "absolute",
                left,
                top,
                width,
                height,
                borderRadius: 10,
                borderWidth: 2,
                borderColor,
                backgroundColor: "#eef2ff",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: "#0f172a",
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ========= Màn chính ========= */
export default function FloorPlanViewScreen() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [lockedBuildingId, setLockedBuildingId] = useState(null);
  const [floorPlans, setFloorPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [planLayout, setPlanLayout] = useState(null);

  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  const selectedBuilding = buildings.find(
    (b) => b.building_id === selectedBuildingId,
  );
  // Lấy danh sách tòa nhà
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoadingBuildings(true);
        setError(null);
        const res = await getMyBuildingDetails();
        const list = res?.data || [];
        setBuildings(list);
        if (list.length > 0) {
          const id = list[0].building_id;
          setSelectedBuildingId(id);
          setLockedBuildingId(id);
        }
      } catch (e) {
        console.log("loadBuildings ERROR >>>", e);
        setError("Không tải được danh sách tòa nhà.");
      } finally {
        setLoadingBuildings(false);
      }
    };
    fetchBuildings();
  }, []);

  // Guard: nếu ai đó set lệch selectedBuildingId thì ép về lockedBuildingId
  useEffect(() => {
    if (!lockedBuildingId) return;
    if (selectedBuildingId !== lockedBuildingId) {
      setSelectedBuildingId(lockedBuildingId);
    }
  }, [selectedBuildingId, lockedBuildingId]);

  // Khi đổi tòa nhà -> lấy list floor plan của tòa đó
  useEffect(() => {
    const fetchFloorPlans = async () => {
      if (!selectedBuildingId) {
        setFloorPlans([]);
        setSelectedPlanId(null);
        setPlanLayout(null);
        return;
      }

      try {
        setLoadingPlans(true);
        setError(null);
        const res = await getFloorPlansByBuilding(selectedBuildingId);
        const plans = res?.data || [];
        // sắp xếp theo floor_number tăng dần
        plans.sort((a, b) => (a.floor_number || 0) - (b.floor_number || 0));
        setFloorPlans(plans);

        if (plans.length > 0) {
          setSelectedPlanId(plans[0].plan_id);
        } else {
          setSelectedPlanId(null);
          setPlanLayout(null);
        }
      } catch (e) {
        console.log("loadFloorPlans ERROR >>>", e);
        setError("Không tải được danh sách tầng.");
        setFloorPlans([]);
        setSelectedPlanId(null);
        setPlanLayout(null);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchFloorPlans();
  }, [selectedBuildingId]);

  // Khi đổi planId -> lấy chi tiết layout
  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedPlanId) {
        setPlanLayout(null);
        return;
      }

      try {
        setLoadingDetail(true);
        setError(null);
        const res = await getFloorPlanById(selectedPlanId);
        let detail = res?.data;
        let layout = detail?.layout || null;

        if (layout && typeof layout === "string") {
          try {
            layout = JSON.parse(layout);
          } catch (e) {
            console.log("parse layout error", e);
          }
        }

        setPlanLayout(layout || null);
      } catch (e) {
        console.log("loadPlanDetail ERROR >>>", e);
        setError("Không tải được sơ đồ cho tầng này.");
        setPlanLayout(null);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedPlanId]);

  const handleSelectFloorPlan = (plan) => {
    setSelectedPlanId(plan.plan_id);
  };

  const renderBuildingChips = () => {
    if (loadingBuildings) {
      return (
        <View style={{ paddingVertical: spacing.md }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      );
    }

    if (!buildings.length) {
      return (
        <Text style={{ color: colors.muted, marginTop: spacing.sm }}>
          Chưa có tòa nhà nào.
        </Text>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.sm }}
      >
        {buildings.map((b) => {
          const active = b.building_id === selectedBuildingId;
          return (
            <Pressable
              key={b.building_id}
              onPress={() => {
                if (lockedBuildingId) {
                  setSelectedBuildingId(lockedBuildingId); // ép về tòa đã lock
                  return;
                }
                setSelectedBuildingId(b.building_id);
              }}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 999,
                marginRight: spacing.sm,
                backgroundColor: active ? colors.brand : "#E8ECFF",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : colors.text,
                  fontWeight: "600",
                }}
              >
                {b.name || `Tòa #${b.building_id}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  const renderFloorChips = () => {
    if (loadingPlans) {
      return (
        <View style={{ paddingVertical: spacing.md }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      );
    }

    if (!floorPlans.length) {
      return (
        <Text style={{ color: colors.muted, marginTop: spacing.sm }}>
          Chưa có sơ đồ nào cho tòa này.
        </Text>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: spacing.sm }}
      >
        {floorPlans.map((plan) => {
          const active = plan.plan_id === selectedPlanId;
          return (
            <Pressable
              key={plan.plan_id}
              onPress={() => handleSelectFloorPlan(plan)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 999,
                marginRight: spacing.sm,
                backgroundColor: active ? colors.brand : "#F0F0F0",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : colors.text,
                  fontWeight: "600",
                }}
              >
                {plan.floor_number != null
                  ? `Tầng ${plan.floor_number}`
                  : "Không rõ tầng"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <Header title="Sơ đồ tòa nhà" isHome={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          Xem sơ đồ tòa nhà{" "}
          {selectedBuilding?.name
            ? selectedBuilding.name
            : selectedBuildingId
              ? `#${selectedBuildingId}`
              : ""}
        </Text>

        {error && (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              padding: spacing.sm,
              borderRadius: 8,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ color: "#B91C1C" }}>{error}</Text>
          </View>
        )}

        <Text
          style={{
            marginTop: spacing.lg,
            fontWeight: "600",
            color: colors.text,
          }}
        >
          Chọn tầng
        </Text>
        {renderFloorChips()}

        {loadingDetail ? (
          <ActivityIndicator
            color={colors.brand}
            size="large"
            style={{ marginTop: spacing.lg }}
          />
        ) : (
          <FloorPlanCanvas layout={planLayout} />
        )}
      </ScrollView>
    </View>
  );
}
