/**
 * Facebook Service - Integração completa com Facebook API
 * App ID: 719329824130109
 */

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  friends?: {
    summary: {
      total_count: number;
    };
  };
}

interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  type: string;
  attachments?: {
    data: Array<{
      type: string;
      media?: {
        image: {
          src: string;
        };
      };
    }>;
  };
}

interface FacebookPhoto {
  id: string;
  source: string;
  created_time: string;
  name?: string;
  tags?: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
}

interface FacebookConnection {
  isConnected: boolean;
  user: FacebookUser | null;
  posts: FacebookPost[];
  photos: FacebookPhoto[];
  friends: any[];
  pages: any[];
  accessToken: string | null;
  connectedAt: Date | null;
  lastSync: Date | null;
  stats: {
    totalPosts: number;
    totalPhotos: number;
    totalFriends: number;
    totalPages: number;
  };
}

class FacebookService {
  private static instance: FacebookService;
  private appId = '719329824130109'; // Seu App ID
  private isInitialized = false;
  private connection: FacebookConnection = {
    isConnected: false,
    user: null,
    posts: [],
    photos: [],
    friends: [],
    pages: [],
    accessToken: null,
    connectedAt: null,
    lastSync: null,
    stats: {
      totalPosts: 0,
      totalPhotos: 0,
      totalFriends: 0,
      totalPages: 0
    }
  };

  public static getInstance(): FacebookService {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }

  constructor() {
    this.loadConnectionData(); // Load saved data first
    this.initializeFacebookSDK();
  }

