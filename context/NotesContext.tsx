import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Note {
  id: string;
  title: string;
  body: string;
  imageUri?: string;
  category?: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  addNote: (title: string, body: string, imageUri?: string, category?: string) => Promise<void>;
  updateNote: (id: string, title: string, body: string, imageUri?: string, category?: string, isPinned?: boolean) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotes();
    } else {
      setNotes([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const storedNotes = await AsyncStorage.getItem(`notes:${user}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    if (!user) return;
    try {
      await AsyncStorage.setItem(`notes:${user}`, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = async (title: string, body: string, imageUri?: string, category: string = 'Personal') => {
    console.log('Adding note:', title, body, imageUri, category);
    const newNote: Note = {
      id: `${user}-${Date.now()}`,
      title,
      body,
      imageUri,
      category,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newNotes = [newNote, ...notes];
    await saveNotes(newNotes);
  };

  const updateNote = async (id: string, title: string, body: string, imageUri?: string, category?: string, isPinned?: boolean) => {
    const newNotes = notes.map((note) =>
      note.id === id
        ? { 
            ...note, 
            title, 
            body, 
            imageUri, 
            category: category ?? note.category,
            isPinned: isPinned ?? note.isPinned,
            updatedAt: Date.now() 
          }
        : note
    );
    await saveNotes(newNotes);
  };

  const deleteNote = async (id: string) => {
    const newNotes = notes.filter((note) => note.id !== id);
    await saveNotes(newNotes);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        refreshNotes: loadNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
