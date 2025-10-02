// background.js - Maneja la comunicación y almacenamiento

let latestData = null;

// Escucha mensajes del content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'DATA_UPDATED') {
        latestData = request.data;
        
        // Actualiza el badge con el número de dispositivos
        if (request.data.devices && request.data.devices.length > 0) {
            chrome.action.setBadgeText({ 
                text: request.data.devices.length.toString() 
            });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
        }
    }
});

// Maneja la instalación
chrome.runtime.onInstalled.addListener(() => {
    console.log('Netatmo Data Extractor instalado');
    
    // Configuración por defecto
    chrome.storage.local.set({
        autoStart: true,
        autoSend: false,
        interval: 5,
        serverUrl: ''
    });
});
