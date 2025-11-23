import { useNotes } from '@/context/NotesContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  
  const isNew = id === 'new';
  const existingNote = notes.find(n => n.id === id);

  const [title, setTitle] = useState(existingNote?.title || '');
  const [body, setBody] = useState(existingNote?.body || '');
  const [imageUri, setImageUri] = useState(existingNote?.imageUri);

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
        await addNote(title, body, imageUri);
      } else {
        await updateNote(id!, title, body, imageUri);
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
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isNew ? 'New Note' : 'Edit Note',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  saveButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  bodyInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    lineHeight: 24,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  imageContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 32,
    padding: 12,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
