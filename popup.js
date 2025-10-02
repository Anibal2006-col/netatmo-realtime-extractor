// popup.js - Lógica del popup

document.addEventListener('DOMContentLoaded', async () => {
    const dataList = document.getElementById('dataList');
    const noData = document.getElementById('noData');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const timestamp = document.getElementById('timestamp');
    const refreshBtn = document.getElementById('refreshBtn');
    const sendBtn = document.getElementById('sendBtn');
    const saveBtn = document.getElementById('saveBtn');
    const serverUrlInput = document.getElementById('serverUrl');
    const intervalInput = document.getElementById('intervalInput');
    const autoSendCheckbox = document.getElementById('autoSend');
    const autoStartCheckbox = document.getElementById('autoStart');

    // Carga la configuración
    await loadConfig();

    // Carga los datos iniciales
    await loadData();

    // Actualiza cada 2 segundos
    setInterval(loadData, 2000);

    // Event listeners
    refreshBtn.addEventListener('click', loadData);
    sendBtn.addEventListener('click', sendToServer);
    saveBtn.addEventListener('click', saveConfig);

    async function loadConfig() {
        const config = await chrome.storage.local.get([
            'serverUrl',
            'interval',
            'autoSend',
            'autoStart'
        ]);

        serverUrlInput.value = config.serverUrl || '';
        intervalInput.value = config.interval || 5;
        autoSendCheckbox.checked = config.autoSend || false;
        autoStartCheckbox.checked = config.autoStart !== false;
    }

    async function saveConfig() {
        const config = {
            serverUrl: serverUrlInput.value,
            interval: parseInt(intervalInput.value),
            autoSend: autoSendCheckbox.checked,
            autoStart: autoStartCheckbox.checked
        };

        await chrome.storage.local.set(config);
        
        showNotification('✓ Configuración guardada', 'success');
    }

    async function loadData() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('home.netatmo.com')) {
                updateStatus('⚠️ No estás en Netatmo', 'warning');
                return;
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_DATA' });
            
            if (response && response.data) {
                displayData(response.data);
                updateStatus('✓ Conectado', 'success');
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            updateStatus('✗ Error de conexión', 'error');
        }
    }

    function displayData(data) {
        if (!data.devices || data.devices.length === 0) {
            noData.style.display = 'block';
            dataList.style.display = 'none';
            return;
        }

        noData.style.display = 'none';
        dataList.style.display = 'block';

        dataList.innerHTML = data.devices.map(device => `
            <div class="data-item">
                <div class="device-name">${device.name}</div>
                <div class="device-value">
                    <span class="value">${device.value}</span>
                    <span class="unit">${device.unit}</span>
                </div>
            </div>
        `).join('');

        // Actualiza timestamp
        const date = new Date(data.timestamp);
        timestamp.textContent = `Actualizado: ${date.toLocaleTimeString()}`;
    }

    function updateStatus(text, type) {
        statusText.textContent = text;
        statusIndicator.className = `status-indicator ${type}`;
    }

    async function sendToServer() {
        const config = await chrome.storage.local.get(['serverUrl', 'latestData']);
        
        if (!config.serverUrl) {
            showNotification('⚠️ Configura la URL del servidor primero', 'warning');
            return;
        }

        if (!config.latestData) {
            showNotification('⚠️ No hay datos para enviar', 'warning');
            return;
        }

        try {
            sendBtn.disabled = true;
            sendBtn.textContent = '📤 Enviando...';

            const response = await fetch(config.serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config.latestData)
            });

            if (response.ok) {
                showNotification('✓ Datos enviados correctamente', 'success');
            } else {
                showNotification('✗ Error del servidor', 'error');
            }
        } catch (error) {
            showNotification('✗ Error de conexión', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📤 Enviar al Servidor';
        }
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
});
