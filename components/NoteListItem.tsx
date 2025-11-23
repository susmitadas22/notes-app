import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Note } from '../context/NotesContext';
import CategoryBadge from './CategoryBadge';

interface NoteListItemProps {
  note: Note;
  layout?: 'list' | 'grid';
}

export default function NoteListItem({ note, layout = 'list' }: NoteListItemProps) {
  const isGrid = layout === 'grid';

  return (
    <Link href={`/note/${note.id}`} asChild style={styles.container}>
      <TouchableOpacity style={[styles.container, isGrid && styles.gridContainer]}>
        {note.imageUri && (
          <Image 
            source={{ uri: note.imageUri }} 
            style={[styles.thumbnail, isGrid && styles.gridThumbnail]} 
          />
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            {note.category && <CategoryBadge category={note.category} />}
            {note.isPinned && (
              <Ionicons name="pin" size={16} color="#FBC02D" style={styles.pinIcon} />
            )}
          </View>
          <Text style={styles.title} numberOfLines={isGrid ? 2 : 1}>
            {note.title}
          </Text>
          <Text style={styles.body} numberOfLines={isGrid ? 3 : 2}>
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
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0', // Visible thin border
  },
  gridContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: '100%',
    marginBottom: 0,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  gridThumbnail: {
    width: '100%',
    height: 120,
    marginRight: 0,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pinIcon: {
    marginLeft: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
    color: '#333',
  },
  body: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#999',
  },
});
