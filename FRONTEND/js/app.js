/* ========================================
   app.js - Shared utilities, home page,
   booking confirmation & contact page logic
   ======================================== */

const API_BASE = window.location.port === '8080' ? '/api' : 'http://localhost:8080/api';

// ── Shared Utilities ──────────────────────

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('transitionend', () => toast.remove());
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function showSpinner(container) {
    if (!container) return;
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'flex';
}

function hideSpinner(container) {
    if (!container) return;
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'none';
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '\u20AC' + num.toFixed(2);
}

// ── Category colors for car placeholders ──
function getCategoryColor(category) {
    const colors = {
        ECONOMY: '#4CAF50',
        COMFORT: '#2196F3',
        SUV: '#FF9800',
        PREMIUM: '#9C27B0',
        VAN: '#795548'
    };
    return colors[(category || '').toUpperCase()] || '#607D8B';
}

function getCarGradient(category) {
    const gradients = {
        ECONOMY: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        COMFORT: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        SUV: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        PREMIUM: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        VAN: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[(category || '').toUpperCase()] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
}

function getCarSVG(category) {
    const cat = (category || '').toUpperCase();
    if (cat === 'SUV') {
        return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%;opacity:0.25"><path d="M20 55h160M30 55l10-25h40l15-15h50l20 15h10l5 25" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="55" cy="55" r="12" stroke="#fff" stroke-width="3"/><circle cx="150" cy="55" r="12" stroke="#fff" stroke-width="3"/><path d="M80 30h35v10H80z" stroke="#fff" stroke-width="2" rx="2"/><path d="M120 25h25v15h-25z" stroke="#fff" stroke-width="2" rx="2"/></svg>`;
    }
    if (cat === 'VAN') {
        return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%;opacity:0.25"><path d="M20 60h160M25 60V25h100v35M125 25l30 15v20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="55" cy="60" r="11" stroke="#fff" stroke-width="3"/><circle cx="140" cy="60" r="11" stroke="#fff" stroke-width="3"/><path d="M45 25v-0h30v15H45z" stroke="#fff" stroke-width="2" rx="2"/><path d="M130 32h18v10h-18z" stroke="#fff" stroke-width="2" rx="2"/></svg>`;
    }
    if (cat === 'PREMIUM') {
        return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%;opacity:0.25"><path d="M15 55h170M25 55l8-20h35l12-15h55l25 15h10l5 20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="52" cy="55" r="11" stroke="#fff" stroke-width="3"/><circle cx="152" cy="55" r="11" stroke="#fff" stroke-width="3"/><path d="M72 35h50v10H72z" stroke="#fff" stroke-width="2" rx="2"/><path d="M128 25h30v15h-30z" stroke="#fff" stroke-width="2" rx="2"/></svg>`;
    }
    return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%;opacity:0.25"><path d="M20 55h160M35 55l10-20h30l15-15h45l20 15h15l5 20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="58" cy="55" r="11" stroke="#fff" stroke-width="3"/><circle cx="148" cy="55" r="11" stroke="#fff" stroke-width="3"/><path d="M78 35h40v10H78z" stroke="#fff" stroke-width="2" rx="2"/><path d="M125 25h30v15h-30z" stroke="#fff" stroke-width="2" rx="2"/></svg>`;
}

// ── Mobile nav toggle ─────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // ── Route to page-specific logic ──
    if (document.getElementById('featured-cars')) {
        initHomePage();
    }
    if (document.getElementById('booking-ticket')) {
        initBookingConfirmation();
    }
    if (document.getElementById('contact-form')) {
        initContactPage();
    }
});

// ── Home Page ─────────────────────────────

async function initHomePage() {
    const section = document.getElementById('featured-cars');
    const grid = section.querySelector('.car-grid');
    showSpinner(section);

    try {
        const res = await fetch(`${API_BASE}/cars`);
        if (!res.ok) throw new Error('Failed to load cars');
        const cars = await res.json();
        const featured = cars.slice(0, 6);

        grid.innerHTML = featured.map(car => {
            const cat = (car.category || '').toUpperCase();
            return `
            <div class="car-card">
                <div class="car-image-placeholder" style="background:${getCarGradient(cat)}">
                    ${getCarSVG(cat)}
                    <span class="car-category-label">${cat || 'Car'}</span>
                </div>
                <div class="car-card-body">
                    <h3 class="car-card-title">${car.brand} ${car.model}</h3>
                    <p class="car-card-price">${formatCurrency(car.pricePerDay)} <span class="price-period">/ day</span></p>
                    <div class="car-card-specs">
                        <span>${car.fuelType || '—'}</span>
                        <span>${car.transmission || '—'}</span>
                        <span>${car.seats || '—'} seats</span>
                    </div>
                    <a href="car-detail.html?id=${car.id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
            </div>
            `;
        }).join('');
    } catch (err) {
        grid.innerHTML = '<p class="text-muted">Could not load featured cars. Please try again later.</p>';
        showToast(err.message, 'error');
    } finally {
        hideSpinner(section);
    }
}

// ── Booking Confirmation ──────────────────

async function initBookingConfirmation() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const ticket = document.getElementById('booking-ticket');

    if (!token) {
        ticket.innerHTML = '<p class="text-muted">No reservation token provided.</p>';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/bookings/${token}`);
        if (!res.ok) throw new Error('Reservation not found');
        const booking = await res.json();

        const setField = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setField('confirm-token', booking.reservationToken || token);
        setField('confirm-car', `${booking.carBrand || ''} ${booking.carModel || ''}`);
        setField('confirm-pickup-date', formatDate(booking.pickupDate));
        setField('confirm-return-date', formatDate(booking.returnDate));
        setField('confirm-pickup-location', booking.pickupLocation || '—');
        setField('confirm-return-location', booking.returnLocation || '—');
        setField('confirm-price', formatCurrency(booking.totalPrice));
        setField('confirm-customer-name', booking.customerName || '—');
        setField('confirm-customer-email', booking.customerEmail || '—');
        setField('confirm-customer-phone', booking.customerPhone || '—');
        setField('confirm-timestamp', formatDate(booking.createdAt || booking.bookingDate));

        const downloadBtn = document.getElementById('download-ticket-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => window.print());
        }
    } catch (err) {
        ticket.innerHTML = `<div class="error-message"><h2>Reservation Not Found</h2><p>The reservation token "${token}" is invalid or has expired.</p><a href="check-reservation.html" class="btn btn-primary">Check Another Reservation</a></div>`;
        showToast(err.message, 'error');
    }
}

// ── Contact Page ──────────────────────────

function initContactPage() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name    = form.querySelector('[name="name"]')?.value?.trim();
            const email   = form.querySelector('[name="email"]')?.value?.trim();
            const subject = form.querySelector('#contact-subject')?.value?.trim();
            const message = form.querySelector('[name="message"]')?.value?.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });

                if (!res.ok) throw new Error('Failed to send message');

                showToast("Message sent! We'll get back to you soon.", 'success');
                form.reset();
            } catch (err) {
                showToast('Could not send message. Please try again.', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const parentItem = question.closest('.faq-item');
            const wasActive = parentItem.classList.contains('active');

            // Collapse all
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Toggle clicked one
            if (!wasActive) {
                parentItem.classList.add('active');
            }
        });
    });
}
