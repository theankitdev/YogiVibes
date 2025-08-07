import { Account,Avatars,Client,Databases,ID, Query, Storage } from 'react-native-appwrite'

export const Config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.yogivibes',
    projectId: '67cc3daa002500fbb06d',
    databaseId: '67cc461000347e295e54',
    userCollectionId: '67cc466200384690cfbc',
    videoColllectionId: '67cc46cd00136e0371f5',
    storageId: '67cc6d8400189b14aae6',
    bookmarkCollectionId: '67d98dc1002eb11dd7e9'
}


const client = new Client();
client
    .setEndpoint(Config.endpoint)
    .setProject(Config.projectId)
    .setPlatform(Config.platform)
;

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async(email,password,username) => {
   try{
    const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        username
    )
    if(!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(username)
    await signIn(email,password);

    const newUser = await databases.createDocument(
        Config.databaseId,
        Config.userCollectionId,
        ID.unique(),
        {
            accountId: newAccount.$id,
            email,
            username,
            avatar: avatarUrl,
        }
    )

    return newUser;
   } catch (error) {
    console.log(error);
    throw new Error(error);
   }
}

export const signIn = async(email,password) => {
    try{
        const session = await account.createEmailPasswordSession(email,password);
        if(!session) throw Error;
        return session;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try{
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            Config.databaseId,
            Config.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.log(error);
    }
}

export const getAllPosts = async () => {
    try{
        const posts = await databases.listDocuments(
            Config.databaseId,
            Config.videoColllectionId,
            [Query.orderDesc('$createdAt')]
        )
        
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getLatestPosts = async () => {
    try{
        const posts = await databases.listDocuments(
            Config.databaseId,
            Config.videoColllectionId,
            [Query.orderDesc('$createdAt',Query.limit(7))]
        )
        
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const searchPosts = async (query) => {
    try{
        const posts = await databases.listDocuments(
            Config.databaseId,
            Config.videoColllectionId,
            [Query.search('title',query)]
        )
        
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getUserPosts = async (userId) => {
    try{
        const posts = await databases.listDocuments(
            Config.databaseId,
            Config.videoColllectionId,
            [Query.equal('creator', userId)],
            [Query.orderDesc('$createdAt')]
        )
        
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const signOut = async () => {
    try{
        const session = await account.deleteSession('current');
        
        return session;
    } catch (error) {
        throw new Error(error);
    }
}

export const getFilePreview = async (fileId, type) => {
    try{
        if(type=== 'video') {
            fileUrl = storage.getFileView(Config.storageId, fileId)
        } else if(type === 'image') {
            fileUrl = storage.getFileView(Config.storageId, fileId);
        } else {
            throw new Error('Invalid file type')
        }

        if(!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const uploadFile = async (file, type) => {
    if(!file) return;

    const asset = { 
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    };

    try {
        const uploadedFile = await storage.createFile(
            Config.storageId,
            ID.unique(),
            asset
        )
        
        const fileUrl = await getFilePreview(uploadedFile.$id, type)
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const createVideoPost = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail,'image'),
            uploadFile(form.video, 'video')
        ])

        const newPost = await databases.createDocument(
            Config.databaseId,
            Config.videoColllectionId,
            ID.unique(), {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId,
            }  
        )
        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}

// lib/appwrite.js
// lib/appwrite.js
export const createBookmark = async (userId, videoId) => {
    try {
      const bookmark = await databases.createDocument(
        Config.databaseId,
        Config.bookmarkCollectionId, // Ensure this is defined in your Config
        ID.unique(),
        {
          userId,
          videoId,
        }
      );
      return bookmark;
    } catch (error) {
      console.error("Error creating bookmark:", error);
      throw new Error(error);
    }
  };
  
  export const deleteBookmark = async (userId, videoId) => {
    try {
      // Find the bookmark to delete
      const bookmarks = await databases.listDocuments(
        Config.databaseId,
        Config.bookmarkCollectionId,
        [Query.equal("userId", userId), Query.equal("videoId", videoId)]
      );
  
      // Delete the bookmark if it exists
      if (bookmarks.documents.length > 0) {
        await databases.deleteDocument(
          Config.databaseId,
          Config.bookmarkCollectionId,
          bookmarks.documents[0].$id
        );
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      throw new Error(error);
    }
  };
  
  export const getBookmarks = async (userId) => {
    try {
      // Fetch all bookmarks for the user
      const bookmarks = await databases.listDocuments(
        Config.databaseId,
        Config.bookmarkCollectionId,
        [Query.equal("userId", userId)]
      );
  
      // Fetch video details for each bookmark
      const videos = await Promise.all(
        bookmarks.documents.map(async (bookmark) => {
          const video = await databases.getDocument(
            Config.databaseId,
            Config.videoColllectionId, // Ensure this is defined in your Config
            bookmark.videoId
          );
          return video;
        })
      );
  
      return videos;
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw new Error(error);
    }
  };