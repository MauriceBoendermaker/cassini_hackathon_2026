import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function Collapsible({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.container}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.header} hitSlop={8}>
        <Text style={styles.chevron}>{open ? "▾" : "▸"}</Text>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  chevron: { color: "#64748b", fontSize: 14, marginRight: 8, width: 12 },
  title: {
    fontSize: 13,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  body: { marginTop: 8 },
});
