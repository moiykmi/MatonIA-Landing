# 📊 Cuadro de Mando MatonIA - Queries Principales

## 🎯 Meta del Experimento
**Objetivo:** Validar la hipótesis de valor si logramos que **10% de visitantes se inscriban** y **70% complete el proceso** de entregar datos.

## 📋 Queries para Métricas AARRR

### 1. 🚀 ADQUISICIÓN (Acquisition)

#### Visitantes Diarios
```sql
-- ¿Cuántas personas visitan la landing page?
SELECT 
    DATE(created_at) as fecha,
    COUNT(DISTINCT session_id) as visitantes_unicos,
    COUNT(*) as total_visitas
FROM page_visits 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

#### Fuentes de Tráfico
```sql
-- ¿De dónde vienen los visitantes?
SELECT 
    COALESCE(utm_source, 'Direct') as fuente,
    COUNT(DISTINCT session_id) as visitantes,
    ROUND(COUNT(DISTINCT session_id) * 100.0 / (SELECT COUNT(DISTINCT session_id) FROM page_visits), 2) as porcentaje
FROM page_visits 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY utm_source
ORDER BY visitantes DESC;
```

#### Costo por Visitante (cuando aplique)
```sql
-- Para calcular CAV cuando tengas datos de inversión publicitaria
SELECT 
    utm_source,
    utm_campaign,
    COUNT(DISTINCT session_id) as visitantes,
    -- Agregar manualmente el costo por campaña
    0 as costo_total,
    CASE 
        WHEN COUNT(DISTINCT session_id) > 0 
        THEN 0 / COUNT(DISTINCT session_id)::DECIMAL 
        ELSE 0 
    END as costo_por_visitante
FROM page_visits 
WHERE utm_source IS NOT NULL 
    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY utm_source, utm_campaign;
```

### 2. ⚡ ACTIVACIÓN (Activation)

#### Tasa de Conversión Principal
```sql
-- Del total de visitantes, ¿qué porcentaje se inscribe?
SELECT 
    DATE(pv.created_at) as fecha,
    COUNT(DISTINCT pv.session_id) as total_visitantes,
    COUNT(DISTINCT l.session_id) as leads_generados,
    ROUND(
        (COUNT(DISTINCT l.session_id)::DECIMAL / COUNT(DISTINCT pv.session_id) * 100), 2
    ) as tasa_conversion_porcentaje
FROM page_visits pv
LEFT JOIN leads l ON pv.session_id = l.session_id
WHERE pv.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(pv.created_at)
ORDER BY fecha DESC;
```

#### Indicador de Confianza
```sql
-- ¿Qué porcentaje de inscritos entrega datos completos?
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN name IS NOT NULL AND phone IS NOT NULL 
               AND current_provider IS NOT NULL 
               AND monthly_bill IS NOT NULL THEN 1 END) as leads_completos,
    COUNT(CASE WHEN whatsapp_clicked = true THEN 1 END) as leads_whatsapp_click,
    
    -- Ratios clave
    ROUND(
        (COUNT(CASE WHEN name IS NOT NULL AND phone IS NOT NULL 
                   AND current_provider IS NOT NULL 
                   AND monthly_bill IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*) * 100), 2
    ) as tasa_completacion_porcentaje,
    
    ROUND(
        (COUNT(CASE WHEN whatsapp_clicked = true THEN 1 END)::DECIMAL / COUNT(*) * 100), 2
    ) as tasa_whatsapp_porcentaje
FROM leads 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

### 3. 💰 VALIDACIÓN DE INGRESOS (Revenue Validation)

#### Disposición de Pago
```sql
-- ¿Cuánto están dispuestos a pagar los usuarios?
SELECT 
    pricing_model,
    COUNT(*) as respuestas,
    AVG(CASE WHEN pricing_model = 'percentage' THEN percentage_willing END) as promedio_porcentaje,
    AVG(CASE WHEN pricing_model = 'fixed_fee' THEN fixed_amount_willing END) as promedio_tarifa_fija,
    AVG(CASE WHEN pricing_model = 'monthly_subscription' THEN monthly_amount_willing END) as promedio_mensual
FROM revenue_validation
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY pricing_model
ORDER BY respuestas DESC;
```

#### Rangos de Precios Preferidos
```sql
-- Distribución de precios por modelo
SELECT 
    'Porcentaje 0-10%' as rango,
    COUNT(CASE WHEN percentage_willing <= 10 THEN 1 END) as respuestas
FROM revenue_validation
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'Porcentaje 11-20%' as rango,
    COUNT(CASE WHEN percentage_willing > 10 AND percentage_willing <= 20 THEN 1 END)
FROM revenue_validation
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'Porcentaje 21-30%' as rango,
    COUNT(CASE WHEN percentage_willing > 20 AND percentage_willing <= 30 THEN 1 END)
FROM revenue_validation
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
    'Porcentaje 30%+' as rango,
    COUNT(CASE WHEN percentage_willing > 30 THEN 1 END)
FROM revenue_validation
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```

## 📊 Dashboard Principal - Query Unificada

