import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, Linking } from "react-native";
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Button, Switch, Text, List, Divider } from "react-native-paper";
import { User } from "@/app/model/User";
import { Crisis } from "@/app/model/Crisis/Crisis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKey } from "@/constants/DataKey";

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const navigation = useNavigation<NavigationProp<ParamListBase>>(); // Specify navigation type

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
            await Crisis.deleteAllCrises(); // Delete all crises
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

  const toggleNotifications = async () => {
    try {
      if (notificationsEnabled) {
        // Disable notifications
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
        setNotificationsEnabled(false);
      } else {
        // Request permissions for notifications
        const { status } = await Notifications.requestPermissionsAsync();

        if (status === "granted") {
          // Enable notifications
          await Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
          });
          setNotificationsEnabled(true);
        } else if (status === "denied") {
          // Show alert for denied permissions
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
        } else {
          console.warn("Notification permissions status:", status);
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao tentar configurar as notificações. Tente novamente mais tarde."
      );
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
