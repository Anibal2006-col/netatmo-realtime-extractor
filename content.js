// content.js - Extrae datos de la página de Netatmo

class NetatmoExtractor {
    constructor() {
        this.data = {};
        this.observer = null;
        this.isRunning = false;
    }

    // Extrae el valor del "Enchufe Rack"
    extractEnchufRackData() {
        try {
            // Busca el elemento que contiene "Enchufe Rack"
            const elements = document.querySelectorAll('app-consumption-line');
            
            for (const element of elements) {
                const nameElement = element.querySelector('.consumption-item-name p');
                
                if (nameElement && nameElement.textContent.trim() === 'Enchufe Rack') {
                    // Extrae el valor numérico
                    const valueElement = element.querySelector('.consumption-item-value app-text p');
                    const unitElement = element.querySelector('.consumption-item-value app-text[unit] p');
                    
                    if (valueElement) {
                        const value = parseFloat(valueElement.textContent.trim());
                        const unit = unitElement ? unitElement.textContent.trim() : 'kWh';
                        
                        return {
                            name: 'Enchufe Rack',
                            value: value,
                            unit: unit,
                            timestamp: new Date().toISOString()
                        };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error extrayendo datos:', error);
            return null;
        }
    }

    // Extrae todos los datos de consumo
    extractAllData() {
        const allData = {
            timestamp: new Date().toISOString(),
            devices: []
        };

        try {
            const elements = document.querySelectorAll('app-consumption-line');
            
            elements.forEach(element => {
                const nameElement = element.querySelector('.consumption-item-name p');
                const valueElement = element.querySelector('.consumption-item-value app-text p');
                const unitElement = element.querySelector('.consumption-item-value app-text[unit] p');
                
                if (nameElement && valueElement) {
                    allData.devices.push({
                        name: nameElement.textContent.trim(),
                        value: parseFloat(valueElement.textContent.trim()),
                        unit: unitElement ? unitElement.textContent.trim() : 'kWh'
                    });
                }
            });
            
            return allData;
        } catch (error) {
            console.error('Error extrayendo todos los datos:', error);
            return allData;
        }
    }

    // Envía datos al servidor
    async sendToServer(data, serverUrl) {
        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('✓ Datos enviados al servidor:', data);
                return true;
            } else {
                console.error('✗ Error del servidor:', response.status);
                return false;
            }
        } catch (error) {
            console.error('✗ Error enviando datos:', error);
            return false;
        }
    }

    // Inicia la extracción continua
    start(intervalSeconds = 5) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🚀 Extractor iniciado');

        // Primera extracción inmediata
        this.extractAndUpdate();

        // Extracción periódica
        this.intervalId = setInterval(() => {
            this.extractAndUpdate();
        }, intervalSeconds * 1000);

        // Observa cambios en el DOM para actualizaciones en tiempo real
        this.setupDOMObserver();
    }

    // Extrae y actualiza datos
    async extractAndUpdate() {
        const data = this.extractAllData();
        
        // Guarda en storage para el popup
        chrome.storage.local.set({ latestData: data });

        // Envía mensaje al background script
        chrome.runtime.sendMessage({
            type: 'DATA_UPDATED',
            data: data
        });

        // Obtiene configuración del servidor
        const config = await chrome.storage.local.get(['serverUrl', 'autoSend']);
        
        if (config.autoSend && config.serverUrl) {
            await this.sendToServer(data, config.serverUrl);
        }
    }

    // Observa cambios en el DOM para actualizar en tiempo real
    setupDOMObserver() {
        const targetNode = document.querySelector('body');
        
        if (!targetNode) return;

        const config = { 
            childList: true, 
            subtree: true,
            characterData: true
        };

        this.observer = new MutationObserver((mutations) => {
            // Detecta cambios en los valores
            const hasValueChange = mutations.some(mutation => {
                return mutation.target.classList?.contains('consumption-item-value') ||
                       mutation.target.closest?.('.consumption-item-value');
            });

            if (hasValueChange) {
                this.extractAndUpdate();
            }
        });

        this.observer.observe(targetNode, config);
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.observer) {
            this.observer.disconnect();
        }
        console.log('⏹ Extractor detenido');
    }
}

// Inicializa el extractor
const extractor = new NetatmoExtractor();

// Escucha mensajes del popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_EXTRACTION') {
        extractor.start(request.interval || 5);
        sendResponse({ status: 'started' });
    } else if (request.action === 'STOP_EXTRACTION') {
        extractor.stop();
        sendResponse({ status: 'stopped' });
    } else if (request.action === 'GET_DATA') {
        const data = extractor.extractAllData();
        sendResponse({ data: data });
    }
    return true;
});

// Auto-inicio cuando se carga la página
chrome.storage.local.get(['autoStart'], (result) => {
    if (result.autoStart !== false) {
        extractor.start(5);
    }
});