```sql
-- Cuadro de mando principal con todas las métricas clave
WITH daily_metrics AS (
    SELECT 
        DATE(pv.created_at) as fecha,
        COUNT(DISTINCT pv.session_id) as visitantes_unicos,
        COUNT(DISTINCT l.session_id) as leads_generados,
        COUNT(DISTINCT CASE WHEN l.whatsapp_clicked = true THEN l.session_id END) as whatsapp_clicks,
        AVG(pv.time_on_page) as tiempo_promedio,
        AVG(pv.scroll_depth) as scroll_promedio
    FROM page_visits pv
    LEFT JOIN leads l ON pv.session_id = l.session_id
    WHERE pv.created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(pv.created_at)
)
SELECT 
    fecha,
    visitantes_unicos,
    leads_generados,
    whatsapp_clicks,
    
    -- Métricas de conversión
    ROUND((leads_generados::DECIMAL / visitantes_unicos * 100), 2) as tasa_conversion_porcentaje,
    ROUND((whatsapp_clicks::DECIMAL / visitantes_unicos * 100), 2) as tasa_whatsapp_porcentaje,
    
    -- Métricas de engagement
    ROUND(tiempo_promedio::DECIMAL, 0) as tiempo_promedio_segundos,
    ROUND(scroll_promedio::DECIMAL, 0) as scroll_promedio_porcentaje,
    
    -- Indicadores de meta
    CASE 
        WHEN (leads_generados::DECIMAL / visitantes_unicos * 100) >= 10 
        THEN '✅ META ALCANZADA' 
        ELSE '⚠️ Por debajo de meta' 
    END as status_conversion_meta,
    
    CASE 
        WHEN leads_generados > 0 AND (whatsapp_clicks::DECIMAL / leads_generados * 100) >= 70 
        THEN '✅ META ALCANZADA' 
        ELSE '⚠️ Por debajo de meta' 
    END as status_completacion_meta
    
FROM daily_metrics
ORDER BY fecha DESC;
```

## 🎯 Queries para Validación de Hipótesis

### Validación de Meta Principal
```sql
-- Verificar si cumplimos: 10% conversión + 70% completación
WITH conversion_metrics AS (
    SELECT 
        COUNT(DISTINCT pv.session_id) as total_visitantes,
        COUNT(DISTINCT l.session_id) as total_leads,
        COUNT(DISTINCT CASE WHEN l.whatsapp_clicked = true THEN l.session_id END) as leads_whatsapp
    FROM page_visits pv
    LEFT JOIN leads l ON pv.session_id = l.session_id
    WHERE pv.created_at >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
    total_visitantes,
    total_leads,
    leads_whatsapp,
    
    -- Métricas principales
    ROUND((total_leads::DECIMAL / total_visitantes * 100), 2) as tasa_conversion,
    ROUND((leads_whatsapp::DECIMAL / total_leads * 100), 2) as tasa_completacion,
    
    -- Validación de hipótesis
    CASE 
        WHEN (total_leads::DECIMAL / total_visitantes * 100) >= 10 
        THEN '✅ Conversión: META ALCANZADA (≥10%)'
        ELSE '❌ Conversión: Por debajo de meta (<10%)'
    END as validacion_conversion,
    
    CASE 
        WHEN total_leads > 0 AND (leads_whatsapp::DECIMAL / total_leads * 100) >= 70 
        THEN '✅ Completación: META ALCANZADA (≥70%)'
        ELSE '❌ Completación: Por debajo de meta (<70%)'
    END as validacion_completacion,
    
    -- Conclusión
    CASE 
        WHEN (total_leads::DECIMAL / total_visitantes * 100) >= 10 
             AND (leads_whatsapp::DECIMAL / total_leads * 100) >= 70 
        THEN '🎉 HIPÓTESIS VALIDADA: Ambas metas alcanzadas'
        ELSE '⚠️ HIPÓTESIS NO VALIDADA: Revisar estrategia'
    END as conclusion_experimento
    
FROM conversion_metrics;
```

## 📱 Queries por Dispositivo

```sql
-- Análisis por tipo de dispositivo
SELECT 
    device_type,
    COUNT(DISTINCT pv.session_id) as visitantes,
    COUNT(DISTINCT l.session_id) as leads,
    ROUND((COUNT(DISTINCT l.session_id)::DECIMAL / COUNT(DISTINCT pv.session_id) * 100), 2) as conversion_rate
FROM page_visits pv
LEFT JOIN leads l ON pv.session_id = l.session_id
WHERE pv.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY device_type
ORDER BY visitantes DESC;
```

## 🔄 Queries de Seguimiento Temporal

```sql
-- Evolución horaria para optimizar horarios de campaña
SELECT 
    EXTRACT(HOUR FROM created_at) as hora,
    COUNT(DISTINCT session_id) as visitantes
FROM page_visits
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hora;
```

## 📝 Instrucciones de Uso

1. **Ejecutar en Supabase**: Ve a SQL Editor y ejecuta las queries
2. **Frecuencia**: Revisar métricas diariamente
3. **Alertas**: Si conversión < 10% o completación < 70%, revisar estrategia
4. **Iteración**: Usar datos para optimizar copy, diseño, o targeting

## 🎨 Visualización Recomendada

Para crear un dashboard visual, usa estas métricas en herramientas como:
- **Grafana** + Supabase
- **Metabase** + Supabase  
- **Google Data Studio** + Supabase connector
- **Tableau** + PostgreSQL connector