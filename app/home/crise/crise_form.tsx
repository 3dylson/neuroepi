import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  RadioButton,
  Checkbox,
  FAB,
  Divider,
  Card,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Crise } from "@/app/model/Crise";
import { generateId } from "@/app/utils/Utils";
import { set } from "lodash";
import { User } from "@/app/model/User";
import Gender from "@/app/register/utils/GenderEnum";

interface CriseFormScreenProps {
  crise?: Crise; // Optional crise for editing
}

const CriseFormScreen: React.FC<CriseFormScreenProps> = ({ crise }) => {
  const [dateTime, setDateTime] = useState(crise?.dateTime || new Date());
  const [duration, setDuration] = useState(crise?.duration || "");
  const [type, setType] = useState(crise?.type || "");
  const [intensity, setIntensity] = useState(crise?.intensity || "");
  const [recoverySpeed, setRecoverySpeed] = useState(
    crise?.recoverySpeed || ""
  );
  const [symptomsBefore, setSymptomsBefore] = useState<string[]>(
    crise?.symptomsBefore || []
  );
  const [postState, setPostState] = useState(crise?.postState || "");
  const [tookMedication, setTookMedication] = useState<boolean | undefined>(
    crise?.tookMedication || undefined
  );
  const [whatWasDoing, setWhatWasDoing] = useState(crise?.whatWasDoing || "");
  const [menstruationOrPregnancy, setMenstruationOrPregnancy] = useState(
    crise?.menstruationOrPregnancy || ""
  );
  const [recentChangeOnMedication, setRecentChangeOnMedication] = useState(
    crise?.recentChangeOnMedication || false
  );
  const [alcohol, setAlcohol] = useState(crise?.alcohol || false);
  const [food, setFood] = useState(crise?.food || "");
  const [emotionalStress, setEmotionalStress] = useState(
    crise?.emotionalStress || ""
  );
  const [substanceUse, setSubstanceUse] = useState(
    crise?.substanceUse || false
  );
  const [selfHarm, setSelfHarm] = useState(crise?.selfHarm || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sleepStatus, setSleepStatus] = useState(crise?.sleepStatus || "");

  const [couldHaveMenstruation, setCouldHaveMenstruation] =
    useState<boolean>(false);

  const [ateSomethingDifferent, setAteSomethingDifferent] =
    useState<boolean>(false);

  const [onMyPeriod, setOnMyPeriod] = useState<boolean>(false);
  const [underEmotionalStress, setUnderEmotionalStress] =
    useState<boolean>(false);

  const params = useLocalSearchParams();

  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser) {
        let gender = savedUser.gender;
        let age = savedUser.birthDate?.getAge();
        if (gender === Gender.Female && age) {
          setCouldHaveMenstruation(age > 12);
        }
        console.log("Could have menstruation:", couldHaveMenstruation);
      }
    };

    loadUserData();
  }, []);

  const handleSetTookMedication = (value: string) => {
    setTookMedication(value === "null" ? undefined : value === "true");
  };

  const handleSetRecentChangeOnMedication = (value: string) => {
    setRecentChangeOnMedication(value === "true");
  };

  const handleSetAlcohol = (value: string) => {
    setAlcohol(value === "true");
  };

  const handleSetFood = (value: string) => {
    let ateSomethingDifferent = value === "true";
    if (ateSomethingDifferent) {
      setFood("");
    } else {
      setFood(value);
    }
    setAteSomethingDifferent(ateSomethingDifferent);
  };

  const handleSetEmotionalStress = (value: string) => {
    let underEmotionalStress = value === "Sim";
    let showEmotionalStressOptions =
      underEmotionalStress ||
      value === "Estresse" ||
      value === "Preocupação" ||
      value === "Excitação";
    if (underEmotionalStress) {
      setEmotionalStress("");
    } else {
      setEmotionalStress(value);
    }
    setUnderEmotionalStress(showEmotionalStressOptions);
  };

  const handleSetMenstruationOrPregnancy = (value: string) => {
    let onMyPeriod = value === "Estou no Periodo Menstrual";
    let showPeriodOptions =
      onMyPeriod ||
      value === "3 dias anteriores ao periodo" ||
      value === "No periodo";
    if (onMyPeriod) {
      setMenstruationOrPregnancy("");
    } else {
      setMenstruationOrPregnancy(value);
    }
    setOnMyPeriod(showPeriodOptions);
  };

  const handleSetSubstanceUse = (value: string) => {
    setSubstanceUse(value === "true");
  };

  const handleSetSelfHarm = (value: string) => {
    setSelfHarm(value === "true");
  };

  const handleSave = async () => {
    const newCrise = new Crise({
      id: crise?.id || generateId(),
      dateTime,
      duration,
      type,
      intensity,
      recoverySpeed,
      symptomsBefore,
      postState,
      tookMedication,
      whatWasDoing,
      menstruationOrPregnancy,
      alcohol,
      food,
      emotionalStress,
      substanceUse,
      selfHarm,
    });

    await Crise.addOrUpdateCrise(newCrise);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineLarge" style={styles.header}>
        Ficha Detalhe de Crise
      </Text>

      {/* Date and Time */}
      <Card style={styles.card}>
        <Card.Title title="Data e Hora" />
        <Card.Content>
          <TextInput
            label="Data e Hora"
            value={
              dateTime.toDayMonthYearString() +
              " - " +
              dateTime.toHourMinuteString()
            } // Format the date/time input
            onFocus={() => setShowDatePicker(true)}
            onPress={() => setShowDatePicker(true)}
            mode="outlined"
            editable={false}
            style={styles.input}
          />
          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateTime(selectedDate);
              }}
            />
          )}
        </Card.Content>
      </Card>

      {/* Duration */}
      <Card style={styles.card}>
        <Card.Title title="Duração da Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setDuration} value={duration}>
            <RadioButton.Item label="< 1 min" value="< 1 min" />
            <RadioButton.Item label="1 a 3 minutos" value="1 a 3 minutos" />
            <RadioButton.Item label="> 5 minutos" value="> 5 minutos" />
            <RadioButton.Item label="Não sei" value="Não sei" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Type of Crisis */}
      <Card style={styles.card}>
        <Card.Title title="Tipo de Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setType} value={type}>
            <RadioButton.Item label="Desmaio" value="Desmaio" />
            <RadioButton.Item label="Ausência" value="Ausência" />
            <RadioButton.Item label="Convulsão" value="Convulsão" />
            <RadioButton.Item label="Não sei" value="Não sei" />
            <RadioButton.Item label="Outras" value="Outras" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Intensity */}
      <Card style={styles.card}>
        <Card.Title title="Intensidade da Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setIntensity} value={intensity}>
            <RadioButton.Item label="Leve" value="Leve" />
            <RadioButton.Item label="Moderada" value="Moderada" />
            <RadioButton.Item label="Forte" value="Forte" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Recovery Speed */}
      <Card style={styles.card}>
        <Card.Title title="Recuperação da Crise" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={setRecoverySpeed}
            value={recoverySpeed}
          >
            <RadioButton.Item label="Imediata" value="Imediata" />
            <RadioButton.Item label="Rápida" value="Rápida" />
            <RadioButton.Item label="Demorada" value="Demorada" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Symptoms Before Crisis */}
      <Card style={styles.card}>
        <Card.Title title="Sintomas Antes da Crise" />
        <Card.Content>
          {[
            "Nenhum",
            "Sintomas Gástricos",
            "Ansiedade/Palpitações",
            "Palidez e suor frio",
            "Alterações de visão",
            "Dormência no corpo",
            "Zumbidos ou outros ruidos",
            "Tontura",
            "Outros",
          ].map((symptom) => (
            <Checkbox.Item
              key={symptom}
              label={symptom}
              status={
                symptomsBefore.includes(symptom) ? "checked" : "unchecked"
              }
              onPress={() =>
                setSymptomsBefore((prev) =>
                  prev.includes(symptom)
                    ? prev.filter((s) => s !== symptom)
                    : [...prev, symptom]
                )
              }
            />
          ))}
        </Card.Content>
      </Card>

      {/* Post Crisis State */}
      <Card style={styles.card}>
        <Card.Title title="Estado após a Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setPostState} value={postState}>
            <RadioButton.Item label="Sonolência" value="Sonolência" />
            <RadioButton.Item label="Confusão Mental" value="Confusão Mental" />
            <RadioButton.Item label="Cefaleia" value="Cefaleia" />
            <RadioButton.Item
              label="Náuseas e vômitos"
              value="Náuseas e vômitos"
            />
            <RadioButton.Item label="Tontura" value="Tontura" />
            <RadioButton.Item label="Normal" value="Normal" />
            <RadioButton.Item label="Outros" value="Outros" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Took Medication */}
      <Card style={styles.card}>
        <Card.Title
          titleNumberOfLines={2}
          title="Tomou seu medicamento corretamente nas 24-48 horas que precederam a crise?"
        />
        <Card.Content>
          <RadioButton.Group
            onValueChange={handleSetTookMedication}
            value={tookMedication?.toString().orDefault("null")!!}
          >
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
            <RadioButton.Item label="Não tomo nenhuma medicação" value="null" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* What was doing */}
      <Card style={styles.card}>
        <Card.Title
          titleNumberOfLines={2}
          title="O que fazia nos momentos que precederam a crise?"
        />
        <Card.Content>
          <RadioButton.Group
            onValueChange={setWhatWasDoing}
            value={whatWasDoing}
          >
            <RadioButton.Item label="Estudando" value="Estudando" />
            <RadioButton.Item
              label="Assistindo TV ou ao Celular"
              value="Assistindo TV ou ao Celular"
            />
            <RadioButton.Item
              label="Atividade Física"
              value="Atividade Física"
            />
            <RadioButton.Item label="Dormindo" value="Dormindo" />
            <RadioButton.Item label="Após acordar" value="Após acordar" />
            <RadioButton.Item label="Outro" value="Outro" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Text variant="headlineSmall">Fatores associados à crise</Text>

      {/* Menstruation or Pregnancy */}
      {couldHaveMenstruation && (
        <Card style={styles.card}>
          <Card.Title titleNumberOfLines={2} title="Menstruação ou Gravidez?" />
          <Card.Content>
            <RadioButton.Group
              onValueChange={handleSetMenstruationOrPregnancy}
              value={menstruationOrPregnancy}
            >
              <RadioButton.Item label="Estou Grávida" value="Estou Grávida" />
              <RadioButton.Item
                label="Estou no Periodo Menstrual"
                value="Estou no Periodo Menstrual"
              />
              {onMyPeriod && (
                <RadioButton.Item
                  style={styles.insideRadioItem}
                  label="3 dias anteriores ao periodo"
                  value="3 dias anteriores ao periodo"
                />
              )}
              {onMyPeriod && (
                <RadioButton.Item
                  style={styles.insideRadioItem}
                  label="No periodo"
                  value="No periodo"
                />
              )}
              <RadioButton.Item label="Não" value="Não" />
            </RadioButton.Group>
          </Card.Content>
        </Card>
      )}

      {/* Medicine Change */}
      <Card style={styles.card}>
        <Card.Title title="Mudança recente de medicamentos?" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={handleSetRecentChangeOnMedication}
            value={recentChangeOnMedication.toString()}
          >
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Como foi sua noite de sono?" />
        <Card.Content>
          <RadioButton.Group onValueChange={setSleepStatus} value={sleepStatus}>
            <RadioButton.Item label="Boa" value="Boa" />
            <RadioButton.Item label="Razoável" value="Razoável" />
            <RadioButton.Item label="Ruim" value="Ruim" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Alcohol */}
      <Card style={styles.card}>
        <Card.Title
          titleNumberOfLines={2}
          title="Ingeriu bebida alcoolica nas últimas 24 horas antes da crise"
        />
        <Card.Content>
          <RadioButton.Group
            onValueChange={handleSetAlcohol}
            value={alcohol.toString()}
          >
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Food */}
      <Card style={styles.card}>
        <Card.Title title="Comeu algum alimento diferente?" />
        <Card.Content>
          <RadioButton.Group onValueChange={handleSetFood} value={food}>
            {!ateSomethingDifferent && (
              <RadioButton.Item label="Sim" value="true" />
            )}
            {ateSomethingDifferent && (
              <TextInput
                label="Qual?"
                value={food}
                onChangeText={setFood}
                mode="outlined"
                style={styles.input}
              />
            )}
            <RadioButton.Item label="Não" value="false" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Emotional Stress */}
      <Card style={styles.card}>
        <Card.Title
          titleNumberOfLines={3}
          title="Estava sob estresse emocional, excitação ou preocupação anteriormente à crise"
        />
        <Card.Content>
          <RadioButton.Group
            onValueChange={handleSetEmotionalStress}
            value={emotionalStress}
          >
            <RadioButton.Item label="Sim" value="Sim" />
            {underEmotionalStress && (
              <RadioButton.Item
                style={styles.insideRadioItem}
                label="Estresse"
                value="Estresse"
              />
            )}
            {underEmotionalStress && (
              <RadioButton.Item
                style={styles.insideRadioItem}
                label="Preocupação"
                value="Preocupação"
              />
            )}
            {underEmotionalStress && (
              <RadioButton.Item
                style={styles.insideRadioItem}
                label="Excitação"
                value="Excitação"
              />
            )}
            <RadioButton.Item label="Não" value="Não" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Substance Use */}
      <Card style={styles.card}>
        <Card.Title title="Fez uso de substâncias ilícitas?" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={handleSetSubstanceUse}
            value={substanceUse.toString()}
          >
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Self Harm */}
      <Card style={styles.card}>
        <Card.Title title="Autolesão" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={handleSetSelfHarm}
            value={selfHarm.toString()}
          >
            <RadioButton.Item label="Sim" value="true" />
            <RadioButton.Item label="Não" value="false" />
          </RadioButton.Group>
        </Card.Content>
      </Card>
      <FAB icon="check" onPress={handleSave} style={styles.fab} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginVertical: 8,
  },
  fab: {
    marginTop: 16,
    marginBottom: 52,
    alignSelf: "center",
  },
  card: {
    marginVertical: 10,
    borderRadius: 10,
    padding: 8,
    elevation: 2,
  },

  insideRadioItem: {
    marginStart: 16,
  },
});

export default CriseFormScreen;
