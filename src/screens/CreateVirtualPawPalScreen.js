import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { AppContext } from '../context/AppContext';

const PET_IMAGES = {
  dog: require("../../assets/PawPal_Options/dog.png"),
  cat: require("../../assets/PawPal_Options/cat.png"),
  hamster: require("../../assets/PawPal_Options/hamster.png"),
  guinea_pig: require("../../assets/PawPal_Options/guinea_pig.png"),
  rabbit: require("../../assets/PawPal_Options/rabbit.png"),
};

const PET_VARIANT_IMAGES = {
  dog_1: require("../../assets/PawPal_Options/dog_1.png"),
  dog_2: require("../../assets/PawPal_Options/dog_2.png"),
  cat_1: require("../../assets/PawPal_Options/cat_1.jpg"),
  cat_2: require("../../assets/PawPal_Options/cat.png"),
  hamster_1: require("../../assets/PawPal_Options/hamster.png"),
  hamster_2: require("../../assets/PawPal_Options/hamster.png"),
  guinea_pig_1: require("../../assets/PawPal_Options/guinea_pig.png"),
  guinea_pig_2: require("../../assets/PawPal_Options/guinea_pig.png"),
  rabbit_1: require("../../assets/PawPal_Options/rabbit.png"),
  rabbit_2: require("../../assets/PawPal_Options/rabbit.png"),
};

const PET_TYPES = {
  dog: {
    name: "Dog",
    emoji: "🐕",
    options: [
      { id: "dog_1", defaultName: "Buddy", video: require("../../assets/dog_intro/intro_dog_1.mp4") },
      { id: "dog_2", defaultName: "Charlie", video: require("../../assets/dog_intro/intro_dog_2.mp4") },
    ],
  },
  cat: {
    name: "Cat",
    emoji: "🐱",
    options: [
      { id: "cat_1", defaultName: "Kulet", video: require("../../assets/cat_intro/cat_1.mp4") },
      { id: "cat_2", defaultName: "Bait", video: null },
    ],
  },
  hamster: {
    name: "Hamster",
    emoji: "🐹",
    comingSoon: true,
    options: [
      { id: "hamster_1", defaultName: "Nibbles", video: null },
      { id: "hamster_2", defaultName: "Pickles", video: null },
    ],
  },
  guinea_pig: {
    name: "Guinea Pig",
    emoji: "🐹",
    comingSoon: true,
    options: [
      { id: "guinea_pig_1", defaultName: "Pepper", video: null },
      { id: "guinea_pig_2", defaultName: "Coco", video: null },
    ],
  },
  rabbit: {
    name: "Rabbit",
    emoji: "🐰",
    comingSoon: true,
    options: [
      { id: "rabbit_1", defaultName: "Hoppy", video: null },
      { id: "rabbit_2", defaultName: "Floppy", video: null },
    ],
  },
};

