-- ============================================
-- CUADRO DE MANDO MATONIA - MÉTRICAS PIRATA (AARRR)
-- ============================================

-- ============================
-- 1. ADQUISICIÓN (ACQUISITION)
-- ============================

-- Métrica: ¿Cuántas personas visitan la landing page?
CREATE OR REPLACE VIEW acquisition_metrics AS
SELECT 
    DATE(created_at) as fecha,
    COUNT(DISTINCT session_id) as visitantes_unicos,
    COUNT(*) as total_visitas,
    COUNT(DISTINCT CASE WHEN referrer IS NOT NULL THEN session_id END) as visitantes_con_referrer,
    COUNT(DISTINCT CASE WHEN utm_source IS NOT NULL THEN session_id END) as visitantes_con_utm,
    
    -- Breakdown por fuente
    COUNT(DISTINCT CASE WHEN utm_source = 'google' THEN session_id END) as google_visitors,
    COUNT(DISTINCT CASE WHEN utm_source = 'facebook' THEN session_id END) as facebook_visitors,
    COUNT(DISTINCT CASE WHEN utm_source = 'instagram' THEN session_id END) as instagram_visitors,
    COUNT(DISTINCT CASE WHEN referrer LIKE '%google%' THEN session_id END) as organic_google,
    COUNT(DISTINCT CASE WHEN referrer IS NULL THEN session_id END) as direct_visitors,
    
    -- Breakdown por dispositivo
    COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) as mobile_visitors,
    COUNT(DISTINCT CASE WHEN device_type = 'desktop' THEN session_id END) as desktop_visitors,
    COUNT(DISTINCT CASE WHEN device_type = 'tablet' THEN session_id END) as tablet_visitors,
    
    -- Engagement básico
    AVG(time_on_page) as tiempo_promedio_pagina,
    AVG(scroll_depth) as scroll_promedio
FROM page_visits 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- Métrica: Costo de Adquisición por Visitante (CAV)
CREATE OR REPLACE VIEW acquisition_cost AS
SELECT 
    DATE(created_at) as fecha,
    utm_source,
    utm_campaign,
    COUNT(DISTINCT session_id) as visitantes,
    -- Nota: El costo debe ser ingresado manualmente o via API
    0 as costo_total, -- Placeholder - actualizar con datos reales
    CASE 
        WHEN COUNT(DISTINCT session_id) > 0 
        THEN 0 / COUNT(DISTINCT session_id)::DECIMAL 
        ELSE 0 
    END as costo_por_visitante
FROM page_visits 
WHERE utm_source IS NOT NULL 
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), utm_source, utm_campaign
ORDER BY fecha DESC, visitantes DESC;

-- ============================
-- 2. ACTIVACIÓN (ACTIVATION)
-- ============================

-- Métrica Clave: Tasa de Conversión (visitantes → inscritos)
CREATE OR REPLACE VIEW activation_conversion AS
SELECT 
    DATE(pv.created_at) as fecha,
    COUNT(DISTINCT pv.session_id) as total_visitantes,
    COUNT(DISTINCT l.session_id) as leads_generados,
    
    -- Tasa de conversión principal
    ROUND(
        (COUNT(DISTINCT l.session_id)::DECIMAL / COUNT(DISTINCT pv.session_id) * 100), 2
    ) as tasa_conversion_porcentaje,
    
    -- Breakdown por fuente
    COUNT(DISTINCT CASE WHEN pv.utm_source = 'google' THEN pv.session_id END) as google_visitors,
    COUNT(DISTINCT CASE WHEN pv.utm_source = 'google' THEN l.session_id END) as google_leads,
    
    COUNT(DISTINCT CASE WHEN pv.utm_source = 'facebook' THEN pv.session_id END) as facebook_visitors,
    COUNT(DISTINCT CASE WHEN pv.utm_source = 'facebook' THEN l.session_id END) as facebook_leads,
    
    -- Breakdown por dispositivo
    COUNT(DISTINCT CASE WHEN pv.device_type = 'mobile' THEN pv.session_id END) as mobile_visitors,
    COUNT(DISTINCT CASE WHEN pv.device_type = 'mobile' THEN l.session_id END) as mobile_leads,
    
    COUNT(DISTINCT CASE WHEN pv.device_type = 'desktop' THEN pv.session_id END) as desktop_visitors,
    COUNT(DISTINCT CASE WHEN pv.device_type = 'desktop' THEN l.session_id END) as desktop_leads
    
FROM page_visits pv
LEFT JOIN leads l ON pv.session_id = l.session_id
WHERE pv.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(pv.created_at)
ORDER BY fecha DESC;

