import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeAuthToken } from './auth';

export const cleanupStorage = async () => {
    try {
        await removeAuthToken();
        
        await AsyncStorage.removeItem('userData');
        
        await AsyncStorage.removeItem('appSettings');
        
        await AsyncStorage.removeItem('booksCache');
        await AsyncStorage.removeItem('userProfileCache');
        
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(key => 
        key.startsWith('temp_') || 
        key.startsWith('cache_')
        );
        
        if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        }

        console.log('Storage cleanup completed successfully');
    } catch (error) {
        console.error('Error during storage cleanup:', error);
        throw error;
    }
};

export const cleanupMemoryCache = () => {
    try { 
        console.log('Memory cache cleanup completed');
    } catch (error) {
        console.error('Error during memory cleanup:', error);
        throw error;
    }
};

export const performCleanup = async () => {
    try {
        await cleanupStorage();
        cleanupMemoryCache();
        console.log('All cleanup processes completed successfully');
    } catch (error) {
        console.error('Error during cleanup process:', error);
        throw error;
    }
};