import * as SecureStore from "expo-secure-store";
import { DataKey } from "@/constants/DataKey";

export class Crise {
  id?: string;
  dateTime?: Date;
  duration?: string;
  type?: string;
  intensity?: string;
  recoverySpeed?: string;
  symptomsBefore?: string[];
  postState?: string;
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

  constructor(init?: Partial<Crise>) {
    Object.assign(this, init);
  }

  // Serialize crises and save to local storage
  static async saveCrises(crises: Crise[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        DataKey.CRISES_DATA_KEY,
        JSON.stringify(crises)
      );
    } catch (error) {
      console.error("Error saving crises", error);
    }
  }

  // Retrieve the list of crises from local storage
  static async getCrises(): Promise<Crise[] | null> {
    try {
      const crisesData = await SecureStore.getItemAsync(
        DataKey.CRISES_DATA_KEY
      );
      return crisesData
        ? JSON.parse(crisesData).map((c: Crise) => new Crise(c))
        : null;
    } catch (error) {
      console.error("Error retrieving crises", error);
      return null;
    }
  }

  // Add or update a crise
  static async addOrUpdateCrise(newCrise: Crise): Promise<void> {
    const crises = (await Crise.getCrises()) || [];
    const existingIndex = crises.findIndex((c) => c.id === newCrise.id);
    if (existingIndex !== -1) {
      crises[existingIndex] = newCrise; // Update existing crise
    } else {
      crises.push(newCrise); // Add new crise
    }
    await Crise.saveCrises(crises);
  }

  // Delete a crise
  static async deleteCrise(id: string): Promise<void> {
    const crises = (await Crise.getCrises()) || [];
    const updatedCrises = crises.filter((c) => c.id !== id);
    await Crise.saveCrises(updatedCrises);
  }
}