-- Métrica: Porcentaje que completa datos necesarios (confianza)
CREATE OR REPLACE VIEW activation_completion AS
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as total_leads,
    
    -- Leads que completaron información básica
    COUNT(CASE WHEN name IS NOT NULL AND phone IS NOT NULL THEN 1 END) as leads_info_basica,
    COUNT(CASE WHEN current_provider IS NOT NULL THEN 1 END) as leads_con_proveedor,
    COUNT(CASE WHEN monthly_bill IS NOT NULL AND monthly_bill > 0 THEN 1 END) as leads_con_factura,
    COUNT(CASE WHEN array_length(services, 1) > 0 THEN 1 END) as leads_con_servicios,
    
    -- Leads que hicieron click en WhatsApp (indicador de confianza)
    COUNT(CASE WHEN whatsapp_clicked = true THEN 1 END) as leads_whatsapp_click,
    
    -- Ratios de finalización
    ROUND(
        (COUNT(CASE WHEN name IS NOT NULL AND phone IS NOT NULL 
                   AND current_provider IS NOT NULL 
                   AND monthly_bill IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*) * 100), 2
    ) as tasa_completacion_porcentaje,
    
    ROUND(
        (COUNT(CASE WHEN whatsapp_clicked = true THEN 1 END)::DECIMAL / COUNT(*) * 100), 2
    ) as tasa_whatsapp_porcentaje
    
FROM leads 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- ============================
-- 3. INGRESOS - VALIDACIÓN (REVENUE)
-- ============================

-- Tabla para almacenar respuestas de validación de precio
CREATE TABLE IF NOT EXISTS revenue_validation (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    lead_id BIGINT REFERENCES leads(id),
    
    -- Pregunta: "¿Cuánto estarías dispuesto a pagar por este servicio?"
    pricing_model TEXT, -- 'percentage', 'fixed_fee', 'monthly_subscription'
    percentage_willing NUMERIC, -- Si eligió porcentaje del ahorro
    fixed_amount_willing NUMERIC, -- Si eligió tarifa fija
    monthly_amount_willing NUMERIC, -- Si eligió suscripción mensual
    
    -- Contexto adicional
    estimated_savings NUMERIC, -- Ahorro estimado mostrado
    user_agent TEXT
);

-- Habilitar RLS para revenue_validation
ALTER TABLE revenue_validation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON revenue_validation
    FOR INSERT TO anon
    WITH CHECK (true);

-- Vista para análisis de validación de ingresos
CREATE OR REPLACE VIEW revenue_validation_metrics AS
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as total_respuestas,
    
    -- Modelos de precio preferidos
    COUNT(CASE WHEN pricing_model = 'percentage' THEN 1 END) as prefiere_porcentaje,
    COUNT(CASE WHEN pricing_model = 'fixed_fee' THEN 1 END) as prefiere_tarifa_fija,
    COUNT(CASE WHEN pricing_model = 'monthly_subscription' THEN 1 END) as prefiere_suscripcion,
    
    -- Promedios de disposición de pago
    AVG(percentage_willing) as promedio_porcentaje_dispuesto,
    AVG(fixed_amount_willing) as promedio_tarifa_fija_dispuesta,
    AVG(monthly_amount_willing) as promedio_mensual_dispuesto,
    
    -- Rangos de porcentaje
    COUNT(CASE WHEN percentage_willing <= 10 THEN 1 END) as porcentaje_0_10,
    COUNT(CASE WHEN percentage_willing > 10 AND percentage_willing <= 20 THEN 1 END) as porcentaje_10_20,
    COUNT(CASE WHEN percentage_willing > 20 AND percentage_willing <= 30 THEN 1 END) as porcentaje_20_30,
    COUNT(CASE WHEN percentage_willing > 30 THEN 1 END) as porcentaje_30_plus
    
FROM revenue_validation
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- ============================
-- 4. QUERIES PARA CUADRO DE MANDO PRINCIPAL
-- ============================

-- Dashboard principal con métricas clave
CREATE OR REPLACE VIEW matonia_dashboard AS
SELECT 
    fecha,
    visitantes_unicos,
    leads_generados,
    tasa_conversion_porcentaje,
    leads_whatsapp_click,
    tasa_whatsapp_porcentaje,
    tiempo_promedio_pagina,
    scroll_promedio,
    
    -- Cálculo de eficiencia del funnel
    ROUND(
        (leads_whatsapp_click::DECIMAL / visitantes_unicos * 100), 2
    ) as conversion_visitante_a_whatsapp
    
FROM acquisition_metrics am
LEFT JOIN activation_conversion ac ON am.fecha = ac.fecha  
LEFT JOIN activation_completion acomp ON am.fecha = acomp.fecha
ORDER BY fecha DESC;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_page_visits_date ON page_visits(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_events_date ON events(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_revenue_validation_date ON revenue_validation(DATE(created_at));