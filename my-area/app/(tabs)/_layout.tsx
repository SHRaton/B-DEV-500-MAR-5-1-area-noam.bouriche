import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Pour masquer l'en-tête si nécessaire
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      {/* Ajoute d'autres écrans ici si nécessaire */}
    </Stack>
  );
}
