import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Alert, View } from "react-native";
import {
  Text,
  TextInput,
  RadioButton,
  Checkbox,
  FAB,
  Card,
  IconButton,
  Button,
} from "react-native-paper";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Crisis } from "@/app/model/Crisis/Crisis";
import { generateId, isAndroid, isIOS } from "@/app/utils/Utils";
import { User } from "@/app/model/User";
import Gender from "@/app/register/utils/GenderEnum";
import CustomDateTimePicker from "@/components/CustomDateTimePicker";
import { DateUtils } from "@/app/utils/TimeUtils";

// TODO: This should be done with Enums or Constants
const CriseFormScreen: React.FC = () => {
  const params = useLocalSearchParams(); // Get the params from router
  const navigation = useNavigation();
  const [crise, setCrise] = useState<Crisis | null>(null);

  const [dateTime, setDateTime] = useState(new Date());
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("");
  const [intensity, setIntensity] = useState("");
  const [recoverySpeed, setRecoverySpeed] = useState("");
  const [symptomsBefore, setSymptomsBefore] = useState<string[]>([]);
  const [postState, setPostState] = useState<string[]>([]);
  const [tookMedication, setTookMedication] = useState<boolean | undefined>(
    undefined
  );
  const [whatWasDoing, setWhatWasDoing] = useState("");
  const [menstruationOrPregnancy, setMenstruationOrPregnancy] = useState("");
  const [recentChangeOnMedication, setRecentChangeOnMedication] =
    useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [food, setFood] = useState("");
  const [emotionalStress, setEmotionalStress] = useState("");
  const [substanceUse, setSubstanceUse] = useState(false);
  const [selfHarm, setSelfHarm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAndroidCalender, setShowAndroidCalender] = useState(false);
  const [sleepStatus, setSleepStatus] = useState("");

  const [couldHaveMenstruation, setCouldHaveMenstruation] =
    useState<boolean>(false);

  const [ateSomethingDifferent, setAteSomethingDifferent] =
    useState<boolean>(false);

  const [doingSomethingDifferent, setDoingSomethingDifferent] =
    useState<boolean>(false);

  const [othersTypeOfCrisis, setOthersTypeOfCrisis] = useState(false);

  const [othersAuraSymptoms, setOthersAuraSymptoms] = useState<string>("");

  const [othersPostState, setOthersPostState] = useState<string>("");

  const [onMyPeriod, setOnMyPeriod] = useState<boolean>(false);
  const [underEmotionalStress, setUnderEmotionalStress] =
    useState<boolean>(false);

  useEffect(() => {
    if (params.id) {
      navigation.setOptions({
        headerTitle: "Editar Crise",
        headerRight: () => (
          <IconButton icon="delete" onPress={() => handleDelete()} />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => (
          <IconButton icon="help-circle" onPress={() => showHelpDialog()} />
        ),
      });
    }
  }, [navigation]);

  const showHelpDialog = () => {
    Alert.alert(
      "Lembre-se",
      "A ficha de detalhamento de crises é muito importante. Ela irá permitir que seu médico tenha um panorama adequado do que ocorre antes, durante e depois de sua crise. Deve ser preenchida com muita atenção.",
      [
        {
          text: "Entendi",
          style: "cancel",
        },
      ]
    );
  };

  const handleDelete = async () => {
    console.log("Delete Crise:", crise);
    if (crise) {
      // present a confirmation dialog
      Alert.alert(
        "Excluir Crise",
        "Tem certeza que deseja excluir esta crise?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              await Crisis.deleteCrise(crise.id!!);
              router.back();
            },
          },
        ]
      );
    }
  };

  // Fetch Crise from storage if ID is present in params
  useEffect(() => {
    const loadCrise = async () => {
      if (params.id) {
        const crises = await Crisis.getCrises();
        const foundCrise = crises?.find((c) => c.id === params.id);
        if (foundCrise) {
          console.log("Found Crise:", foundCrise);
          const date = foundCrise.dateTime
            ? new Date(foundCrise.dateTime)
            : new Date();
          // Set form values based on the found Crise
          setDateTime(date);
          setDuration(foundCrise.duration || "");
          handleOthersTypeOfCrisis(foundCrise.type || "");
          setIntensity(foundCrise.intensity || "");
          setRecoverySpeed(foundCrise.recoverySpeed || "");
          let auraSymptoms = foundCrise.symptomsBefore?.filter((s) =>
            getAuraSymptoms().includes(s)
          );
          setSymptomsBefore(auraSymptoms || []);
          handleSetOthersAuraSymptoms(foundCrise.symptomsBefore || []);
          let postState = foundCrise.postState?.filter((s) =>
            getSymptomsAfter().includes(s)
          );
          setPostState(postState || []);
          handleSetOtherPostState(foundCrise.postState || []);
          setTookMedication(foundCrise.tookMedication || undefined);
          handleSetWhatWasDoing(foundCrise.whatWasDoing || "");
          setMenstruationOrPregnancy(foundCrise.menstruationOrPregnancy || "");
          setRecentChangeOnMedication(
            foundCrise.recentChangeOnMedication || false
          );
          setAlcohol(foundCrise.alcohol || false);
          setFood(foundCrise.food || "");
          setEmotionalStress(foundCrise.emotionalStress || "");
          setSubstanceUse(foundCrise.substanceUse || false);
          setSelfHarm(foundCrise.selfHarm || false);
          setSleepStatus(foundCrise.sleepStatus || "");
          setCrise(foundCrise);
        }
      }
    };

    loadCrise();
  }, [params.id]);

  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = await User.getFromLocal();
      if (savedUser) {
        let gender = savedUser.gender;
        let age = savedUser.birthDate
          ? DateUtils.getAge(savedUser.birthDate)
          : undefined;
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

  const handleSetOtherPostState = (value: string[]) => {
    let othersPostState = value.filter((s) => !getSymptomsAfter().includes(s));
    setOthersPostState(othersPostState.join(", "));
  };

  const handleSetOthersAuraSymptoms = (value: string[]) => {
    let othersSymptoms = value.filter((s) => !getAuraSymptoms().includes(s));
    setOthersAuraSymptoms(othersSymptoms.join(", "));
  };

  const handleOthersTypeOfCrisis = (value: string) => {
    let othersTypeOfCrisis = value === "Outras";
    if (othersTypeOfCrisis) {
      setType("");
    } else {
      setType(value);
    }
    let showOthersTypeOfCrisis =
      othersTypeOfCrisis ||
      (!matchAnyTypeOfCrisis(value) && value.trim() !== "");
    console.log("showOthersTypeOfCrisis", showOthersTypeOfCrisis);
    setOthersTypeOfCrisis(showOthersTypeOfCrisis);
  };

  const handleSetWhatWasDoing = (value: string) => {
    let doingSomethingDifferent = value === "Outro";
    if (doingSomethingDifferent) {
      setWhatWasDoing("");
    } else {
      setWhatWasDoing(value);
    }
    let showDoingSomethingDifferent =
      doingSomethingDifferent ||
      (!matchAnyTypeOfWasDoing(value) && value.trim() !== "");
    setDoingSomethingDifferent(showDoingSomethingDifferent);
  };
  const matchAnyTypeOfWasDoing = (value: string) => {
    return getWasDoingTypes().includes(value);
  };

  const matchAnyTypeOfCrisis = (value: string) => {
    return getCrisisTypes().includes(value);
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
    let allSymptomsBefore = symptomsBefore.concat(
      othersAuraSymptoms
        .split(",")
        .map((item) => item.trim())
        .filter((s) => s.trim() !== "")
    );

    let allPostState = postState.concat(
      othersPostState
        .split(",")
        .map((item) => item.trim())
        .filter((s) => s.trim() !== "")
    );
    const newCrise = new Crisis({
      id: crise?.id || generateId(),
      dateTime,
      duration,
      type,
      intensity,
      recoverySpeed,
      symptomsBefore: allSymptomsBefore,
      postState: allPostState,
      tookMedication,
      whatWasDoing,
      menstruationOrPregnancy,
      alcohol,
      food,
      emotionalStress,
      substanceUse,
      selfHarm,
    });

    await Crisis.addOrUpdateCrise(newCrise);
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
              DateUtils.toDayMonthYearString(dateTime) +
              " - " +
              DateUtils.toHourMinuteString(dateTime)
            } // Format the date/time input
            // onFocus={() => setShowDatePicker(true)}
            // onPress={() => setShowDatePicker(true)}
            mode="outlined"
            editable={false}
            style={styles.input}
          />
          {isIOS() && (
            <DateTimePicker
              value={dateTime}
              mode="datetime"
              display="default"
              maximumDate={new Date()} // Restrict future dates
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateTime(selectedDate);
              }}
            />
          )}
          {showDatePicker && (
            <CustomDateTimePicker
              value={dateTime}
              mode="time"
              display="spinner"
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateTime(selectedDate);
              }}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
          {showAndroidCalender && (
            <CustomDateTimePicker
              value={dateTime}
              mode="date"
              display="calendar"
              maximumDate={new Date()} // Restrict future dates
              onChange={(_, selectedDate) => {
                setShowAndroidCalender(false);
                if (selectedDate) setDateTime(selectedDate);
              }}
              onDismiss={() => setShowAndroidCalender(false)}
            />
          )}
          {isAndroid() && (
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => setShowDatePicker(true)}
                style={styles.button}
              >
                Hora
              </Button>

              <Button
                mode="contained"
                onPress={() => setShowAndroidCalender(true)}
                style={styles.button}
              >
                Data
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Duration */}
      <Card style={styles.card}>
        <Card.Title title="Duração da Crise" />
        <Card.Content>
          <RadioButton.Group onValueChange={setDuration} value={duration}>
            <RadioButton.Item label="< 1 minuto" value="< 1 minuto" />
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
          <RadioButton.Group
            onValueChange={handleOthersTypeOfCrisis}
            value={type}
          >
            <RadioButton.Item label="Desmaio" value="Desmaio" />
            <RadioButton.Item label="Ausência" value="Ausência" />
            <RadioButton.Item label="Convulsão" value="Convulsão" />
            <RadioButton.Item label="Não sei" value="Não sei" />
            {!othersTypeOfCrisis && (
              <RadioButton.Item label="Outras" value="Outras" />
            )}
            {othersTypeOfCrisis && (
              <TextInput
                label="Tipo de crise"
                value={type}
                onChangeText={setType}
                mode="outlined"
                style={styles.input}
              />
            )}
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
        <Card.Title title="Sintomas Antes da Crise? (Aura)" />
        <Card.Content>
          {getAuraSymptoms().map((symptom) => (
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
          <TextInput
            label="Outros"
            value={othersAuraSymptoms}
            onChangeText={setOthersAuraSymptoms}
            mode="outlined"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Post Crisis State */}
      <Card style={styles.card}>
        <Card.Title title="Estado após a Crise" />
        <Card.Content>
          {getSymptomsAfter().map((symptom) => (
            <Checkbox.Item
              key={symptom}
              label={symptom}
              status={postState.includes(symptom) ? "checked" : "unchecked"}
              onPress={() =>
                setPostState((prev) =>
                  prev.includes(symptom)
                    ? prev.filter((s) => s !== symptom)
                    : [...prev, symptom]
                )
              }
            />
          ))}
          <TextInput
            label="Outras"
            value={othersPostState}
            onChangeText={setOthersPostState}
            mode="outlined"
            style={styles.input}
          />
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
            value={tookMedication?.toString() || "null"}
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
            onValueChange={handleSetWhatWasDoing}
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
            {!doingSomethingDifferent && (
              <RadioButton.Item label="Outro" value="Outro" />
            )}
            {doingSomethingDifferent && (
              <TextInput
                label="Outro"
                value={whatWasDoing}
                onChangeText={setWhatWasDoing}
                mode="outlined"
                style={styles.input}
              />
            )}
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
  buttonContainer: {
    flexDirection: "row", // Arrange children horizontally
    justifyContent: "space-between", // Optional: space between buttons
    padding: 10, // Optional: padding around the container
  },
  button: {
    flex: 1, // Optional: make buttons take equal space
    marginHorizontal: 5, // Space between buttons
  },
});

export default CriseFormScreen;

function getWasDoingTypes() {
  return [
    "Estudando",
    "Assistindo TV ou ao Celular",
    "Atividade Física",
    "Dormindo",
    "Após acordar",
  ];
}

function getCrisisTypes() {
  return ["Desmaio", "Ausência", "Convulsão", "Não sei"];
}

function getAuraSymptoms() {
  return [
    "Nenhum",
    "Sintomas Gástricos",
    "Ansiedade/Palpitações",
    "Palidez e suor frio",
    "Alterações de visão",
    "Dormência no corpo",
    "Zumbidos ou outros ruidos",
    "Tontura",
  ];
}

function getSymptomsAfter() {
  return [
    "Sonolência",
    "Confusão Mental",
    "Cefaleia",
    "Náuseas e vômitos",
    "Tontura",
    "Normal",
  ];
}
