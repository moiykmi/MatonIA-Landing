// Global config object
let config = null;

// Load configuration from config.json
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error('Config file not found');
        }
        config = await response.json();
        return config;
    } catch (error) {
        console.error('Error loading config:', error);
        // Fallback configuration
        config = {
            whatsapp: {
                phoneNumber: "56934812424",
                message: "¡Hola! Estoy interesado en que MatonIA negocie mis cuentas (telefonía, internet, seguros, streaming, etc.). Me gustaría saber más sobre el servicio y cómo pueden ayudarme a ahorrar dinero."
            },
            analytics: {
                googleAnalyticsId: "GA_MEASUREMENT_ID",
                facebookPixelId: "FB_PIXEL_ID"
            },
            site: {
                title: "MatonIA - Ahorra en tus cuentas",
                description: "Deja que un experto negocie tus cuentas por ti y ahorra dinero.",
                url: "https://matonia.com"
            }
        };
        return config;
    }
}

// WhatsApp integration function with loading state
async function openWhatsApp() {
    const button = document.querySelector('.cta-button');
    
    try {
        // Show loading state
        if (button) {
            button.classList.add('loading');
            const loader = button.querySelector('.button-loader');
            if (loader) loader.classList.remove('hidden');
        }
        
        // Ensure config is loaded
        if (!config) {
            await loadConfig();
        }
        
        const phoneNumber = config.whatsapp.phoneNumber;
        const message = encodeURIComponent(config.whatsapp.message);
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
        
        // Check if device supports WhatsApp
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Add delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (isMobile) {
            window.location.href = whatsappURL;
        } else {
            window.open(whatsappURL, '_blank');
        }
        
        // Track the conversion
        trackConversion();
        
    } catch (error) {
        console.error('Error opening WhatsApp:', error);
        copyPhoneNumber();
    } finally {
        // Remove loading state
        if (button) {
            setTimeout(() => {
                button.classList.remove('loading');
                const loader = button.querySelector('.button-loader');
                if (loader) loader.classList.add('hidden');
            }, 1000);
        }
    }
}

// Function to track conversions
function trackConversion() {
    console.log('User clicked CTA button - conversion tracked');
    
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'
        });
    }
    
    // Facebook Pixel tracking
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead');
    }
}

// Enhanced interactive animations and performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initAnimations();
    initButtonEffects();
    initCounters();
    initExitIntent();
    initLazyLoading();
    initLeadForm();
    
    // Update urgency counter immediately and every hour
    updateUrgencyCounter();
    setInterval(updateUrgencyCounter, 3600000);
});

// Initialize scroll animations
function initAnimations() {
    const elements = document.querySelectorAll('.benefit, .step, .testimonial, .stat');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Apply initial styles and observe elements with staggered animation
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
        observer.observe(element);
    });
    
    // Stats animation
    initStatsAnimation();
}

// Initialize button effects
function initButtonEffects() {
    const ctaButton = document.querySelector('.cta-button');
    const whatsappFloat = document.querySelector('.whatsapp-float');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(event) {
            createRipple(this, event);
        });
    }
    
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', function() {
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
}

// Create ripple effect
function createRipple(element, event) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Initialize stats animation
function initStatsAnimation() {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatNumbers();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) statsObserver.observe(statsBar);
}

// Animate stat numbers
function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
        const text = stat.textContent;
        const number = parseInt(text.replace(/[^\d]/g, ''));
        
        if (number && number > 0) {
            setTimeout(() => {
                let current = 0;
                const duration = 2000;
                const steps = 60;
                const increment = number / steps;
                const stepTime = duration / steps;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        stat.textContent = text;
                        clearInterval(timer);
                    } else {
                        if (text.includes('$')) {
                            stat.textContent = `$${Math.floor(current)}${text.includes('M') ? 'M' : ''}+`;
                        } else if (text.includes('⭐')) {
                            stat.textContent = `${(current / 100).toFixed(1)}⭐`;
                        } else if (text.includes('h')) {
                            stat.textContent = `${Math.floor(current)}h`;
                        } else {
                            stat.textContent = `${Math.floor(current)}+`;
                        }
                    }
                }, stepTime);
            }, index * 200);
        }
    });
}

// Initialize counters
function initCounters() {
    updateVisitorCounter();
}

