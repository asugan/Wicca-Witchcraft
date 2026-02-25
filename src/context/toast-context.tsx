import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useMysticTheme } from "@/theme/use-mystic-theme";

export type ToastType = "success" | "error" | "info";

export type ToastAction = { label: string; onPress: () => void };

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastAction, duration?: number) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [customAction, setCustomAction] = useState<ToastAction | undefined>(undefined);
  const [duration, setDuration] = useState<number>(3000);

  const { t } = useTranslation();
  const theme = useMysticTheme();

  const showToast = useCallback((msg: string, toastType: ToastType = "info", action?: ToastAction, toastDuration?: number) => {
    setMessage(msg);
    setType(toastType);
    setCustomAction(action);
    setDuration(toastDuration ?? 3000);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  // Determine background color based on toast type and current theme
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.danger;
      case "info":
      default:
        return theme.colors.info;
    }
  };

  const styles = StyleSheet.create({
    snackbar: {
      backgroundColor: getBackgroundColor(),
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.xl,
    },
    text: {
      color: theme.colors.onPrimary,
      fontSize: theme.typeScale.body,
      fontFamily: "serif", // Matching typefaces.body from tokens
    },
  });

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      <View style={{ flex: 1 }}>
        {children}
        <Snackbar
          visible={visible}
          onDismiss={hideToast}
          duration={duration}
          style={styles.snackbar}
          action={
            customAction
              ? { label: customAction.label, onPress: customAction.onPress, labelStyle: { color: theme.colors.onPrimary } }
              : { label: t("common.close"), onPress: hideToast, labelStyle: { color: theme.colors.onPrimary } }
          }
        >
          <Text style={styles.text}>{message}</Text>
        </Snackbar>
      </View>
    </ToastContext.Provider>
  );
};