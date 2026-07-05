self.addEventListener('install', (event) => {
    console.log('Service Worker Installed');
});

self.addEventListener('fetch', (event) => {
    // Yeh khali chhorna theek hai basic install ke liye
});
