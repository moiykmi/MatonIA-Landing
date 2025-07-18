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