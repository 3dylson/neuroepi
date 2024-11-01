import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKey } from "@/constants/DataKey";

export class Crisis {
  id?: string;
  dateTime?: Date;
  duration?: string;
  type?: string;
  intensity?: string;
  recoverySpeed?: string;
  symptomsBefore?: string[];
  postState?: string[];
  tookMedication?: boolean;
  whatWasDoing?: string;
  menstruationOrPregnancy?: string;
  recentChangeOnMedication?: boolean;
  sleepStatus?: string;
  alcohol?: boolean;
  food?: string;
  emotionalStress?: string;
  substanceUse?: boolean;
  selfHarm?: boolean;

  constructor(init?: Partial<Crisis>) {
    Object.assign(this, init);
  }

  // Serialize crises and save to AsyncStorage
  static async saveCrises(crises: Crisis[]): Promise<void> {
    try {
      const serializedCrises = JSON.stringify(crises);
      await AsyncStorage.setItem(DataKey.CRISES_DATA_KEY, serializedCrises);
    } catch (error) {
      console.error("Error saving crises", error);
    }
  }

  // Retrieve the list of crises from AsyncStorage
  static async getCrises(): Promise<Crisis[] | null> {
    try {
      const crisesData = await AsyncStorage.getItem(DataKey.CRISES_DATA_KEY);
      return crisesData
        ? JSON.parse(crisesData).map((c: Crisis) => new Crisis(c))
        : null;
    } catch (error) {
      console.error("Error retrieving crises", error);
      return null;
    }
  }

  // Add or update a crise
  static async addOrUpdateCrise(newCrise: Crisis): Promise<void> {
    const crises = (await Crisis.getCrises()) || [];
    const existingIndex = crises.findIndex((c) => c.id === newCrise.id);
    if (existingIndex !== -1) {
      crises[existingIndex] = newCrise; // Update existing crise
    } else {
      crises.push(newCrise); // Add new crise
    }
    await Crisis.saveCrises(crises);
  }

  // Delete a crise by ID
  static async deleteCrise(id: string): Promise<void> {
    const crises = (await Crisis.getCrises()) || [];
    const updatedCrises = crises.filter((c) => c.id !== id);
    await Crisis.saveCrises(updatedCrises);
  }

  // Delete all crises from AsyncStorage
  static async deleteAllCrises(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DataKey.CRISES_DATA_KEY);
    } catch (error) {
      console.error("Error deleting all crises", error);
    }
  }
}
