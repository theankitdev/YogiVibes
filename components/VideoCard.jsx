import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import icons from "../constants/icons";
import { Video, ResizeMode } from "expo-av";
import { useGlobalContext } from "../context/GlobalProvider";
import { createBookmark, deleteBookmark, getBookmarks } from "../lib/appwrite";

const VideoCard = ({
  video: {
    $id,
    title,
    thumbnail,
    video,
    creator = { username: "Unknown", avatar: null }, // Default values for creator
  },
  onBookmarkUpdate, // Callback to refresh bookmarked videos list
}) => {
  const [play, setPlay] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useGlobalContext();

  // Toggle bookmark
  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await deleteBookmark(user.$id, $id);
      } else {
        await createBookmark(user.$id, $id);
      }
      // Immediately update the UI
      setIsBookmarked(!isBookmarked);
      // Refresh the bookmarked videos list
      if (onBookmarkUpdate) onBookmarkUpdate();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Check if the video is already bookmarked
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const bookmarks = await getBookmarks(user.$id);
        setIsBookmarked(bookmarks.some((b) => b.$id === $id));
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };
    checkBookmark();
  }, [user, $id]);

  return (
    <View className="flex-col items-center px-4 mb-14">
      {/* Video Header */}
      <View className="flex-row gap-3 items-start">
        {/* Avatar & User Info */}
        <View className="flex-row flex-1 items-center">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center">
            {creator.avatar && (
              <Image
                source={{ uri: creator.avatar }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            )}
          </View>

          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text className="text-xs text-gray-100 font-pregular">
              {creator.username}
            </Text>
          </View>
        </View>

        {/* Menu Icon and Like Icon */}
        <View className="flex-row items-center gap-3 pt-2">
          {/* Like Icon */}
          <TouchableOpacity onPress={toggleBookmark}>
            <Image
              source={isBookmarked ? icons.heartFilled : icons.heartOutline}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Menu Icon */}
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      {/* Video or Thumbnail */}
      {play ? (
        <Video
          source={{ uri: video }}
          style={{
            width: "100%",
            height: 240,
            borderRadius: 12,
            marginTop: 12,
          }}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;