# MatonIA Landing Page

Landing page para el servicio de negociación automática de cuentas MatonIA. Ahorra dinero en telefonía, internet, seguros, streaming y más.

## 🚀 Despliegue Rápido

### Opción 1: Netlify (Recomendado)
1. **Crea cuenta en [Netlify](https://netlify.com)**
2. **Conecta tu repositorio GitHub**
3. **Configuración automática**: `netlify.toml` ya está configurado
4. **Deploy automático** en cada push ✅

### Opción 2: Vercel
1. **Crea cuenta en [Vercel](https://vercel.com)**
2. **Conecta tu repositorio GitHub**
3. **Configuración automática**: `vercel.json` ya está configurado
4. **Deploy automático** en cada push ✅

### Opción 3: GitHub Pages
```bash
# Instalar dependencias
npm install

# Deploy a GitHub Pages
npm run deploy
```

## 📁 Estructura del Proyecto

```
MatonIA/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos principales
│   ├── js/
│   │   └── script.js       # JavaScript principal
│   └── images/             # Imágenes y assets
├── package.json            # Dependencias y scripts
├── netlify.toml           # Configuración Netlify
├── vercel.json            # Configuración Vercel
├── .gitignore             # Archivos ignorados por Git
├── .gitattributes         # Configuración Git
└── README.md              # Este archivo
```

## 🛠️ Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/MatonIA.git
cd MatonIA

# Instalar dependencias
npm install

# Servidor local
npm start
# o alternativamente
npm run serve

# Build para producción
npm run build
```

## ⚙️ Configuración

### 1. Configuración Principal
Copia el archivo de ejemplo y edita la configuración:

```bash
cp config.example.json config.json
```

Edita `config.json` con tus datos:

```json
{
  "whatsapp": {
    "phoneNumber": "56934812424",
    "message": "Tu mensaje personalizado aquí..."
  },
  "analytics": {
    "googleAnalyticsId": "TU_GA_MEASUREMENT_ID",
    "facebookPixelId": "TU_FB_PIXEL_ID"
  },
  "site": {
    "title": "MatonIA - Ahorra en tus cuentas",
    "description": "Negociación automática de cuentas: telefonía, internet, seguros, streaming y más",
    "url": "https://tu-dominio.com"
  }
}
```

### 2. Meta Tags
Actualiza las URLs en `index.html` líneas 14-25:
```html
<meta property="og:url" content="https://tu-dominio.com">
<meta name="twitter:url" content="https://tu-dominio.com">
```

### 3. Favicon
Agrega tu favicon en `assets/images/favicon.ico`

### 4. Seguridad
- ✅ `config.json` está en `.gitignore` para evitar subir datos sensibles
- ✅ Usa `config.example.json` como plantilla
- ✅ La aplicación tiene fallback si no encuentra el archivo

## 🎯 Características

- ✅ **Responsive design** - Compatible con móviles y desktop
- ✅ **SEO optimizado** - Meta tags completos
- ✅ **Redes sociales** - Open Graph y Twitter Cards
- ✅ **Integración WhatsApp** - Con fallbacks para errores
- ✅ **Google Analytics** - Tracking de conversiones
- ✅ **Optimizado conversión** - CTAs y copy optimizado
- ✅ **Configuración producción** - Listo para deploy
- ✅ **Error handling** - Manejo de errores robusto

## 📊 Analytics y Tracking

### Google Analytics
```javascript
gtag('event', 'conversion', {
    'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'
});
```

### Facebook Pixel
```javascript
fbq('track', 'Lead');
```

## 🎨 Personalización

### Colores
Modifica las variables CSS en `assets/css/styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --whatsapp-green: #25D366;
}
```

### Contenido
- **Título principal**: `index.html` línea 54
- **Beneficios**: `index.html` líneas 58-70
- **Pasos del proceso**: `index.html` líneas 81-93

### Funcionalidad
- **WhatsApp**: `assets/js/script.js` líneas 2-35
- **Animaciones**: `assets/js/script.js` líneas 51-83

## 🚀 URLs de Despliegue

- **Netlify**: https://app.netlify.com/
- **Vercel**: https://vercel.com/
- **GitHub Pages**: Settings > Pages en tu repositorio

## 📋 Comandos Útiles

```bash
# Desarrollo
npm start                 # Servidor local
npm run serve            # Servidor alternativo

# Producción
npm run build            # Build para producción
npm run deploy           # Deploy a GitHub Pages

# Utilidades
npm run minify-css       # Minificar CSS
npm run minify-js        # Minificar JavaScript
```

## 🔒 Seguridad

- Headers de seguridad configurados en `netlify.toml` y `vercel.json`
- Validación de formularios implementada
- Manejo seguro de errores

## 🌍 Compatibilidad

- ✅ Chrome/Safari/Firefox/Edge
- ✅ iOS/Android
- ✅ Responsive design
- ✅ Accesibilidad básica

## 📞 Soporte

Para cambios en la funcionalidad o diseño, contacta al desarrollador o abre un issue en GitHub.