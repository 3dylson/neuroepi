import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, Linking } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { Button, Switch, Text, List, Divider } from "react-native-paper";
import { User } from "@/app/model/User";
import { Crise } from "@/app/model/Crise";
import { RootParamList } from "@/app/types"; // Import your RootParamList
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKey } from "@/constants/DataKey";

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const navigation = useNavigation<NavigationProp<RootParamList>>(); // Specify navigation type

  // Check the current notification status when the component mounts
  useEffect(() => {
    const checkNotificationStatus = async () => {
      const settings = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(settings.granted); // Simply check if notifications are granted
    };

    checkNotificationStatus();
  }, []);

  // Handle deleting user data securely
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Deletar Conta",
      "Tem certeza de que deseja deletar sua conta? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            await User.clearLocalData(); // Delete secure data
            await Crise.deleteAllCrises(); // Delete all crises
            await AsyncStorage.multiRemove([DataKey.userFormIsComplete]); // Clear all async storage data
            Alert.alert(
              "Conta deletada",
              "Sua conta foi deletada com sucesso."
            );
            navigation.reset({
              index: 0,
              routes: [{ name: "register" }],
            });
          },
        },
      ]
    );
  };

  // Toggle notifications setting
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // If notifications are enabled, disable them
      await Notifications.setNotificationHandler(null);
      setNotificationsEnabled(false);
    } else {
      // Request permissions if notifications are not enabled
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === "granted") {
        // Enable notifications
        setNotificationsEnabled(true);
      } else if (status === "denied") {
        // Show alert to direct the user to settings
        Alert.alert(
          "Permissão necessária",
          "As notificações estão desativadas. Por favor, ative-as nas configurações do seu dispositivo.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configurações",
              onPress: () => {
                Linking.openSettings(); // Directs user to app settings
              },
            },
          ]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Configurações</Text>

      <List.Section>
        <List.Subheader>Preferências</List.Subheader>

        {/* Notification Settings */}
        <View style={styles.settingItem}>
          <Text>Ativar Notificações</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>

        <Divider />
      </List.Section>

      {/* Delete Account Button */}
      <View style={styles.settingItem}>
        <Button
          mode="contained"
          buttonColor="red"
          onPress={handleDeleteAccount}
        >
          Deletar Conta
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingItem: {
    marginVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default SettingsScreen;
