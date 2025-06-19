// Utility script to clear ServiceWorker registrations
// Run this in browser console if you encounter ServiceWorker port conflicts

async function clearServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} ServiceWorker registration(s)`);
      
      for (const registration of registrations) {
        console.log('Unregistering ServiceWorker:', registration.scope);
        await registration.unregister();
      }
      
      console.log('✅ All ServiceWorkers cleared successfully');
      console.log('🔄 Refresh the page to register a new ServiceWorker');
      
      // Clear caches as well
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} cache(s)`);
      
      for (const cacheName of cacheNames) {
        console.log('Deleting cache:', cacheName);
        await caches.delete(cacheName);
      }
      
      console.log('✅ All caches cleared successfully');
      
    } catch (error) {
      console.error('❌ Error clearing ServiceWorkers:', error);
    }
  } else {
    console.log('ServiceWorker not supported in this browser');
  }
}

console.log('🧹 ServiceWorker Cleaner Loaded');
console.log('Run clearServiceWorkers() to clear all registrations and caches'); 