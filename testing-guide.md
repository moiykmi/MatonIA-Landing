# 🧪 Guía de Pruebas - Sistema AARRR MatonIA

## 🚀 **Opción 1: Prueba Local (Recomendada)**

### Paso 1: Configurar Servidor Local
```bash
# En la carpeta del proyecto
npx http-server . -p 8080
# O si tienes Python:
python -m http.server 8080
# O si tienes Node.js:
npx serve .
```

### Paso 2: Configurar Supabase (5 minutos)
1. **Crear proyecto gratuito**: https://supabase.com → "New Project"
2. **Ejecutar SQL**: Ve a SQL Editor y pega el contenido de `supabase-setup.sql`
3. **Ejecutar Analytics**: Luego pega el contenido de `analytics-queries.sql`
4. **Obtener credenciales**: Settings → API → Copia URL y anon key

### Paso 3: Actualizar Credenciales
```javascript
// En assets/js/supabase.js, líneas 2-3:
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...tu-clave-anonima';
```

### Paso 4: Probar Flujo Completo
```bash
# Abrir en navegador
http://localhost:8080

# Probar en modo incógnito para simular diferentes usuarios
```

## 🎯 **Flujo de Pruebas Paso a Paso**

### Test 1: Tracking de Visitantes
```bash
1. Abrir http://localhost:8080
2. Navegar por la página (scroll, hover botones)
3. Verificar en Supabase → Table Editor → page_visits
4. Deberías ver un registro con tu session_id
```

### Test 2: Captura de Leads
```bash
1. Completar formulario:
   - Nombre: "Juan Pérez"
   - Teléfono: "987654321"
   - Proveedor: "Movistar"
   - Factura: "50000"
   - Servicios: Marcar "Telefonía" e "Internet"

2. Click "Ver mi ahorro potencial"
3. Verificar en Supabase → Table Editor → leads
4. Deberías ver el lead con estimated_savings calculado
```

### Test 3: Validación de Ingresos
```bash
1. Después del formulario, aparece mensaje de éxito
2. Click "¡Contactar ahora por WhatsApp!"
3. Aparece popup: "Una última pregunta"
4. Seleccionar "Un porcentaje del ahorro conseguido"
5. Cambiar a 25% y click "Continuar a WhatsApp"
6. Verificar en Supabase → Table Editor → revenue_validation
7. Deberías ver la respuesta con pricing_model='percentage'
```

### Test 4: Métricas del Dashboard
```sql
-- Ejecutar en Supabase SQL Editor:
SELECT * FROM matonia_dashboard 
WHERE fecha >= CURRENT_DATE - INTERVAL '1 days';

-- Deberías ver:
-- - visitantes_unicos: 1
-- - leads_generados: 1  
-- - tasa_conversion_porcentaje: 100.00
-- - tasa_whatsapp_porcentaje: 100.00
```

## 📊 **Pruebas de Métricas Específicas**

### Probar Múltiples Usuarios
```bash
# Simular 10 visitantes diferentes:
1. Abrir 10 pestañas en modo incógnito
2. En cada una, navegar diferente:
   - 5 pestañas: Solo navegar (no llenar formulario)
   - 3 pestañas: Llenar formulario pero no click WhatsApp
   - 2 pestañas: Flujo completo hasta WhatsApp

# Verificar métricas:
# - 10 visitantes únicos
# - 5 leads generados (50% conversión)
# - 2 WhatsApp clicks (40% completación)
```

### Query de Validación
```sql
-- Verificar si cumples la meta del experimento
WITH conversion_metrics AS (
    SELECT 
        COUNT(DISTINCT pv.session_id) as total_visitantes,
        COUNT(DISTINCT l.session_id) as total_leads,
        COUNT(DISTINCT CASE WHEN l.whatsapp_clicked = true THEN l.session_id END) as leads_whatsapp
    FROM page_visits pv
    LEFT JOIN leads l ON pv.session_id = l.session_id
    WHERE pv.created_at >= CURRENT_DATE - INTERVAL '1 days'
)
SELECT 
    total_visitantes,
    total_leads,
    leads_whatsapp,
    ROUND((total_leads::DECIMAL / total_visitantes * 100), 2) as tasa_conversion,
    ROUND((leads_whatsapp::DECIMAL / total_leads * 100), 2) as tasa_completacion,
    
    -- Validación de metas
    CASE 
        WHEN (total_leads::DECIMAL / total_visitantes * 100) >= 10 
        THEN '✅ Conversión: META ALCANZADA (≥10%)'
        ELSE '❌ Conversión: Por debajo de meta (<10%)'
    END as validacion_conversion,
    
    CASE 
        WHEN total_leads > 0 AND (leads_whatsapp::DECIMAL / total_leads * 100) >= 70 
        THEN '✅ Completación: META ALCANZADA (≥70%)'
        ELSE '❌ Completación: Por debajo de meta (<70%)'
    END as validacion_completacion
    
FROM conversion_metrics;
```

