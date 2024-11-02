import * as SecureStore from "expo-secure-store";
import Gender from "../register/utils/GenderEnum";
import { Medicine } from "./Medicine";
import { DoseUnitEnum } from "@/constants/DoseUnitEnum";
import { DoseFrequency } from "@/constants/DoseFrequency";
import { DataKey } from "@/constants/DataKey";

export class User {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: Gender;
  phoneNumber?: string;
  phoneCountryCode?: string;
  email?: string;
  emergencyContact?: string;
  emergencyContact2?: string;
  diagnostic?: string;
  diagnosticDate?: Date;
  medicines?: Medicine[];
  allergies?: string[];
  surgery?: string[];
  neurostimulators?: string[];
  medicPhone?: string;
  medicPhone2?: string;

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  // Serialize the medicines array into a plain object before saving
  private serializeMedicines(): ReadonlyArray<any> {
    return (
      this.medicines?.map((medicine) => ({
        id: medicine.id,
        name: medicine.name,
        dose: medicine.dose,
        doseUnit: medicine.doseUnit, // String-based enum
        frequency: medicine.frequency, // String-based enum
        times: medicine.times,
        notes: medicine.notes,
        relatedMedication: medicine.relatedMedication,
        isForEpilepsy: medicine.isForEpilepsy,
        isAlarmSet: medicine.isAlarmSet,
      })) || []
    );
  }

  // Deserialize the medicines array from plain object
  private static deserializeMedicines(data: any[]): Medicine[] {
    return data.map(
      (medicine) =>
        new Medicine(
          medicine.id,
          medicine.name,
          medicine.dose,
          medicine.doseUnit as DoseUnitEnum, // Cast string to DoseUnitEnum
          medicine.frequency as DoseFrequency, // Cast string to DoseFrequency
          medicine.times,
          medicine.notes,
          medicine.relatedMedication,
          medicine.isForEpilepsy,
          medicine.isAlarmSet
        )
    );
  }

  // Serialize dates to ISO strings
  private serializeDates(data: any): any {
    for (const key in data) {
      if (data[key] instanceof Date) {
        data[key] = data[key].toISOString();
      }
    }
    return data;
  }

  // Method to save the user data securely
  async saveToLocal(): Promise<void> {
    try {
      let userData = {
        ...this,
        medicines: this.serializeMedicines(),
      };
      userData = this.serializeDates(userData);
      await SecureStore.setItemAsync(
        DataKey.USER_DATA_KEY,
        JSON.stringify(userData)
      );
      console.log("User data saved successfully");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error saving user data: ", error.message, error.stack);
      } else {
        console.error("Unknown error saving user data", error);
      }
    }
  }

  // Static method to retrieve the user data from local storage
  static async getFromLocal(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(DataKey.USER_DATA_KEY);
      if (userData) {
        const parsedData = JSON.parse(userData);

        // Safely parse dates only if they are strings
        if (typeof parsedData.birthDate === "string") {
          parsedData.birthDate = new Date(parsedData.birthDate);
        } else {
          parsedData.birthDate = undefined; // Ensure undefined if no date
        }

        if (typeof parsedData.diagnosticDate === "string") {
          parsedData.diagnosticDate = new Date(parsedData.diagnosticDate);
        } else {
          parsedData.diagnosticDate = undefined; // Ensure undefined if no date
        }

        // Deserialize the medicines array
        parsedData.medicines = this.deserializeMedicines(
          parsedData.medicines || []
        );

        console.log("User data retrieved successfully");

        // Return the User object with parsed data
        return new User(parsedData);
      }
      console.log("No user data found");
      return null;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "Error retrieving user data: ",
          error.message,
          error.stack
        );
      } else {
        console.error("Unknown error retrieving user data", error);
      }
      return null;
    }
  }

  // Method to update user data (useful for multi-screen registration)
  async updateUserData(updatedData: Partial<User>): Promise<void> {
    try {
      const currentUserData = await User.getFromLocal();
      const newUserData = { ...currentUserData, ...updatedData };
      Object.assign(this, newUserData); // Update current instance
      await this.saveToLocal(); // Save updated user data
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating user data: ", error.message, error.stack);
      } else {
        console.error("Unknown error updating user data", error);
      }
    }
  }

  // Method to delete user data from local storage (if needed)
  static async clearLocalData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(DataKey.USER_DATA_KEY);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error clearing user data: ", error.message, error.stack);
      } else {
        console.error("Unknown error clearing user data", error);
      }
    }
  }
}
