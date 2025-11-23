import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Note } from '../context/NotesContext';

interface NoteListItemProps {
  note: Note;
}

export default function NoteListItem({ note }: NoteListItemProps) {
  return (
    <Link href={`/note/${note.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        {note.imageUri && (
          <Image source={{ uri: note.imageUri }} style={styles.thumbnail} />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {note.body}
          </Text>
          <Text style={styles.date}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