## 🔧 **Opción 2: Prueba en Vercel (Producción)**

### Configurar Variables de Entorno
```bash
# En el dashboard de Vercel:
1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega:
   - NEXT_PUBLIC_SUPABASE_URL: tu-url-de-supabase
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: tu-clave-anonima
3. Redeploy el proyecto
```

### Probar en Múltiples Dispositivos
```bash
# Obtener URL de Vercel y probar en:
1. Desktop (Chrome, Firefox, Safari)
2. Móvil (iOS Safari, Android Chrome)
3. Tablet
4. Diferentes UTM parameters:
   - https://tu-app.vercel.app?utm_source=google&utm_campaign=test
   - https://tu-app.vercel.app?utm_source=facebook&utm_campaign=test
```

## 📱 **Pruebas de Funcionalidad Móvil**

### Test Swipe en Testimonios
```bash
1. Abrir en móvil
2. Ir a sección "Lo que dicen nuestros clientes"
3. Hacer swipe horizontal
4. Verificar scroll suave y snap
```

### Test Formulario Responsivo
```bash
1. Llenar formulario en móvil
2. Verificar que todos los campos se vean bien
3. Probar checkboxes de servicios
4. Verificar popup de validación se adapte a pantalla
```

## 🐛 **Troubleshooting Común**

### "No se guardan datos en Supabase"
```javascript
// Verificar en Console del navegador (F12):
// Si ves errores de CORS o 403:
1. Verificar que URL y key sean correctas
2. Verificar que RLS policies estén configuradas
3. Verificar que tablas existan

// Query para verificar políticas:
SELECT * FROM pg_policies WHERE tablename IN ('leads', 'page_visits', 'events');
```

### "Popup de validación no aparece"
```javascript
// Verificar en Console:
// Si hay error "openWhatsAppWithLead not defined":
1. Verificar que script.js se cargue después de supabase.js
2. Verificar que no haya errores de JavaScript

// Test manual:
openWhatsAppWithLead(); // Ejecutar en console
```

### "Métricas no se actualizan"
```sql
-- Verificar que datos se estén guardando:
SELECT COUNT(*) FROM page_visits WHERE created_at >= CURRENT_DATE;
SELECT COUNT(*) FROM leads WHERE created_at >= CURRENT_DATE;
SELECT COUNT(*) FROM events WHERE created_at >= CURRENT_DATE;

-- Si las tablas están vacías, revisar JavaScript y credenciales
```

## 📊 **Métricas Esperadas en Pruebas**

### Escenario Exitoso (10 visitantes simulados)
```
┌─────────────────┬────────────────┬─────────────────┐
│ Métrica         │ Valor Esperado │ Meta            │
├─────────────────┼────────────────┼─────────────────┤
│ Visitantes      │ 10             │ -               │
│ Leads           │ 3-5            │ ≥1 (≥10%)       │
│ WhatsApp Clicks │ 2-4            │ ≥70% de leads   │
│ Conversión      │ 30-50%         │ ≥10% ✅         │
│ Completación    │ 70-80%         │ ≥70% ✅         │
└─────────────────┴────────────────┴─────────────────┘
```

## 🎯 **Checklist de Pruebas**

### ✅ Funcionalidad Básica
- [ ] Página carga correctamente
- [ ] Formulario se puede completar
- [ ] Botón WhatsApp funciona
- [ ] Datos se guardan en Supabase

### ✅ Métricas AARRR
- [ ] Page visits se registran
- [ ] Leads se capturan correctamente
- [ ] Revenue validation funciona
- [ ] Queries del dashboard devuelven datos

### ✅ UX/UI
- [ ] Responsive design en móvil
- [ ] Animaciones funcionan
- [ ] Formulario muestra estados de carga
- [ ] Popup de validación es intuitivo

### ✅ Analytics
- [ ] Métricas se calculan correctamente
- [ ] Dashboard queries funcionan
- [ ] Validación de metas es precisa

## 🚀 **Próximo Paso**

1. **Configurar Supabase** (5 minutos)
2. **Actualizar credenciales** en el código
3. **Probar localmente** con el flujo completo
4. **Verificar métricas** en el dashboard

¿Empezamos con la configuración de Supabase o prefieres otra opción de prueba?