import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../constants";
import { usePathname, router } from "expo-router";


const SearchInput = ({initalQuery, placeholder}) => {
  
  const [isFocused, setIsFocused] = useState(false);
  const pathname = usePathname();
  const [query, setQuery] = useState(initalQuery ||'');

  return (

      <View className={`w-full h-16 px-4 bg-black-100 rounded-2xl border-2 
                  ${isFocused ? "border-secondary" : "border-black-200"} 
                  flex-row items-center space-x-4`}>
        <TextInput
          className="text-base mt-0.5 text-white flex-1 font-pregular"
          value={query}
          placeholder= {placeholder}
          placeholderTextColor="#CDCDE0"
          onChangeText={(e) => setQuery(e)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <TouchableOpacity
        onPress={() => {
          if(!query) {
            return Alert.alert('Missing query',"Please input something to search results across database")
          }

          if(pathname.startsWith('/search')) router.setParams({ query })
            else router.push(`/search/${query}`)
        }}
        >
            <Image
            source={icons.search}
            className="w-5 h-5"
            resizeMode="contain"
            />
        </TouchableOpacity>
      </View>
  );
};

export default SearchInput;