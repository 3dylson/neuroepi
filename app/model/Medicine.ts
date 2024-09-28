import { DoseFrequency } from "@/constants/DoseFrequency";
import { DoseUnitEnum } from "@/constants/DoseUnitEnum";

export class Medicine {
  id: string;
  name: string;
  dose: string;
  doseUnit: DoseUnitEnum;
  frequency: DoseFrequency;
  times: string[];
  notes: string;
  relatedMedication: string;
  isForEpilepsy: boolean;
  isAlarmSet: boolean;

  constructor(
    id: string,
    name: string,
    dose: string,
    doseUnit: DoseUnitEnum,
    frequency: DoseFrequency,
    times: string[],
    notes: string,
    relatedMedication: string,
    isForEpilepsy: boolean,
    isAlarmSet: boolean
  ) {
    this.id = id;
    this.name = name;
    this.dose = dose;
    this.doseUnit = doseUnit;
    this.frequency = frequency;
    this.times = times;
    this.notes = notes;
    this.relatedMedication = relatedMedication;
    this.isForEpilepsy = isForEpilepsy;
    this.isAlarmSet = isAlarmSet;
  }
}
