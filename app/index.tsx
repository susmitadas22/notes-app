import NoteListItem from '@/components/NoteListItem';
import { useAuth } from '@/context/AuthContext';
import { useNotes } from '@/context/NotesContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { LayoutAnimation, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HomeScreen() {
  const { notes, isLoading } = useNotes();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOption, setSortOption] = React.useState<'updated_newest' | 'updated_oldest' | 'title_az' | 'title_za'>('updated_newest');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [isGridLayout, setIsGridLayout] = React.useState(false);

  const toggleLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsGridLayout(!isGridLayout);
  };

  const filteredAndSortedNotes = React.useMemo(() => {
    let result = [...notes];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.body.toLowerCase().includes(query) ||
          (note.category && note.category.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      // Pinned notes always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortOption) {
        case 'updated_newest':
          return b.updatedAt - a.updatedAt;
        case 'updated_oldest':
          return a.updatedAt - b.updatedAt;
        case 'title_az':
          return a.title.localeCompare(b.title);
        case 'title_za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [notes, searchQuery, sortOption]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading notes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleLayout} style={styles.iconButton}>
            <Ionicons name={isGridLayout ? "list" : "grid"} size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {filteredAndSortedNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No notes found matching your search.' : 'No notes yet. Create one!'}
          </Text>
        </View>
      ) : (
        <Animated.FlatList
          key={isGridLayout ? 'grid' : 'list'}
          data={filteredAndSortedNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={isGridLayout ? styles.gridItem : styles.listItem}>
              <NoteListItem note={item} layout={isGridLayout ? 'grid' : 'list'} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={isGridLayout ? 2 : 1}
          columnWrapperStyle={isGridLayout ? styles.columnWrapper : undefined}
          itemLayoutAnimation={Layout.springify()}
        />
      )}

      <Link href="/note/new" asChild>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Link>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'updated_newest' && styles.sortOptionSelected]}
              onPress={() => { setSortOption('updated_newest'); setModalVisible(false); }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'updated_newest' && styles.sortOptionTextSelected]}>Last Updated (Newest first)</Text>
              {sortOption === 'updated_newest' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'updated_oldest' && styles.sortOptionSelected]}
              onPress={() => { setSortOption('updated_oldest'); setModalVisible(false); }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'updated_oldest' && styles.sortOptionTextSelected]}>Last Updated (Oldest first)</Text>
              {sortOption === 'updated_oldest' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'title_az' && styles.sortOptionSelected]}
              onPress={() => { setSortOption('title_az'); setModalVisible(false); }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'title_az' && styles.sortOptionTextSelected]}>Title (A-Z)</Text>
              {sortOption === 'title_az' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.sortOption, sortOption === 'title_za' && styles.sortOptionSelected]}
              onPress={() => { setSortOption('title_za'); setModalVisible(false); }}
            >
              <Text style={[styles.sortOptionText, sortOption === 'title_za' && styles.sortOptionTextSelected]}>Title (Z-A)</Text>
              {sortOption === 'title_za' && <Ionicons name="checkmark" size={20} color="#007AFF" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Neutral white background
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Poppins_800ExtraBold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  signOutButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    height: '100%',
  },
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listItem: {
    marginBottom: 0,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF', // Blue accent
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    color: '#333',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionSelected: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  sortOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  sortOptionTextSelected: {
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    color: '#007AFF',
  },
});
