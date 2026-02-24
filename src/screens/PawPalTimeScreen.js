import React, { useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Animated,
  Modal,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import { getBreedById } from '../data/breeds';
import { Video } from 'expo-av';

const STAT_DECAY_RATE = {
  hunger: 5, // decreases every hour
  happiness: 3,
  energy: 4
};

const PET_VARIANT_IMAGES = {
  dog_1: require('../../assets/PawPal_Options/dog_1.png'),
  dog_2: require('../../assets/PawPal_Options/dog_2.png'),
  cat_1: require('../../assets/PawPal_Options/cat_1.jpg'),
  cat_2: require('../../assets/PawPal_Options/cat.png'),
  hamster_1: require('../../assets/PawPal_Options/hamster.png'),
  hamster_2: require('../../assets/PawPal_Options/hamster.png'),
  guinea_pig_1: require('../../assets/PawPal_Options/guinea_pig.png'),
  guinea_pig_2: require('../../assets/PawPal_Options/guinea_pig.png'),
  rabbit_1: require('../../assets/PawPal_Options/rabbit.png'),
  rabbit_2: require('../../assets/PawPal_Options/rabbit.png'),
};

const ACTION_VIDEOS = {
  dog_1: {
    feed: require('../../assets/dog_1/feed.mp4'),
    treat: require('../../assets/dog_1/treat.mp4'),
    bath: require('../../assets/dog_1/bath.mp4'),
    sleep: require('../../assets/dog_1/sleep.mp4'),
    play_dead: require('../../assets/dog_1/play/play_dead.mp4'),
    play_fetch: require('../../assets/dog_1/play/play_fetch.mp4'),
    play_rollover: require('../../assets/dog_1/play/play_rollover.mp4'),
  },
  dog_2: {
    feed: require('../../assets/dog_2/feed.mp4'),
    treat: require('../../assets/dog_2/treat.mp4'),
    bath: require('../../assets/dog_2/bath.mp4'),
    sleep: require('../../assets/dog_2/sleep.mp4'),
    play_dead: require('../../assets/dog_2/play/play_dead.mp4'),
    play_fetch: require('../../assets/dog_2/play/play_fetch.mp4'),
    play_rollover: require('../../assets/dog_2/play/play_rollover.mp4'),
  },
  cat_1: {
    feed: require('../../assets/cat_1/feed.mp4'),
    treat: require('../../assets/cat_1/treat.mp4'),
    bath: require('../../assets/cat_1/bath.mp4'),
    sleep: require('../../assets/cat_1/sleep.mp4'),
    play_dead: require('../../assets/cat_1/play/play_liedown.mp4'),
    play_fetch: require('../../assets/cat_1/play/play_chase.mp4'),
    play_rollover: require('../../assets/cat_1/play/play_pounce.mp4'),
  },
};

export default function PawPalTimeScreen({ navigation, route }) {
  // Feeding schedule state
  const [feedingSchedule, setFeedingSchedule] = useState([]); // array of {hour, minute}
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTime, setNewTime] = useState(new Date());
  const { pet: contextPet } = useContext(AppContext);
  const pet = route?.params?.pet || contextPet;
  const showActionsOnly = route?.params?.showActions;
  const actionsRef = React.useRef(null);
  if (showActionsOnly) {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
          {pet?.imageId && PET_VARIANT_IMAGES[pet.imageId] ? (
            <Image source={PET_VARIANT_IMAGES[pet.imageId]} style={styles.petImage} />
          ) : pet?.id && PET_VARIANT_IMAGES[pet.id] ? (
            <Image source={PET_VARIANT_IMAGES[pet.id]} style={styles.petImage} />
          ) : (
            <View style={styles.petImagePlaceholder}>
              <Text style={styles.petEmoji}>🐾</Text>
            </View>
          )}
          <Text style={styles.petName}>{pet?.name || 'Your PawPal'}</Text>
        </View>
        <View style={styles.actionsGrid} ref={actionsRef}>
          <TouchableOpacity style={[styles.actionButton, styles.feedButton]} onPress={() => {}}>
            <Text style={styles.actionEmoji}>🍖</Text>
            <Text style={styles.actionText}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.playButton]} onPress={() => {}}>
            <Text style={styles.actionEmoji}>🎾</Text>
            <Text style={styles.actionText}>Tricks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.treatButton]} onPress={() => {}}>
            <Text style={styles.actionEmoji}>🛁</Text>
            <Text style={styles.actionText}>Bath</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.moodButton]} onPress={() => {}}>
            <Text style={styles.actionEmoji}>😴</Text>
            <Text style={styles.actionText}>Sleep</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const [stats, setStats] = useState({
    hunger: 30,
    happiness: 100,
    energy: 100,
    lastUpdateTime: Date.now()
  });
  const [achievements, setAchievements] = useState({
    totalFeeds: 0,
    totalPlays: 0,
    totalTreats: 0,
    totalBaths: 0,
    totalSleeps: 0,
    daysActive: 0
  });
  const [bounceAnim] = useState(new Animated.Value(1));
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoFinished, setVideoFinished] = useState(false);
  const videoRef = React.useRef(null);


  useEffect(() => {
    loadPetState();
    loadFeedingSchedule();
  }, [pet]);

  async function loadFeedingSchedule() {
    try {
      if (pet?.id) {
        const key = `@feedingSchedule_${pet.id}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved) setFeedingSchedule(JSON.parse(saved));
      }
    } catch (e) { console.log('Error loading feeding schedule:', e); }
  }

  async function saveFeedingSchedule(schedule) {
    try {
      if (pet?.id) {
        const key = `@feedingSchedule_${pet.id}`;
        await AsyncStorage.setItem(key, JSON.stringify(schedule));
        await scheduleFeedingNotifications(schedule);
      }
    } catch (e) { console.log('Error saving feeding schedule:', e); }
  }

  // Schedule notifications for all feeding times
  async function scheduleFeedingNotifications(schedule) {
    // Cancel previous notifications for this pet
    await Notifications.cancelAllScheduledNotificationsAsync();
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    // Schedule a notification for each feeding time
    for (const t of schedule) {
      const now = new Date();
      let notifTime = new Date();
      notifTime.setHours(t.hour);
      notifTime.setMinutes(t.minute);
      notifTime.setSeconds(0);
      // If the time is in the past for today, schedule for tomorrow
      if (notifTime < now) notifTime.setDate(notifTime.getDate() + 1);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to feed ${pet?.name || 'your pet'}!`,
          body: `Your pet is hungry. Don't forget to feed! 🐾🍖`,
        },
        trigger: {
          hour: t.hour,
          minute: t.minute,
          repeats: true,
        },
      });
    }
  }

  function handleAddFeedingTime() {
    setShowTimePicker(true);
  }

  function onTimePicked(event, selectedDate) {
    setShowTimePicker(false);
    if (selectedDate) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      const newSchedule = [...feedingSchedule, { hour, minute }];
      setFeedingSchedule(newSchedule);
      saveFeedingSchedule(newSchedule);
    }
  }

  function handleRemoveFeedingTime(idx) {
    const newSchedule = feedingSchedule.filter((_, i) => i !== idx);
    setFeedingSchedule(newSchedule);
    saveFeedingSchedule(newSchedule);
  }

  useEffect(() => {
    // Auto-save every 30 seconds
    const saveInterval = setInterval(() => {
      savePetState();
    }, 30000);

    // Check for full energy every 30 minutes, but only notify once per full event
    let playReminderSent = false;
    const playReminderInterval = setInterval(() => {
      if (stats.energy >= 100 && !playReminderSent) {
        sendPlayReminder();
        playReminderSent = true;
      } else if (stats.energy < 100) {
        playReminderSent = false;
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      clearInterval(saveInterval);
      clearInterval(playReminderInterval);
    };
  }, [stats.energy, achievements]);

  async function sendPlayReminder() {
    // Only send if permission granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to play with ${pet?.name || 'your pet'}!`,
        body: `Your pet's energy is full. Let's have some fun! 🎾🐾`,
      },
      trigger: null, // send immediately
    });
  }

  useEffect(() => {
    if (videoFinished && currentVideo) {
      showVideoFeedback();
      setVideoFinished(false);
    }
  }, [videoFinished, currentVideo]);

  async function loadPetState() {
    try {
      if (pet?.id) {
        const key = `@petState_${pet.id}`;
        // Clear old saved state to use fresh initial state
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.log('Error loading pet state:', e);
    }
  }

  async function savePetState() {
    try {
      if (pet?.id) {
        const key = `@petState_${pet.id}`;
        await AsyncStorage.setItem(key, JSON.stringify({
          ...stats,
          achievements,
          lastUpdateTime: Date.now()
        }));
      }
    } catch (e) {
      console.log('Error saving pet state:', e);
    }
  }

  function updateStat(statName, change) {
    setStats(prev => ({
      ...prev,
      [statName]: Math.min(100, Math.max(0, prev[statName] + change)),
      lastUpdateTime: Date.now()
    }));
  }

  function updateAchievement(type) {
    setAchievements(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
    // Check for milestones
    const newTotal = achievements[type] + 1;
    if (newTotal === 10 || newTotal === 50 || newTotal === 100) {
      Alert.alert('🏆 Achievement!', `${newTotal} ${type.replace('total', '')}s! Amazing bond!`);
    }
  }

  function playBounceAnimation() {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  }

  function getBreedInfo() {
    return pet?.breed && getBreedById(pet.breed) ? getBreedById(pet.breed) : null;
  }

  function getMoodEmoji() {
    const avgStat = (stats.hunger + stats.happiness + stats.energy) / 3;
    if (avgStat >= 80) return '😊';
    if (avgStat >= 60) return '🙂';
    if (avgStat >= 40) return '😐';
    if (avgStat >= 20) return '😟';
    return '😢';
  }

  function handleFeed() {
    if (stats.hunger >= 90) {
      Alert.alert('Too Full', `${pet?.name} is not hungry right now!`);
      return;
    }
    
    playBounceAnimation();
    updateStat('hunger', 25);
    updateStat('happiness', 10);
    updateAchievement('totalFeeds');
    
    // Play feed video
    playVideo('feed');
  }

  function playVideo(videoType) {
    setCurrentVideo(videoType);
    setShowVideo(true);
  }

  function getVideoForPet(videoType) {
    const dogType = pet?.imageId || 'dog_1';
    const videoMap = ACTION_VIDEOS[dogType] || ACTION_VIDEOS['dog_1'];
    return videoMap[videoType] || null;
  }

  function closeVideo() {
    setShowVideo(false);
    setCurrentVideo(null);
    setVideoFinished(false);
  }

  function handleVideoPlaybackStatus(status) {
    if (status.didJustFinish) {
      setVideoFinished(true);
    }
  }

  function showVideoFeedback() {
    switch (currentVideo) {
      case 'feed':
        Alert.alert(
          '🍖 Yum Yum!',
          `${pet?.name} devours the food happily! His belly is full and he's so happy! 😋`,
          [{ text: 'Aww, good boy! 🐾', onPress: closeVideo }]
        );
        break;
      case 'treat':
        Alert.alert(
          '🦴 Treat Time!',
          `${pet?.name} munches happily on treats! His tail won't stop wagging! 🐕✨`,
          [{ text: 'Best treats ever! 💕', onPress: closeVideo }]
        );
        break;
      case 'sleep':
        Alert.alert(
          '😴 Sweet Dreams!',
          `${pet?.name} had a wonderful nap! He feels refreshed and energized! ✨🐾`,
          [{ text: 'Rest well! 💤', onPress: closeVideo }]
        );
        break;
      case 'play_dead':
        Alert.alert(
          '🎭 What an Actor!',
          `${pet?.name} plays dead so convincingly! 😂 What a comedian!`,
          [{ text: 'Bravo! 👏', onPress: closeVideo }]
        );
        break;
      case 'play_rollover':
        const isCatPounce = pet?.imageId?.includes('cat');
        Alert.alert(
          isCatPounce ? '🐱 Perfect Pounce!' : '🛼 Perfect Roll!',
          isCatPounce 
            ? `${pet?.name} pounces with amazing agility! So fierce and fun! 😻`
            : `${pet?.name} does an amazing roll over! So graceful and fun! 🤸`,
          [{ text: isCatPounce ? 'So talented! 🏆' : 'So skillful! 🏆', onPress: closeVideo }]
        );
        break;
      case 'play_fetch':
        const isCatChase = pet?.imageId?.includes('cat');
        Alert.alert(
          isCatChase ? '🐱 Epic Chase!' : '🎾 Great Catch!',
          isCatChase 
            ? `${pet?.name} zooms around in an epic chase! So fast and playful! 😹`
            : `${pet?.name} chases and brings back the ball! So obedient and fun! 🐕`,
          [{ text: isCatChase ? 'So speedy! 💨' : 'Best fetch ever! 💪', onPress: closeVideo }]
        );
        break;
      case 'bath':
        const isCatBath = pet?.imageId?.includes('cat');
        Alert.alert(
          '🛁 Bath Time!',
          isCatBath
            ? `${pet?.name} is now squeaky clean! So fresh and fluffy! 🧼✨`
            : `${pet?.name} is now squeaky clean! He smells amazing and his coat is shiny! 🧼✨`,
          [{ text: isCatBath ? 'So clean! 🐱' : 'So fresh! 🐾', onPress: closeVideo }]
        );
        break;
    }
  }

  function handlePlay() {
    if (stats.energy < 20) {
      Alert.alert('Too Tired', `${pet?.name} is too tired to play. Let them rest or take a walk!`);
      return;
    }
    
    playBounceAnimation();
    updateStat('happiness', 25);
    updateStat('energy', -15);
    updateStat('hunger', -10);
    updateAchievement('totalPlays');
    
    // Show play options
    const isCat = pet?.imageId?.includes('cat');
    Alert.alert(
      `🎾 Play with ${pet?.name}`,
      'Choose a game:',
      [
        {
          text: 'Play Dead',
          onPress: () => {
            playVideo('play_dead');
          },
        },
        {
          text: isCat ? 'Pounce' : 'Roll Over',
          onPress: () => {
            playVideo('play_rollover');
          },
        },
        {
          text: isCat ? 'Chase' : 'Fetch',
          onPress: () => {
            playVideo('play_fetch');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  function handleCheckMood() {
    const avgStat = (stats.hunger + stats.happiness + stats.energy) / 3;
    const breedInfo = getBreedInfo();
    let moodText = '';
    let advice = '';
    
    if (avgStat >= 80) {
      moodText = 'feeling amazing';
      advice = 'Keep up the great care! 💕';
    } else if (avgStat >= 60) {
      moodText = 'doing well';
      advice = 'Maybe some playtime would be nice!';
    } else if (avgStat >= 40) {
      moodText = 'okay, but could use some attention';
      advice = 'Some food and play would help!';
    } else if (avgStat >= 20) {
      moodText = 'not doing great';
      advice = 'Please feed and play with them soon!';
    } else {
      moodText = 'really needs your care';
      advice = 'They need immediate attention!';
    }
    
    const breedTraits = breedInfo ? `\n\n💫 Breed Traits: ${breedInfo.traits.join(', ')}\n⚡ Energy Level: ${breedInfo.energyLevel}` : '';
    
    Alert.alert(
      `💭 ${pet?.name}'s Mood`,
      `${pet?.name} is ${moodText}.\n\n${advice}\n\n📊 Stats:\n🍖 Fullness: ${Math.round(stats.hunger)}%\n😊 Happiness: ${Math.round(stats.happiness)}%\n⚡ Energy: ${Math.round(stats.energy)}%${breedTraits}`,
      [{ text: 'Got it! 💕' }]
    );
  }

  function handleGiveTreat() {
    if (stats.hunger >= 95) {
      Alert.alert('Too Full', `${pet?.name} is too full for treats right now!`);
      return;
    }
    
    playBounceAnimation();
    updateStat('happiness', 20);
    updateStat('hunger', 10);
    updateAchievement('totalTreats');
    
    // Play treat video
    playVideo('treat');
  }

  function handleBath() {
    playBounceAnimation();
    updateStat('happiness', 15);
    updateStat('energy', -5);
    updateAchievement('totalBaths');
    
    // Play bath video
    playVideo('bath');
  }

  function handleSleep() {
    playBounceAnimation();
    updateStat('energy', 50);
    updateStat('happiness', 5);
    updateAchievement('totalSleeps');
    
    // Play sleep video
    playVideo('sleep');
  }

  function handleWalk() {
    if (stats.energy < 15) {
      Alert.alert('Too Tired', `${pet?.name} is too tired for a walk. Let them rest first!`);
      return;
    }
    
    playBounceAnimation();
    updateStat('happiness', 20);
    updateStat('energy', -10);
    updateStat('hunger', -15);
    updateAchievement('totalWalks');
    
    const breedInfo = getBreedInfo();
    const walkPref = breedInfo ? breedInfo.walkPreference : 'Exploring';
    
    const responses = [
      `*${walkPref.toLowerCase()}* So many new smells!`,
      'The fresh air feels great!',
      '*prances happily* Best walk ever!',
      'I love exploring with you!'
    ];
    
    Alert.alert(
      '🚶 Walk Time!',
      `${pet?.name}: ${responses[Math.floor(Math.random() * responses.length)]}`,
      [{ text: 'Let\'s go! 🐾' }]
    );
  }

  function getStatColor(value) {
    if (value >= 70) return '#4CAF50';
    if (value >= 40) return '#FF9800';
    return '#F44336';
  }

  function getStatBarWidth(value) {
    return `${Math.max(0, Math.min(100, value))}%`;
  }

  return (
    <View style={styles.container}>
      {/* Feeding Schedule Modal */}
      <Modal visible={showScheduleModal} transparent animationType="slide" onRequestClose={() => setShowScheduleModal(false)}>
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center'}}>
          <View style={{backgroundColor:'#fff', borderRadius:16, padding:24, width:'85%'}}>
            <Text style={{fontSize:20, fontWeight:'bold', marginBottom:12}}>Feeding Schedule</Text>
            {feedingSchedule.length === 0 && <Text style={{marginBottom:12}}>No feeding times set.</Text>}
            {feedingSchedule.map((t, idx) => (
              <View key={idx} style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
                <Text style={{fontSize:16, flex:1}}>{`${t.hour.toString().padStart(2,'0')}:${t.minute.toString().padStart(2,'0')}`}</Text>
                <TouchableOpacity onPress={() => handleRemoveFeedingTime(idx)}>
                  <Text style={{color:'red', fontSize:16}}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={{marginTop:12, backgroundColor:'#FFD4B8', padding:10, borderRadius:8, alignItems:'center'}} onPress={handleAddFeedingTime}>
              <Text style={{fontWeight:'bold'}}>Add Feeding Time</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{marginTop:16, alignItems:'center'}} onPress={() => setShowScheduleModal(false)}>
              <Text style={{color:'#333'}}>Close</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={newTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimePicked}
              />
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PawPal Time</Text>
        <TouchableOpacity onPress={handleCheckMood}>
          <Text style={styles.statsButton}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={{alignSelf:'flex-end', marginBottom:12, backgroundColor:'#FFD4B8', padding:8, borderRadius:8}} onPress={()=>setShowScheduleModal(true)}>
          <Text style={{fontWeight:'bold'}}>Feeding Schedule</Text>
        </TouchableOpacity>
        {/* Pet Display with Mood */}
        <Animated.View style={[styles.petDisplay, { transform: [{ scale: bounceAnim }] }]}>
          {pet?.imageId && PET_VARIANT_IMAGES[pet.imageId] ? (
            <Image source={PET_VARIANT_IMAGES[pet.imageId]} style={styles.petImage} />
          ) : pet?.id && PET_VARIANT_IMAGES[pet.id] ? (
            <Image source={PET_VARIANT_IMAGES[pet.id]} style={styles.petImage} />
          ) : pet?.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.petImage} />
          ) : (
            <View style={styles.petImagePlaceholder}>
              <Text style={styles.petEmoji}>
                {getBreedInfo() ? getBreedInfo().emoji : '🐾'}
              </Text>
            </View>
          )}
          <Text style={styles.petName}>{pet?.name || 'Your PawPal'}</Text>
          {getBreedInfo() && (
            <Text style={styles.breedName}>{getBreedInfo().name}</Text>
          )}
          
          {/* Your Bond */}
          <View style={styles.bondSection}>
            <Text style={styles.bondTitle}>🏆 Your Bond</Text>
            <View style={styles.bondGrid}>
              <View style={styles.bondItem}>
                <Text style={styles.bondIcon}>🍖</Text>
                <Text style={styles.bondCount}>{achievements.totalFeeds}</Text>
              </View>
              <View style={styles.bondItem}>
                <Text style={styles.bondIcon}>🎾</Text>
                <Text style={styles.bondCount}>{achievements.totalPlays}</Text>
              </View>
              <View style={styles.bondItem}>
                <Text style={styles.bondIcon}>🦴</Text>
                <Text style={styles.bondCount}>{achievements.totalTreats}</Text>
              </View>
              <View style={styles.bondItem}>
                <Text style={styles.bondIcon}>🛁</Text>
                <Text style={styles.bondCount}>{achievements.totalBaths}</Text>
              </View>
              <View style={styles.bondItem}>
                <Text style={styles.bondIcon}>😴</Text>
                <Text style={styles.bondCount}>{achievements.totalSleeps}</Text>
              </View>
            </View>
          </View>
          
          {/* Stats Bars */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>🍖</Text>
              <View style={styles.statBarBackground}>
                <View style={[styles.statBarFill, { 
                  width: getStatBarWidth(stats.hunger),
                  backgroundColor: getStatColor(stats.hunger)
                }]} />
              </View>
              <Text style={styles.statValue}>{Math.round(stats.hunger)}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>😊</Text>
              <View style={styles.statBarBackground}>
                <View style={[styles.statBarFill, { 
                  width: getStatBarWidth(stats.happiness),
                  backgroundColor: getStatColor(stats.happiness)
                }]} />
              </View>
              <Text style={styles.statValue}>{Math.round(stats.happiness)}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⚡</Text>
              <View style={styles.statBarBackground}>
                <View style={[styles.statBarFill, { 
                  width: getStatBarWidth(stats.energy),
                  backgroundColor: getStatColor(stats.energy)
                }]} />
              </View>
              <Text style={styles.statValue}>{Math.round(stats.energy)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsGrid} ref={actionsRef}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.feedButton, stats.hunger >= 90 && styles.disabledButton]} 
            onPress={handleFeed}
          >
            <Text style={styles.actionEmoji}>🍖</Text>
            <Text style={styles.actionText}>Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.playButton, stats.energy < 20 && styles.disabledButton]} 
            onPress={handlePlay}
          >
            <Text style={styles.actionEmoji}>🎾</Text>
            <Text style={styles.actionText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.treatButton, stats.hunger >= 95 && styles.disabledButton]} 
            onPress={handleGiveTreat}
          >
            <Text style={styles.actionEmoji}>🦴</Text>
            <Text style={styles.actionText}>Treat</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.treatButton]} 
            onPress={handleBath}
          >
            <Text style={styles.actionEmoji}>🛁</Text>
            <Text style={styles.actionText}>Bath</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.moodButton]} 
            onPress={handleSleep}
          >
            <Text style={styles.actionEmoji}>😴</Text>
            <Text style={styles.actionText}>Sleep</Text>
          </TouchableOpacity>
        </View>

        {/* Video Modal */}
        <Modal
          visible={showVideo}
          transparent
          animationType="fade"
          onRequestClose={closeVideo}
        >
          <View style={styles.videoContainer}>
            {currentVideo && getVideoForPet(currentVideo) && (
              <Video
                source={getVideoForPet(currentVideo)}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                useNativeControls={false}
                shouldPlay={true}
                progressUpdateIntervalMillis={1000}
                style={styles.videoPlayer}
                onPlaybackStatusUpdate={handleVideoPlaybackStatus}
                onError={(error) => console.log('Video error:', error)}
              />
            )}
            </View>
        </Modal>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            {pet?.name}'s needs change over time. Check back regularly to keep them happy!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFE8D6',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD4B8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b2b2b',
  },
  backButton: {
    fontSize: 16,
    color: '#FF9B50',
    fontWeight: '600',
  },
  statsButton: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  petDisplay: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  petImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE8D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  petEmoji: {
    fontSize: 50,
  },
  moodEmoji: {
    fontSize: 32,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b2b2b',
    marginBottom: 4,
  },
  breedName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
  bondSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  bondTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9B50',
    marginBottom: 8,
  },
  bondGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  bondItem: {
    alignItems: 'center',
  },
  bondIcon: {
    fontSize: 20,
  },
  bondCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2b2b2b',
    marginTop: 2,
  },
  statsContainer: {
    width: '100%',
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 20,
    width: 28,
  },
  statBarBackground: {
    flex: 1,
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 32,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    padding: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  feedButton: {
    borderWidth: 3,
    borderColor: '#FFB6C1',
  },
  playButton: {
    borderWidth: 3,
    borderColor: '#87CEEB',
  },
  moodButton: {
    borderWidth: 3,
    borderColor: '#DDA0DD',
  },
  treatButton: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  walkButton: {
    borderWidth: 3,
    borderColor: '#90EE90',
  },
  actionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2b2b',
    textAlign: 'center',
  },
  achievementsBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b2b2b',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9B50',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9B50',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
  },
});
