import Gender from "../register/utils/GenderEnum";
import { Medicine } from "./Medicine";

export class User {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: Gender;
  phoneNumber?: string;
  email?: string;
  emergencyContact?: string;
  emergencyContact2?: string;
  diagnostic?: string;
  diagnosticDate?: Date;
  medicines?: Medicine[];
  surgery?: string[];
  neurostimulators?: string[];
  medicPhone?: string;
  medicPhone2?: string;

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }
}
