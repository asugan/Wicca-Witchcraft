import React, { createContext, useState, useCallback, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Snackbar, Text } from "react-native-paper";
import { useMysticTheme } from "@/theme/use-mystic-theme";

export type ToastType = "success" | "error" | "info";

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  
  const theme = useMysticTheme();

  const showToast = useCallback((msg: string, toastType: ToastType = "info") => {
    setMessage(msg);
    setType(toastType);
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
          duration={3000}
          style={styles.snackbar}
          action={{
            label: "Kapat",
            onPress: hideToast,
            labelStyle: { color: theme.colors.onPrimary },
          }}
        >
          <Text style={styles.text}>{message}</Text>
        </Snackbar>
      </View>
    </ToastContext.Provider>
  );
};