import React, { useContext } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PetModeSelectionScreen from '../screens/PetModeSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import PetListScreen from '../screens/PetListScreen';
import AddMemoryScreen from '../screens/AddMemoryScreen';
import CustomizationScreen from '../screens/CustomizationScreen';
import MemoryWalksScreen from '../screens/MemoryWalksScreen';
import RainbowBridgeScreen from '../screens/RainbowBridgeScreen';
import DearPetScreen from '../screens/DearPetScreen';
import PawPalTimeScreen from '../screens/PawPalTimeScreen';
import CreateVirtualPawPalScreen from '../screens/CreateVirtualPawPalScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();

function MainTabs(){
  const { pet } = useContext(AppContext);

  return (
    <Tab.Navigator 
      id="mainTabs"
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fffaf6',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f0e6dc',
        },
        headerTintColor: '#FF9B50',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: '#2b2b2b',
        },
        headerShadowVisible: false,
        tabBarStyle: { 
          height: 65, 
          backgroundColor: '#fff',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#FF9B50',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { 
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>🏠</Text>
          ),
          title: 'Home'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          tabBarLabel: 'Heart to Paw',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>💬</Text>
          ),
          title: 'Heart to Paw'
        }} 
      />
      {(!pet?.isPawPal) && (
        <Tab.Screen 
          name="Memories" 
          component={MemoriesScreen} 
          options={{ 
            tabBarLabel: 'Memories',
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>📖</Text>
            ),
            title: 'Memories'
          }} 
        />
      )}
      <Tab.Screen 
        name="MyPets" 
        component={PetListScreen} 
        options={{ 
          tabBarLabel: 'My Pets',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>🐾</Text>
          ),
          title: 'My Pets'
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24, opacity: focused ? 1 : 0.7 }}>⚙️</Text>
          ),
          title: 'Settings'
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator(){
  const { onboardingDone, pet, loading: appLoading } = useContext(AppContext);
  const { user, loading: authLoading } = useAuth();
  
  // Show loading while checking auth state
  if (authLoading || appLoading) {
    return null; // or a loading screen
  }
  
  // Determine initial route based on app state
  const getInitialRoute = () => {
    // Always show onboarding every time app opens
    return 'Onboarding';
  };
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        id="mainStack"
        screenOptions={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fffaf6',
          },
          headerTintColor: '#FF9B50',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
        }} 
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen 
          name="PetModeSelection" 
          component={PetModeSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PetProfile" 
          component={PetProfileScreen}
          options={({ route }) => ({ 
            title: 'Pet Profile',
            headerBackVisible: true,
            headerTitleStyle: {
              fontWeight: '800',
              fontSize: 28,
              color: '#4A90E2',
            },
          })}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddMemory" 
          component={AddMemoryScreen}
          options={{ 
            presentation: 'card', 
            title: 'Add Memory',
            headerBackVisible: true,
          }}
        />
        <Stack.Screen 
          name="DearPet" 
          component={DearPetScreen}
          options={{ 
            presentation: 'card', 
            title: 'Dear Pet',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="PawPalTime" 
          component={PawPalTimeScreen}
          options={{ 
            presentation: 'card', 
            title: 'PawPal Time',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CreateVirtualPawPal" 
          component={CreateVirtualPawPalScreen}
          options={{ 
            presentation: 'card', 
            title: 'Create Virtual PawPal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MemoryWalks" 
          component={MemoryWalksScreen}
          options={{ 
            presentation: 'card', 
            title: 'Memory Walks',
            headerBackVisible: true,
          }}
        />
        <Stack.Screen 
          name="RainbowBridge" 
          component={RainbowBridgeScreen}
          options={{ 
            presentation: 'card', 
            title: 'Rainbow Bridge',
            headerBackVisible: true,
          }}
        />
        <Stack.Screen 
          name="Customization" 
          component={CustomizationScreen}
          options={{ 
            presentation: 'card', 
            title: 'Customize Pet',
            headerBackVisible: true,
          }}
        />
        <Stack.Screen 
          name="PetList" 
          component={PetListScreen}
          options={{ 
            presentation: 'card', 
            title: 'My Pets',
            headerBackVisible: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
