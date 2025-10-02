# ⚡ Netatmo Realtime Extractor

Extensión para **Opera GX** que extrae datos de consumo eléctrico de Netatmo en tiempo real y los envía a un servidor externo.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Opera GX](https://img.shields.io/badge/Opera_GX-Compatible-red)

## 🎯 Características

- ✅ Extracción de datos en **tiempo real**
- ✅ Monitoreo automático de cambios en la página
- ✅ Envío automático a servidor externo (opcional)
- ✅ Interfaz visual con datos actualizados
- ✅ Configuración personalizable
- ✅ Compatible con Opera GX

## 📋 Requisitos

- **Opera GX** (o cualquier navegador basado en Chromium)
- Cuenta de Netatmo con acceso autorizado
- Servidor externo con endpoint API REST (opcional)

## 🚀 Instalación en Opera GX

### Paso 1: Descargar el Repositorio

```bash
git clone https://github.com/Anibal2006-col/netatmo-realtime-extractor.git
cd netatmo-realtime-extractor
```

O descarga el ZIP: **Code** → **Download ZIP**

### Paso 2: Cargar la Extensión

1. Abre **Opera GX**
2. Ve a: `opera://extensions`
3. Activa el **"Modo de desarrollador"** (esquina superior derecha)
4. Click en **"Cargar extensión descomprimida"**
5. Selecciona la carpeta `netatmo-realtime-extractor`
6. ¡Listo! Verás el ícono de la extensión en la barra

### Paso 3: Usar la Extensión

1. Ve a: https://home.netatmo.com/control/dashboard
2. Inicia sesión en tu cuenta
3. Click en el ícono de la extensión
4. Verás los datos en tiempo real:
   - **Enchufe Rack**: 4.85 kWh
   - (Y otros dispositivos que agregues)

## ⚙️ Configuración

### Configurar el Servidor Externo

1. Click en el ícono de la extensión
2. En la sección **"⚙️ Configuración"**:
   - **URL del Servidor**: `https://tu-servidor.com/api/data`
   - **Intervalo**: `5` segundos (ajustable)
   - **☑️ Enviar automáticamente**: Marca para envío automático
   - **☑️ Iniciar automáticamente**: Marca para iniciar al cargar la página
3. Click en **"💾 Guardar Configuración"**

### Formato de Datos Enviados

La extensión envía datos en formato JSON:

```json
{
  "timestamp": "2025-10-02T01:09:12.000Z",
  "devices": [
    {
      "name": "Enchufe Rack",
      "value": 4.85,
      "unit": "kWh"
    },
    {
      "name": "Otro Dispositivo",
      "value": 2.34,
      "unit": "kWh"
    }
  ]
}
```

## 🔧 Personalización

### Añadir Más Variables

Edita `content.js` y modifica el método `extractAllData()`:

```javascript
// Ejemplo: extraer datos adicionales
const temperatura = document.querySelector('.temperatura-value');
const humedad = document.querySelector('.humedad-value');

allData.temperatura = parseFloat(temperatura?.textContent || 0);
allData.humedad = parseFloat(humedad?.textContent || 0);
```

### Cambiar Intervalo de Actualización

En el popup o editando `content.js`:

```javascript
extractor.start(10); // Actualiza cada 10 segundos
```

## 🛠️ Desarrollo

### Estructura del Proyecto

```
netatmo-realtime-extractor/
├── manifest.json       # Configuración de la extensión
├── content.js          # Script que extrae datos de Netatmo
├── background.js       # Service worker para comunicación
├── popup.html          # Interfaz visual
├── popup.js            # Lógica del popup
├── popup.css           # Estilos
└── icons/              # Iconos de la extensión
```

### Tecnologías Usadas

- **Manifest V3** (últimas especificaciones de Chrome)
- **Vanilla JavaScript** (sin dependencias)
- **MutationObserver API** (detección de cambios en tiempo real)
- **Chrome Storage API** (almacenamiento de configuración)
- **Fetch API** (envío de datos al servidor)

## 🐛 Solución de Problemas

### La extensión no muestra datos

1. ✅ Verifica que estás en `https://home.netatmo.com/control/dashboard`
2. ✅ Recarga la página (F5)
3. ✅ Abre la consola del navegador (F12) y busca errores
4. ✅ Verifica que los elementos existen en la página

### Los datos no se envían al servidor

1. ✅ Verifica la URL del servidor en la configuración
2. ✅ Asegúrate de que el servidor acepta POST requests
3. ✅ Verifica CORS en tu servidor
4. ✅ Revisa la consola para errores de red

### La extensión no se carga

1. ✅ Verifica que el modo desarrollador está activo
2. ✅ Revisa que todos los archivos están en la carpeta
3. ✅ Verifica el `manifest.json` (sin errores de sintaxis)

## 📡 Ejemplo de Servidor (Node.js)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Endpoint para recibir datos
app.post('/api/data', (req, res) => {
    console.log('Datos recibidos:', req.body);
    
    // Aquí puedes guardar en base de datos
    // db.insert(req.body)
    
    res.json({ status: 'success', received: true });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});
```

## 📡 Ejemplo de Servidor (Python/Flask)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    print('Datos recibidos:', data)
    
    # Aquí puedes guardar en base de datos
    # db.insert(data)
    
    return jsonify({'status': 'success', 'received': True})

if __name__ == '__main__':
    app.run(port=3000)
```

## 🔐 Seguridad

- ⚠️ La extensión solo funciona en `home.netatmo.com`
- ⚠️ Nunca compartas tu URL del servidor públicamente
- ⚠️ Usa HTTPS para tu servidor
- ⚠️ Implementa autenticación en tu API

## 📊 Roadmap

- [ ] Exportar datos a CSV
- [ ] Gráficos de consumo en tiempo real
- [ ] Alertas de consumo excesivo
- [ ] Soporte para múltiples cuentas
- [ ] Dashboard web personalizado

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

## 👨‍💻 Autor

**Anibal2006-col**

- GitHub: [@Anibal2006-col](https://github.com/Anibal2006-col)

## 🙏 Agradecimientos

- Proyecto para Ciencias de Datos
- Netatmo por la plataforma
- Opera GX

---

⭐ **¿Te gusta el proyecto?** ¡Dale una estrella en GitHub!

🐛 **¿Encontraste un bug?** Abre un [issue](https://github.com/Anibal2006-col/netatmo-realtime-extractor/issues)

💬 **¿Preguntas?** Abre una [discusión](https://github.com/Anibal2006-col/netatmo-realtime-extractor/discussions)
