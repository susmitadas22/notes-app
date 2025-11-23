import { CATEGORY_COLORS, CATEGORY_TEXT_COLORS } from '@/components/CategoryBadge';
import { useNotes } from '@/context/NotesContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  
  const isNew = id === 'new';
  const existingNote = notes.find(n => n.id === id);

  const [title, setTitle] = useState(existingNote?.title || '');
  const [body, setBody] = useState(existingNote?.body || '');
  const [imageUri, setImageUri] = useState(existingNote?.imageUri);
  const [category, setCategory] = useState(existingNote?.category || 'Personal');
  const [isPinned, setIsPinned] = useState(existingNote?.isPinned || false);

  useEffect(() => {
    if (!isNew && !existingNote) {
      Alert.alert('Error', 'Note not found');
      router.back();
    }
  }, [id, existingNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    try {
      if (isNew) {
        await addNote(title, body, imageUri, category);
      } else {
        await updateNote(id!, title, body, imageUri, category, isPinned);
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(id!);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsPinned(!isPinned)} style={styles.pinButton}>
            <Ionicons 
              name={isPinned ? "pin" : "pin-outline"} 
              size={24} 
              color={isPinned ? "#FBC02D" : "#333"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                  { backgroundColor: category === cat ? CATEGORY_COLORS[cat] : '#f0f0f0' }
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: category === cat ? CATEGORY_TEXT_COLORS[cat] : '#666' }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Ionicons name="image-outline" size={24} color="#F57C00" />
          <Text style={styles.imageButtonText}>
            {imageUri ? 'Change Image' : 'Add Image'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImage} 
              onPress={() => setImageUri(undefined)}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.bodyInput}
          placeholder="Start typing..."
          placeholderTextColor="#999"
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />

        {!isNew && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteText}>Delete Note</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Neutral white background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  pinButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  saveButton: {
    fontSize: 17,
    color: '#007AFF', // Blue accent
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  titleInput: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Poppins_800ExtraBold',
    marginBottom: 16,
    color: '#333',
    marginTop: 8,
  },
  categoriesContainer: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  bodyInput: {
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    color: '#444',
    minHeight: 200,
    lineHeight: 28,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  imageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 8,
  },
  imageContainer: {
    marginBottom: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#f0f0f0',
  },
  removeImage: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 100,
    padding: 16,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 8,
  },
});