  private async initializeFacebookSDK(): Promise<void> {
    return new Promise((resolve) => {
      // Check if SDK is already loaded
      if ((window as any).FB) {
        this.isInitialized = true;
        console.log('Facebook SDK already loaded');
        resolve();
        return;
      }

      // Load Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        (window as any).FB.init({
          appId: this.appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        
        this.isInitialized = true;
        console.log('Facebook SDK initialized with App ID:', this.appId);
        
        // Check login status on initialization
        this.checkLoginStatus();
        
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load Facebook SDK');
        resolve();
      };
      
      document.head.appendChild(script);
    });
  }

  private checkLoginStatus(): void {
    if (!this.isInitialized) return;

    (window as any).FB.getLoginStatus((response: any) => {
      console.log('Facebook login status:', response);
      
      if (response.status === 'connected') {
        this.connection.accessToken = response.authResponse.accessToken;
        this.connection.isConnected = true;
        this.connection.connectedAt = new Date();
        
        // Load user data if connected
        this.loadUserData().catch(console.error);
      }
    });
  }

  async connectToFacebook(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initializeFacebookSDK();
    }

    return new Promise((resolve) => {
      (window as any).FB.login((response: any) => {
        console.log('Facebook login response:', response);
        
        if (response.authResponse) {
          console.log('Facebook login successful');
          this.connection.accessToken = response.authResponse.accessToken;
          this.connection.isConnected = true;
          this.connection.connectedAt = new Date();
          
          // Load user data after successful login
          this.loadUserData().then(() => {
            resolve({ success: true });
          }).catch((error) => {
            console.error('Error loading user data:', error);
            resolve({ success: false, error: 'Erro ao carregar dados do usuário' });
          });
        } else {
          console.log('Facebook login failed or cancelled');
          resolve({ 
            success: false, 
            error: 'Login cancelado ou erro de autenticação' 
          });
        }
      }, {
        scope: 'public_profile,email,user_posts,user_photos,user_friends,pages_read_engagement'
      });
    });
  }

  async loadUserData(): Promise<void> {
    if (!this.isInitialized || !this.connection.accessToken) {
      throw new Error('Facebook não está conectado');
    }

    try {
      console.log('Loading Facebook user data...');
      
      // Load user profile
      await this.loadUserProfile();
      
      // Load user posts
      await this.loadUserPosts();
      
      // Load user photos
      await this.loadUserPhotos();
      
      // Load friends count
      await this.loadFriendsCount();
      
      // Load pages
      await this.loadUserPages();
      
      this.connection.lastSync = new Date();
      
      // Save to localStorage for persistence
      this.saveConnectionData();
      
      console.log('Facebook data loaded successfully:', this.connection.stats);
      
    } catch (error) {
      console.error('Error loading Facebook data:', error);
      throw error;
    }
  }

  private loadUserProfile(): Promise<void> {
    return new Promise((resolve, reject) => {
      (window as any).FB.api('/me', {
        fields: 'id,name,email,picture.width(200).height(200)'
      }, (response: any) => {
        console.log('User profile response:', response);
        
        if (response && !response.error) {
          this.connection.user = response;
          resolve();
        } else {
          console.error('Error loading user profile:', response.error);
          reject(response.error);
        }
      });
    });
  }

  private loadUserPosts(): Promise<void> {
    return new Promise((resolve) => {
      (window as any).FB.api('/me/posts', {
        fields: 'id,message,story,created_time,type,attachments{type,media}',
        limit: 25
      }, (response: any) => {
        console.log('User posts response:', response);
        
        if (response && !response.error && response.data) {
          this.connection.posts = response.data;
          this.connection.stats.totalPosts = this.connection.posts.length;
        } else {
          console.warn('Could not load posts:', response?.error || 'No data');
          this.connection.posts = [];
          this.connection.stats.totalPosts = 0;
        }
        resolve();
      });
    });
  }

  private loadUserPhotos(): Promise<void> {
    return new Promise((resolve) => {
      (window as any).FB.api('/me/photos/uploaded', {
        fields: 'id,source,created_time,name,tags',
        limit: 25
      }, (response: any) => {
        console.log('User photos response:', response);
        
        if (response && !response.error && response.data) {
          this.connection.photos = response.data;
          this.connection.stats.totalPhotos = this.connection.photos.length;
        } else {
          console.warn('Could not load photos:', response?.error || 'No data');
          this.connection.photos = [];
          this.connection.stats.totalPhotos = 0;
        }
        resolve();
      });
    });
  }

  private loadFriendsCount(): Promise<void> {
    return new Promise((resolve) => {
      (window as any).FB.api('/me/friends', {
        summary: true
      }, (response: any) => {
        console.log('Friends count response:', response);
        
        if (response && !response.error) {
          this.connection.stats.totalFriends = response.summary?.total_count || 0;
        } else {
          console.warn('Could not load friends count:', response?.error || 'No data');
          this.connection.stats.totalFriends = 0;
        }
        resolve();
      });
    });
  }

  private loadUserPages(): Promise<void> {
    return new Promise((resolve) => {
      (window as any).FB.api('/me/accounts', {
        fields: 'id,name,category,picture'
      }, (response: any) => {
        console.log('User pages response:', response);
        
        if (response && !response.error && response.data) {
          this.connection.pages = response.data;
          this.connection.stats.totalPages = this.connection.pages.length;
        } else {
          console.warn('Could not load pages:', response?.error || 'No data');
          this.connection.pages = [];
          this.connection.stats.totalPages = 0;
        }
        resolve();
      });
    });
  }

  async disconnectFromFacebook(): Promise<void> {
    if (this.isInitialized && this.connection.isConnected) {
      return new Promise((resolve) => {
        (window as any).FB.logout(() => {
          console.log('Facebook logout successful');
          this.resetConnection();
          resolve();
        });
      });
    } else {
      this.resetConnection();
    }
  }

  private resetConnection(): void {
    this.connection = {
      isConnected: false,
      user: null,
      posts: [],
      photos: [],
      friends: [],
      pages: [],
      accessToken: null,
      connectedAt: null,
      lastSync: null,
      stats: {
        totalPosts: 0,
        totalPhotos: 0,
        totalFriends: 0,
        totalPages: 0
      }
    };
    
    // Clear localStorage
    localStorage.removeItem('facebook_connection');
  }

  private saveConnectionData(): void {
    const dataToSave = {
      ...this.connection,
      // Don't save sensitive access token
      accessToken: null
    };
    localStorage.setItem('facebook_connection', JSON.stringify(dataToSave));
  }

  private loadConnectionData(): void {
    const saved = localStorage.getItem('facebook_connection');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.connection = { ...this.connection, ...data };
        console.log('Loaded saved Facebook connection data');
      } catch (error) {
        console.error('Error loading saved Facebook data:', error);
      }
    }
  }

  // Public methods
  getConnectionStatus(): FacebookConnection {
    return { ...this.connection };
  }

  isConnected(): boolean {
    return this.connection.isConnected;
  }

  getUser(): FacebookUser | null {
    return this.connection.user;
  }

  getPosts(): FacebookPost[] {
    return this.connection.posts;
  }

  getPhotos(): FacebookPhoto[] {
    return this.connection.photos;
  }

  getStats() {
    return this.connection.stats;
  }

  async refreshData(): Promise<void> {
    if (this.connection.isConnected) {
      await this.loadUserData();
    }
  }

  // Analysis methods for cleanup
  analyzePostsForEx(exName: string): FacebookPost[] {
    return this.connection.posts.filter(post => {
      const content = (post.message || post.story || '').toLowerCase();
      return content.includes(exName.toLowerCase());
    });
  }

  analyzePhotosForEx(exName: string): FacebookPhoto[] {
    return this.connection.photos.filter(photo => {
      // Check photo name/description
      if (photo.name && photo.name.toLowerCase().includes(exName.toLowerCase())) {
        return true;
      }
      
      // Check tags
      if (photo.tags && photo.tags.data) {
        return photo.tags.data.some(tag => 
          tag.name.toLowerCase().includes(exName.toLowerCase())
        );
      }
      
      return false;
    });
  }

  // Cleanup simulation methods
  async simulateCleanup(exName: string): Promise<{
    postsToDelete: number;
    photosToDelete: number;
    tagsToRemove: number;
  }> {
    const postsWithEx = this.analyzePostsForEx(exName);
    const photosWithEx = this.analyzePhotosForEx(exName);
    
    let tagsToRemove = 0;
    this.connection.photos.forEach(photo => {
      if (photo.tags && photo.tags.data) {
        tagsToRemove += photo.tags.data.filter(tag => 
          tag.name.toLowerCase().includes(exName.toLowerCase())
        ).length;
      }
    });

    return {
      postsToDelete: postsWithEx.length,
      photosToDelete: photosWithEx.length,
      tagsToRemove
    };
  }
}

// Export singleton instance
export const facebookService = FacebookService.getInstance();
export default FacebookService;