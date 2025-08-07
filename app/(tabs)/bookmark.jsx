import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getBookmarks } from "../../lib/appwrite";
import VideoCard from "../../components/VideoCard";
import SearchInput from "../../components/SearchInput";
import EmptyState from "../../components/EmptyState";

const Bookmarks = () => {
  const { user } = useGlobalContext();
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch bookmarked videos
  const fetchBookmarks = async () => {
    try {
      const bookmarks = await getBookmarks(user.$id);
      setBookmarkedVideos(bookmarks);
      setFilteredVideos(bookmarks);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Refresh bookmarked videos list
  const refreshBookmarks = () => {
    fetchBookmarks();
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = bookmarkedVideos.filter((video) =>
        video.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(bookmarkedVideos);
    }
  };

  // Fetch bookmarks on component mount
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  return (
    <View className="bg-primary flex-1 p-4">
      <Text className="text-white text-2xl font-bold mb-4">Bookmarks</Text>

      {/* Search Bar */}
      <View className="mb-4">
        
      <SearchInput
        placeholder="Search bookmarks..."
        initalQuery={searchQuery}
        onSearch={handleSearch}
      />
      </View>

      {/* Display Bookmarked Videos or Empty State */}
      {filteredVideos.length > 0 ? (
        <FlatList
        contentContainerStyle={{ paddingBottom: 100 }}
          data={filteredVideos}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <VideoCard video={item} onBookmarkUpdate={refreshBookmarks} />
          )}
          ListEmptyComponent={
            <Text className="text-white text-center mt-4">
              No bookmarks found for "{searchQuery}"
            </Text>
          }
        />
      ) : (
        <EmptyState
          title="No Bookmarks Yet"
          subtitle="Save your favorite videos to access them later."
        />
      )}
    </View>
  );
};

export default Bookmarks;