// Dynamic urgency counter
function updateUrgencyCounter() {
    const urgencyTimer = document.getElementById('urgency-timer');
    if (urgencyTimer) {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const timeLeft = endOfMonth - now;
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        urgencyTimer.textContent = `${days}d ${hours}h restantes`;
    }
}

// Real-time visitor counter
function updateVisitorCounter() {
    const counters = document.querySelectorAll('.visitor-count');
    if (counters.length === 0) return;
    
    const baseCount = 147;
    const variation = Math.floor(Math.random() * 20) - 10;
    let currentCount = baseCount + variation;
    
    counters.forEach(counter => {
        counter.textContent = currentCount;
    });
    
    setInterval(() => {
        const newVariation = Math.floor(Math.random() * 6) - 3;
        currentCount = Math.max(130, currentCount + newVariation);
        counters.forEach(counter => {
            counter.textContent = currentCount;
        });
    }, 30000);
}

// Exit intent detection
function initExitIntent() {
    let hasShownPopup = false;
    
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !hasShownPopup && window.innerWidth > 768) {
            showExitIntentPopup();
            hasShownPopup = true;
        }
    });
}

// Exit intent popup
function showExitIntentPopup() {
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div class="exit-popup-overlay">
            <div class="exit-popup">
                <button class="exit-popup-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <h3>¡Espera! 🚀</h3>
                <p>Antes de irte, ¿sabías que nuestros clientes ahorran en promedio <strong>$40.000 mensuales</strong>?</p>
                <button class="exit-popup-cta" onclick="openWhatsApp(); this.parentElement.parentElement.remove();">¡Quiero ahorrar dinero!</button>
                <p class="exit-popup-guarantee">Sin compromiso - Solo pagas si ahorramos</p>
            </div>
        </div>
    `;
    
    addExitPopupStyles();
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentElement) popup.remove();
    }, 10000);
}

// Add exit popup styles
function addExitPopupStyles() {
    if (document.querySelector('#exit-popup-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'exit-popup-styles';
    style.textContent = `
        .exit-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .exit-popup {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            position: relative;
            animation: slideIn 0.3s ease;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .exit-popup-close {
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
        }
        
        .exit-popup h3 {
            font-family: 'Poppins', sans-serif;
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .exit-popup p {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .exit-popup-cta {
            background: linear-gradient(45deg, #25D366, #128C7E);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1.1rem;
            margin-bottom: 10px;
            transition: transform 0.3s ease;
        }
        
        .exit-popup-cta:hover {
            transform: translateY(-2px);
        }
        
        .exit-popup-guarantee {
            font-size: 0.85rem;
            color: #999;
            font-style: italic;
            margin: 0;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Fallback function to copy phone number
async function copyPhoneNumber() {
    if (!config) await loadConfig();
    
    const phoneNumber = `+${config.whatsapp.phoneNumber}`;
    
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(phoneNumber);
            alert(`Número copiado al portapapeles: ${phoneNumber}\nContáctanos por WhatsApp`);
        } catch {
            showPhoneNumber();
        }
    } else {
        showPhoneNumber();
    }
}

// Show phone number in alert
async function showPhoneNumber() {
    if (!config) await loadConfig();
    
    const phoneNumber = `+${config.whatsapp.phoneNumber}`;
    alert(`Contáctanos por WhatsApp al: ${phoneNumber}`);
}

// Lead form functionality
function initLeadForm() {
    const leadForm = document.getElementById('leadCaptureForm');
    if (!leadForm) return;
    
    leadForm.addEventListener('submit', handleLeadSubmission);
}

// Handle lead form submission
async function handleLeadSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.lead-submit-btn');
    const buttonText = submitBtn.querySelector('.button-text');
    const buttonLoader = submitBtn.querySelector('.button-loader');
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.classList.remove('hidden');
        
        // Collect form data
        const formData = new FormData(form);
        const leadData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            current_provider: formData.get('current_provider'),
            monthly_bill: parseFloat(formData.get('monthly_bill')) || null,
            services: formData.getAll('services')
        };
        
        // Submit to Supabase if available
        let leadId = null;
        if (window.supabase) {
            const result = await window.supabase.submitLead(leadData);
            if (result && result.length > 0) {
                leadId = result[0].id;
            }
        }
        
        // Calculate estimated savings
        const estimatedSavings = calculateSavings(leadData.monthly_bill, leadData.services);
        
        // Show success state
        showSuccessMessage(estimatedSavings);
        
        // Track form completion
        trackFormCompletion(leadData);
        
        // Store lead ID for WhatsApp tracking
        if (leadId) {
            window.currentLeadId = leadId;
        }
        
    } catch (error) {
        console.error('Error submitting lead:', error);
        alert('Hubo un error al enviar tus datos. Por favor intenta nuevamente.');
        
        // Reset button state
        submitBtn.disabled = false;
        buttonText.style.opacity = '1';
        buttonLoader.classList.add('hidden');
    }
}

// Calculate estimated savings based on bill and services
function calculateSavings(monthlyBill, services) {
    if (!monthlyBill || monthlyBill === 0) {
        return 25000; // Default estimate
    }
    
    let savingsPercentage = 0.25; // Base 25% savings
    
    // Increase savings based on number of services
    if (services.length >= 3) {
        savingsPercentage = 0.4; // 40% for multiple services
    } else if (services.length >= 2) {
        savingsPercentage = 0.35; // 35% for two services
    } else if (services.length >= 1) {
        savingsPercentage = 0.3; // 30% for one service
    }
    
    return Math.floor(monthlyBill * savingsPercentage);
}

// Show success message and hide form
function showSuccessMessage(estimatedSavings) {
    const leadFormSection = document.getElementById('leadForm');
    const ctaSection = document.getElementById('ctaSection');
    const estimatedSavingsElement = document.getElementById('estimatedSavings');
    
    if (leadFormSection && ctaSection) {
        leadFormSection.classList.add('hidden');
        ctaSection.classList.remove('hidden');
        
        if (estimatedSavingsElement) {
            estimatedSavingsElement.textContent = estimatedSavings.toLocaleString('es-CL');
        }
    }
}

// Enhanced WhatsApp function for leads
async function openWhatsAppWithLead() {
    const leadId = window.currentLeadId;
    
    // Track WhatsApp click in Supabase
    if (window.supabase && leadId) {
        await window.supabase.trackWhatsAppClick(leadId);
    }
    
    // Mostrar validación de ingresos antes de abrir WhatsApp
    showRevenueValidationPopup(leadId);
}

// Popup de validación de ingresos
function showRevenueValidationPopup(leadId) {
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div class="revenue-popup-overlay">
            <div class="revenue-popup">
                <h3>🎯 Una última pregunta</h3>
                <p>Para mejorar nuestro servicio, ¿cuánto estarías dispuesto a pagar por que negociemos tus cuentas?</p>
                
                <div class="pricing-options">
                    <label class="pricing-option">
                        <input type="radio" name="pricing_model" value="percentage">
                        <span>Un porcentaje del ahorro conseguido</span>
                        <div class="percentage-input" style="display: none;">
                            <input type="number" id="percentage_willing" placeholder="%" min="5" max="50" value="20">
                            <span>% del ahorro</span>
                        </div>
                    </label>
                    
                    <label class="pricing-option">
                        <input type="radio" name="pricing_model" value="fixed_fee">
                        <span>Una tarifa fija por servicio</span>
                        <div class="fixed-input" style="display: none;">
                            <input type="number" id="fixed_amount_willing" placeholder="$" min="5000" max="50000" value="15000">
                            <span>pesos por servicio</span>
                        </div>
                    </label>
                    
                    <label class="pricing-option">
                        <input type="radio" name="pricing_model" value="monthly_subscription">
                        <span>Una suscripción mensual</span>
                        <div class="monthly-input" style="display: none;">
                            <input type="number" id="monthly_amount_willing" placeholder="$" min="2000" max="20000" value="5000">
                            <span>pesos mensuales</span>
                        </div>
                    </label>
                </div>
                
                <div class="revenue-popup-buttons">
                    <button class="revenue-continue-btn" onclick="submitRevenueValidation(${leadId})">
                        Continuar a WhatsApp
                    </button>
                    <button class="revenue-skip-btn" onclick="skipRevenueValidation(${leadId})">
                        Saltar pregunta
                    </button>
                </div>
            </div>
        </div>
    `;
    
    addRevenuePopupStyles();
    document.body.appendChild(popup);
    
    // Manejar cambios en radio buttons
    const radios = popup.querySelectorAll('input[name="pricing_model"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Ocultar todos los inputs
            popup.querySelectorAll('.percentage-input, .fixed-input, .monthly-input').forEach(div => {
                div.style.display = 'none';
            });
            
            // Mostrar el input correspondiente
            if (this.value === 'percentage') {
                popup.querySelector('.percentage-input').style.display = 'flex';
            } else if (this.value === 'fixed_fee') {
                popup.querySelector('.fixed-input').style.display = 'flex';
            } else if (this.value === 'monthly_subscription') {
                popup.querySelector('.monthly-input').style.display = 'flex';
            }
        });
    });
    
    // Seleccionar porcentaje por defecto
    popup.querySelector('input[value="percentage"]').checked = true;
    popup.querySelector('.percentage-input').style.display = 'flex';
}

// Enviar validación de ingresos
async function submitRevenueValidation(leadId) {
    const popup = document.querySelector('.revenue-popup-overlay');
    const selectedModel = popup.querySelector('input[name="pricing_model"]:checked').value;
    
    const validationData = {
        lead_id: leadId,
        pricing_model: selectedModel,
        estimated_savings: document.getElementById('estimatedSavings')?.textContent?.replace(/[^\d]/g, '') || 0
    };
    
    // Capturar el valor según el modelo seleccionado
    if (selectedModel === 'percentage') {
        validationData.percentage_willing = parseFloat(popup.querySelector('#percentage_willing').value) || 20;
    } else if (selectedModel === 'fixed_fee') {
        validationData.fixed_amount_willing = parseFloat(popup.querySelector('#fixed_amount_willing').value) || 15000;
    } else if (selectedModel === 'monthly_subscription') {
        validationData.monthly_amount_willing = parseFloat(popup.querySelector('#monthly_amount_willing').value) || 5000;
    }
    
    // Enviar a Supabase
    if (window.supabase) {
        await window.supabase.request('revenue_validation', 'POST', validationData);
    }
    
    // Cerrar popup y continuar a WhatsApp
    popup.remove();
    await openWhatsApp();
}

// Saltar validación de ingresos
async function skipRevenueValidation(leadId) {
    const popup = document.querySelector('.revenue-popup-overlay');
    popup.remove();
    await openWhatsApp();
}

// Estilos para el popup de validación
function addRevenuePopupStyles() {
    if (document.querySelector('#revenue-popup-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'revenue-popup-styles';
    style.textContent = `
        .revenue-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .revenue-popup {
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            margin: 20px;
            animation: slideIn 0.3s ease;
        }
        
        .revenue-popup h3 {
            font-family: 'Poppins', sans-serif;
            color: #2c3e50;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .revenue-popup p {
            color: #666;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .pricing-options {
            margin-bottom: 25px;
        }
        
        .pricing-option {
            display: block;
            margin-bottom: 15px;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .pricing-option:hover {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.05);
        }
        
        .pricing-option input[type="radio"] {
            margin-right: 10px;
        }
        
        .percentage-input,
        .fixed-input,
        .monthly-input {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .percentage-input input,
        .fixed-input input,
        .monthly-input input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        .revenue-popup-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .revenue-continue-btn {
            background: linear-gradient(45deg, #25D366, #128C7E);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .revenue-continue-btn:hover {
            transform: translateY(-2px);
        }
        
        .revenue-skip-btn {
            background: #f8f9fa;
            color: #666;
            border: 1px solid #ddd;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .revenue-skip-btn:hover {
            background: #e9ecef;
        }
        
        @media (max-width: 768px) {
            .revenue-popup {
                padding: 20px;
            }
            
            .revenue-popup-buttons {
                flex-direction: column;
            }
            
            .revenue-continue-btn,
            .revenue-skip-btn {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Track form completion
function trackFormCompletion(leadData) {
    console.log('Lead form completed:', leadData);
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'lead_generation', {
            event_category: 'engagement',
            event_label: 'lead_form_completion',
            value: 1
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Lead Form',
            content_category: 'form_submission'
        });
    }
    
    // Supabase event tracking
    if (window.supabase) {
        window.supabase.trackEvent('lead_form_submit', 'leadCaptureForm', 'lead-form');
    }
}