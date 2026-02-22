import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Dialog, Portal, Text } from "react-native-paper";

import { IncantationBlock } from "@/components/mystic/IncantationBlock";
import { getRitualDetailBySlug } from "@/db/repositories/ritual-repository";
import { trackEvent } from "@/lib/analytics";
import { typefaces } from "@/theme/tokens";
import { useMysticTheme } from "@/theme/use-mystic-theme";

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function RitualDetailScreen() {
  const router = useRouter();
  const theme = useMysticTheme();
  const styles = makeStyles(theme);

  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : (slug ?? "full-moon-release");

  const detail = useMemo(() => getRitualDetailBySlug(normalizedSlug), [normalizedSlug]);

  const [bookmarked, setBookmarked] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!detail) {
      return;
    }

    trackEvent("ritual_opened", {
      user_id: "local-user",
      tab_name: "grimoire",
      entity_id: detail.ritual.id,
      source: "ritual_detail",
    });
  }, [detail]);

  const selectedEntry = useMemo(
    () => detail?.materials.find((material) => material.linkedEntryId === selectedEntryId) ?? null,
    [detail?.materials, selectedEntryId]
  );

  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  if (!detail) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Ritual not found</Text>
          <Button mode="outlined" onPress={() => router.back()} textColor={theme.colors.primary}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.texture} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialCommunityIcons color={theme.colors.primary} name="arrow-left" size={24} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              const nextValue = !bookmarked;
              setBookmarked(nextValue);

              if (nextValue) {
                trackEvent("ritual_favorited", {
                  user_id: "local-user",
                  tab_name: "grimoire",
                  entity_id: detail.ritual.id,
                  source: "ritual_detail",
                });
              }
            }}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons
              color={theme.colors.primary}
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
            />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <MaterialCommunityIcons color={theme.colors.primary} name="share-variant-outline" size={22} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground imageStyle={styles.heroImage} source={{ uri: detail.ritual.coverImage }} style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTag}>{detail.ritual.category}</Text>
          <Text style={styles.heroTitle}>{detail.ritual.title}</Text>
        </ImageBackground>

        <Text style={styles.description}>{detail.ritual.summary}</Text>

        <View style={styles.metadataWrap}>
          <Text style={styles.metadataText}>Difficulty: {detail.ritual.difficulty}</Text>
          <Text style={styles.metadataText}>Moon: {detail.ritual.moonPhase.replaceAll("-", " ")}</Text>
          <Text style={styles.metadataText}>{detail.ritual.durationMinutes} min</Text>
        </View>

        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>Materials</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.ingredientsCard}>
          {detail.materials.map((material) => {
            const selected = Boolean(checked[material.id]);
            const isLinked = Boolean(material.linkedEntryId);

            return (
              <View key={material.id} style={styles.ingredientRow}>
                <Pressable
                  onPress={() => setChecked((prev) => ({ ...prev, [material.id]: !prev[material.id] }))}
                  style={[styles.checkbox, selected && styles.checkboxChecked]}
                >
                  {selected ? <MaterialCommunityIcons color={theme.colors.onPrimary} name="check" size={14} /> : null}
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!isLinked || !material.linkedEntryId) {
                      return;
                    }

                    setSelectedEntryId(material.linkedEntryId);
                    trackEvent("material_link_clicked", {
                      user_id: "local-user",
                      tab_name: "grimoire",
                      entity_id: material.id,
                      source: detail.ritual.id,
                    });
                  }}
                  style={styles.materialLabelWrap}
                >
                  <Text style={[styles.ingredientText, selected && styles.ingredientTextSelected]}>{material.name}</Text>
                  {material.quantityLabel ? <Text style={styles.quantityText}>{material.quantityLabel}</Text> : null}
                  {isLinked ? (
                    <View style={styles.linkHintWrap}>
                      <MaterialCommunityIcons color={theme.colors.primary} name="open-in-new" size={12} />
                      <Text style={styles.linkHintText}>Library</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
          <Text style={styles.countLabel}>
            {checkedCount} / {detail.materials.length} prepared
          </Text>
        </View>

        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>The Ritual</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.stepsWrap}>
          {detail.steps.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepMarker}>
                <Text style={styles.stepMarkerText}>{roman[index] ?? `${step.stepOrder}`}</Text>
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepContent}>{step.content}</Text>
              </View>
              {index !== detail.steps.length - 1 ? <View style={styles.stepDivider} /> : null}
            </View>
          ))}
        </View>

        <IncantationBlock text={detail.ritual.incantation} />

        <Text style={styles.quote}>{detail.ritual.safetyNote}</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          contentStyle={styles.beginButtonContent}
          icon="play-circle-outline"
          mode="contained"
          style={styles.beginButton}
          textColor={theme.colors.onPrimary}
        >
          Begin Ritual Mode
        </Button>
      </View>

      <Portal>
        <Dialog
          onDismiss={() => setSelectedEntryId(null)}
          visible={Boolean(selectedEntry)}
          style={{ backgroundColor: theme.colors.surface1 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>{selectedEntry?.linkedEntryTitle}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.previewSummary}>{selectedEntry?.linkedEntrySummary}</Text>
            <Text style={styles.previewMeta}>{selectedEntry?.linkedEntryProperties}</Text>
            <Text style={styles.previewMeta}>{selectedEntry?.linkedEntryCorrespondences}</Text>
            <Text style={styles.previewMeta}>Cleansing: {selectedEntry?.linkedEntryCleansingMethod}</Text>
            <Text style={styles.previewMeta}>Care: {selectedEntry?.linkedEntryCareNote}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                if (selectedEntry?.linkedEntryId) {
                  trackEvent("library_entry_viewed", {
                    user_id: "local-user",
                    tab_name: "library",
                    entity_id: selectedEntry.linkedEntryId,
                    source: detail.ritual.id,
                  });
                }

                setSelectedEntryId(null);
              }}
              textColor={theme.colors.primary}
            >
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const makeStyles = (theme: ReturnType<typeof useMysticTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.backgroundElevated,
    },
    texture: {
      position: "absolute",
      top: -140,
      right: -120,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: `${theme.colors.primary}12`,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      backgroundColor: `${theme.colors.backgroundElevated}D9`,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.04)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingBottom: 120,
    },
    hero: {
      height: 262,
      justifyContent: "flex-end",
      padding: 20,
    },
    heroImage: {
      resizeMode: "cover",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(13,10,6,0.45)",
    },
    heroTag: {
      color: `${theme.colors.primary}E0`,
      textTransform: "uppercase",
      letterSpacing: 2,
      fontSize: 12,
      marginBottom: 6,
    },
    heroTitle: {
      color: theme.colors.primary,
      fontFamily: typefaces.display,
      fontSize: 44,
      lineHeight: 50,
      fontStyle: "italic",
      fontWeight: "700",
    },
    description: {
      marginTop: 16,
      color: "#D6CFBF",
      fontSize: 18,
      lineHeight: 28,
      textAlign: "center",
      paddingHorizontal: 22,
    },
    metadataWrap: {
      marginTop: 10,
      paddingHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    metadataText: {
      color: theme.colors.primary,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}4D`,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      textTransform: "capitalize",
      fontSize: 11,
    },
    sectionTitleWrap: {
      marginTop: 26,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: `${theme.colors.primary}57`,
    },
    sectionTitle: {
      color: theme.colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontSize: 20,
      fontWeight: "700",
    },
    ingredientsCard: {
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 12,
      backgroundColor: `${theme.colors.surface2}B3`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}29`,
      padding: 16,
      gap: 12,
    },
    ingredientRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    materialLabelWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}85`,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    ingredientText: {
      color: "#E9E3D6",
      fontSize: 17,
    },
    ingredientTextSelected: {
      color: theme.colors.primary,
    },
    quantityText: {
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
    },
    linkHintWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    linkHintText: {
      color: theme.colors.primary,
      fontSize: 11,
    },
    countLabel: {
      marginTop: 2,
      color: `${theme.colors.primary}B8`,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontSize: 11,
      fontWeight: "600",
    },
    stepsWrap: {
      marginTop: 8,
      paddingHorizontal: 20,
      gap: 16,
    },
    stepRow: {
      paddingLeft: 10,
    },
    stepMarker: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.backgroundElevated,
      marginBottom: 8,
    },
    stepMarkerText: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 10,
    },
    stepBody: {
      borderLeftWidth: 1,
      borderColor: `${theme.colors.primary}33`,
      marginLeft: 11,
      paddingLeft: 14,
    },
    stepTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontStyle: "italic",
      fontSize: 30,
      fontWeight: "700",
      lineHeight: 34,
    },
    stepContent: {
      marginTop: 6,
      color: "#D8D2C4",
      fontSize: 17,
      lineHeight: 27,
    },
    stepDivider: {
      marginTop: 16,
      marginBottom: 2,
      height: 1,
      backgroundColor: `${theme.colors.primary}40`,
      marginLeft: 25,
    },
    quote: {
      marginTop: 16,
      marginBottom: 18,
      textAlign: "center",
      color: `${theme.colors.primary}B3`,
      fontStyle: "italic",
      fontSize: 14,
      marginHorizontal: 20,
      lineHeight: 21,
    },
    bottomBar: {
      position: "absolute",
      bottom: 16,
      left: 20,
      right: 20,
    },
    beginButton: {
      borderRadius: 999,
      backgroundColor: theme.colors.primaryBright,
    },
    beginButtonContent: {
      height: 54,
    },
    previewSummary: {
      color: theme.colors.onSurface,
      lineHeight: 20,
      marginBottom: 8,
    },
    previewMeta: {
      color: theme.colors.onSurfaceMuted,
      lineHeight: 19,
      marginBottom: 4,
    },
    notFoundWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 24,
    },
    notFoundTitle: {
      color: theme.colors.onSurface,
      fontFamily: typefaces.display,
      fontSize: 28,
      textAlign: "center",
    },
  });
