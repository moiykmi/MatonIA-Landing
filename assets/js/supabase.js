// Supabase client configuration
// Obtener credenciales de configuración local o variables de entorno
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || 'https://konmsfgdpvhylthiauyj.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.key || 'placeholder-key-regenerate-in-supabase';

// Simple Supabase client (sin dependencias)
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async request(table, method = 'POST', data = {}) {
        try {
            const response = await fetch(`${this.url}/rest/v1/${table}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Si la respuesta está vacía (return=minimal), devolver success
            const text = await response.text();
            if (!text) {
                return { success: true };
            }
            
            try {
                return JSON.parse(text);
            } catch (e) {
                return { success: true, raw: text };
            }
        } catch (error) {
            console.error('Supabase request failed:', error);
            return null;
        }
    }

    // Registrar visita a la página
    async trackPageVisit(data = {}) {
        const visitData = {
            session_id: this.sessionId,
            page_url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            device_type: this.detectDeviceType(),
            utm_source: this.getUrlParameter('utm_source'),
            utm_medium: this.getUrlParameter('utm_medium'),
            utm_campaign: this.getUrlParameter('utm_campaign'),
            ...data
        };

        return await this.request('page_visits', 'POST', visitData);
    }

    // Registrar lead
    async submitLead(leadData) {
        const data = {
            session_id: this.sessionId,
            user_agent: navigator.userAgent,
            utm_source: this.getUrlParameter('utm_source'),
            utm_medium: this.getUrlParameter('utm_medium'),
            utm_campaign: this.getUrlParameter('utm_campaign'),
            ...leadData
        };

        return await this.request('leads', 'POST', data);
    }

    // Registrar evento
    async trackEvent(eventType, elementId = null, elementClass = null) {
        const eventData = {
            session_id: this.sessionId,
            event_type: eventType,
            element_id: elementId,
            element_class: elementClass,
            page_url: window.location.href,
            user_agent: navigator.userAgent
        };

        return await this.request('events', 'POST', eventData);
    }

    // Actualizar lead cuando hace click en WhatsApp
    async trackWhatsAppClick(leadId = null) {
        if (leadId) {
            // Si tenemos el ID del lead, actualizarlo
            return await this.request(`leads?id=eq.${leadId}`, 'PATCH', {
                whatsapp_clicked: true,
                whatsapp_clicked_at: new Date().toISOString()
            });
        } else {
            // Si no, crear evento
            return await this.trackEvent('whatsapp_click', 'whatsapp-button');
        }
    }

    // Utilidades
    detectDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Obtener información de geolocalización (opcional)
    async getLocationInfo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                country: data.country_name,
                city: data.city,
                ip_address: data.ip
            };
        } catch (error) {
            console.error('Error getting location:', error);
            return {};
        }
    }
}

// Instancia global
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auto-tracking cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
    // Track page visit
    const locationInfo = await supabase.getLocationInfo();
    await supabase.trackPageVisit(locationInfo);

    // Track scroll depth
    let maxScroll = 0;
    let scrollTimer;

    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        maxScroll = Math.max(maxScroll, scrollPercent);

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(async () => {
            const eventData = {
                session_id: supabase.sessionId,
                event_type: 'scroll',
                element_id: null,
                element_class: null,
                page_url: window.location.href,
                user_agent: navigator.userAgent,
                scroll_depth: maxScroll
            };
            await supabase.request('events', 'POST', eventData);
        }, 1000);
    });

    // Track time on page when user leaves
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.round((Date.now() - performance.timing.navigationStart) / 1000);
        navigator.sendBeacon(`${SUPABASE_URL}/rest/v1/page_visits`, JSON.stringify({
            session_id: supabase.sessionId,
            time_on_page: timeOnPage
        }));
    });
});

// Exportar para uso global
window.supabase = supabase;