export default function CreateVirtualPawPalScreen({ navigation }) {
  const { savePet } = useContext(AppContext);
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petName, setPetName] = useState("");
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [videoRef, setVideoRef] = useState(null);
  const pawPrintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pawPrintAnim, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pawPrintAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (showNamingModal && videoRef && selectedPet?.video) {
      // Try to play at multiple intervals to ensure it starts
      setTimeout(() => {
        videoRef.playAsync().catch(e => console.log('Play attempt 1:', e));
      }, 300);
      setTimeout(() => {
        videoRef.playAsync().catch(e => console.log('Play attempt 2:', e));
      }, 700);
      setTimeout(() => {
        videoRef.playAsync().catch(e => console.log('Play attempt 3:', e));
      }, 1000);
    }
  }, [showNamingModal, videoRef, selectedPet]);

  const handlePetTypeClick = (petType) => {
    const petTypeData = PET_TYPES[petType];
    if (petTypeData?.comingSoon) {
      Alert.alert(
        '🐾 Coming Soon!',
        `${petTypeData.name} companions are coming to comPAWnion soon! Stay tuned! 💫`,
        [{ text: 'Got it!', style: 'default' }]
      );
    } else {
      setSelectedPetType(petType);
    }
  };

  const handleSpecificPetClick = (pet) => {
    setSelectedPet(pet);
    setPetName(pet.defaultName);
    setShowNamingModal(true);
  };

  const handleSavePet = () => {
    if (!petName.trim()) {
      Alert.alert("Please enter a name for your pet");
      return;
    }

    // Create pet object
    const newPet = {
      id: selectedPet.id,
      name: petName,
      type: selectedPetType,
      createdAt: new Date().toISOString(),
      isPawPal: true,
      imageId: selectedPet.id, // Store the image ID for Virtual PawPal
    };

    console.log(`Created pet: ${petName} (${selectedPet.id})`);
    
    // Save pet to AppContext so it displays on Home screen
    savePet(newPet);
    
    // Navigate to Home section like Forever Best Friend
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleBack = () => {
    if (showNamingModal) {
      setShowNamingModal(false);
      setSelectedPet(null);
    } else if (selectedPetType) {
      setSelectedPetType(null);
    } else {
      navigation.replace('PetModeSelection');
    }
  };

  // Screen 1: Choose Pet Type
  if (!selectedPetType) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Choose Your Virtual PawPal</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 10 }}>
          <Text style={[styles.subtitle, { color: '#4A90E2' }]}>Choose Your Com</Text>
          <Text style={[styles.subtitle, { color: '#FF7A00' }]}>PAW</Text>
          <Text style={[styles.subtitle, { color: '#4A90E2' }]}>nion</Text>
        </View>

        <ScrollView contentContainerStyle={styles.gridContent}>
          {Object.entries(PET_TYPES).map(([key, petType]) => (
            <TouchableOpacity
              key={key}
              style={[styles.card, petType.comingSoon && styles.cardDisabled]}
              onPress={() => handlePetTypeClick(key)}
              disabled={petType.comingSoon}
            >
              <Image
                source={PET_IMAGES[key]}
                style={[styles.image, petType.comingSoon && styles.imageDisabled]}
              />
              <Text style={styles.label}>
                {petType.emoji} {petType.name}
              </Text>
              {petType.comingSoon && (
                <Text style={styles.comingSoonLabel}>Coming Soon</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={handleBack}>
          <View style={styles.backButtonContainer}>
            <Text style={styles.backButton}>← Back</Text>
            <Animated.Text
              style={[
                styles.pawPrint,
                {
                  transform: [{ translateY: pawPrintAnim }],
                },
              ]}
            >
              🐾
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Screen 2: Choose Specific Pet Option
  const petType = PET_TYPES[selectedPetType];
  if (!selectedPet) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../../assets/comPAWnion Logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          Choose Your {petType.name}
        </Text>

        <ScrollView contentContainerStyle={styles.gridContent}>
          {petType.options.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.card}
              onPress={() => handleSpecificPetClick(pet)}
            >
              <Image
                source={PET_VARIANT_IMAGES[pet.id]}
                style={styles.image}
              />
              <Text style={styles.label}>{pet.defaultName}</Text>
              {pet.video && <Text style={styles.hint}>Tap to see intro</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={handleBack}>
          <View style={styles.backButtonContainer}>
            <Text style={styles.backButton}>← Back</Text>
            <Animated.Text
              style={[
                styles.pawPrint,
                {
                  transform: [{ translateY: pawPrintAnim }],
                },
              ]}
            >
              🐾
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Screen 3: Video Intro & Naming
  return (
    <View style={styles.container}>
      <Modal visible={showNamingModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentScroll}
            showsVerticalScrollIndicator={true}
          >
            {selectedPet.video && (
              <Video
                ref={setVideoRef}
                source={selectedPet.video}
                style={styles.video}
                useNativeControls={false}
                resizeMode={ResizeMode.CONTAIN}
                isLooping={true}
                shouldPlay={true}
                isMuted={true}
                onLoad={() => {
                  if (videoRef) {
                    videoRef.playAsync();
                  }
                }}
                onReadyForDisplay={() => {
                  if (videoRef) {
                    videoRef.playAsync();
                  }
                }}
              />
            )}

            <Text style={styles.petIntroTitle}>Meet Your New Friend!</Text>

            <Text style={styles.label}>Give your pet a name:</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter pet name"
              value={petName}
              onChangeText={setPetName}
              maxLength={20}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePet}
            >
              <Text style={styles.saveButtonText}>Create {petName}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBack} style={styles.modalBackButton}>
              <View style={styles.backButtonContainer}>
                <Text style={styles.backButton}>← Back</Text>
                <Animated.Text
                  style={[
                    styles.pawPrint,
                    {
                      transform: [{ translateY: pawPrintAnim }],
                    },
                  ]}
                >
                  🐾
                </Animated.Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
  },
  backButton: {
    fontSize: 16,
    color: "#FF7A00",
    fontWeight: "600",
    marginBottom: 20,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pawPrint: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 20,
  },
  logoImage: {
    width: 400,
    height: 400,
    marginTop: -30,
    marginBottom: 15,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF7A00",
    textAlign: "center",
    marginTop: -50,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF7A00",
    textAlign: "center",
    marginBottom: 30,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: "#FF7A00",
    marginTop: 8,
    fontStyle: "italic",
  },
  cardDisabled: {
    opacity: 0.5,
  },
  imageDisabled: {
    opacity: 0.6,
  },
  comingSoonLabel: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "bold",
    marginTop: 8,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    width: "100%",
    maxHeight: "88%",
  },
  modalContentScroll: {
    justifyContent: "space-between",
    flexGrow: 1,
  },
  modalBackButton: {
    marginTop: 20,
    marginBottom: 15,
  },
  video: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: "#000",
  },
  petIntroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF7A00",
    marginBottom: 20,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 2,
    borderColor: "#FF7A00",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#FF7A00",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});