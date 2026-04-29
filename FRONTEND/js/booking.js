/* ========================================
   booking.js — Car detail page and booking
   form with validation and price calculation
   ======================================== */

const API_BASE = window.location.port === '8080' ? '/api' : 'http://localhost:8080/api';

let currentCar = null;

// ── Utility functions ──

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

function formatCurrency(amount) {
    return '\u20AC' + (parseFloat(amount) || 0).toFixed(2);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getCategoryColor(category) {
    const colors = { ECONOMY: '#4CAF50', COMFORT: '#2196F3', SUV: '#FF9800', PREMIUM: '#9C27B0', VAN: '#795548' };
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
        return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:60%;opacity:0.25"><path d="M20 55h160M30 55l10-25h40l15-15h50l20 15h10l5 25" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="55" cy="55" r="12" stroke="#fff" stroke-width="3"/><circle cx="150" cy="55" r="12" stroke="#fff" stroke-width="3"/></svg>`;
    }
    if (cat === 'VAN') {
        return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:60%;opacity:0.25"><path d="M20 60h160M25 60V25h100v35M125 25l30 15v20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="55" cy="60" r="11" stroke="#fff" stroke-width="3"/><circle cx="140" cy="60" r="11" stroke="#fff" stroke-width="3"/></svg>`;
    }
    if (cat === 'PREMIUM') {
        return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:60%;opacity:0.25"><path d="M15 55h170M25 55l8-20h35l12-15h55l25 15h10l5 20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="52" cy="55" r="11" stroke="#fff" stroke-width="3"/><circle cx="152" cy="55" r="11" stroke="#fff" stroke-width="3"/></svg>`;
    }
    return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:60%;opacity:0.25"><path d="M20 55h160M35 55l10-20h30l15-15h45l20 15h15l5 20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="58" cy="55" r="11" stroke="#fff" stroke-width="3"/><circle cx="148" cy="55" r="11" stroke="#fff" stroke-width="3"/></svg>`;
}

// ── DOM Ready ──

document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    const params = new URLSearchParams(window.location.search);
    const carId = params.get('id');
    if (!carId) {
        document.querySelector('.car-detail-page .container').innerHTML =
            '<p class="text-muted">No car selected. <a href="cars.html">Browse cars</a></p>';
        return;
    }

    // Set min date for pickup to today
    const today = new Date().toISOString().split('T')[0];
    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    if (pickupDate) pickupDate.min = today;
    if (returnDate) returnDate.min = today;

    loadCarDetail(carId);
    loadAvailability(carId);
    setupFormListeners();
});

// ── Load car details ──

async function loadCarDetail(carId) {
    try {
        const res = await fetch(`${API_BASE}/cars/${carId}`);
        if (!res.ok) throw new Error('Car not found');
        currentCar = await res.json();

        document.getElementById('car-title').textContent = `${currentCar.brand} ${currentCar.model}`;
        document.getElementById('car-category').textContent = currentCar.category || '—';
        document.getElementById('car-price').textContent = formatCurrency(currentCar.pricePerDay);

        // Set image placeholder with gradient and SVG
        const imgContainer = document.getElementById('car-image');
        if (imgContainer) {
            imgContainer.style.background = getCarGradient(currentCar.category);
            const imgEl = document.getElementById('car-image-img');
            if (imgEl) imgEl.style.display = 'none';
            imgContainer.innerHTML += getCarSVG(currentCar.category);
            const label = document.createElement('span');
            label.className = 'car-category-label';
            label.textContent = (currentCar.category || 'Car').toUpperCase();
            imgContainer.appendChild(label);
        }

        // Populate specs table
        const setSpec = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val || '—';
        };
        setSpec('spec-brand', currentCar.brand);
        setSpec('spec-model', currentCar.model);
        setSpec('spec-year', currentCar.year);
        setSpec('spec-transmission', currentCar.transmission);
        setSpec('spec-fuel', currentCar.fuelType);
        setSpec('spec-seats', currentCar.seats);
        setSpec('spec-doors', currentCar.doors);
        setSpec('spec-ac', currentCar.hasAC ? 'Yes' : 'No');

        // Update page title
        document.title = `${currentCar.brand} ${currentCar.model} — QuickCarRental`;

    } catch (err) {
        document.querySelector('.car-detail-page .container').innerHTML =
            `<p class="text-muted">Car not found. <a href="cars.html">Browse cars</a></p>`;
        showToast(err.message, 'error');
    }
}

// ── Load availability ──

async function loadAvailability(carId) {
    const container = document.getElementById('availability-calendar');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/cars/${carId}/availability`);
        if (!res.ok) throw new Error('Could not load availability');
        const blocked = await res.json();

        if (!blocked || blocked.length === 0) {
            container.innerHTML = '<p class="text-success">This car is fully available for booking.</p>';
        } else {
            const items = blocked.map(range =>
                `<li class="blocked-date">${formatDate(range.startDate || range.pickupDate)} — ${formatDate(range.endDate || range.returnDate)}</li>`
            ).join('');
            container.innerHTML = `<p>The following dates are unavailable:</p><ul class="blocked-dates-list">${items}</ul>`;
        }
    } catch (err) {
        container.innerHTML = '<p class="text-muted">Could not load availability data.</p>';
    }
}

// ── Form listeners for dynamic cost calculation ──

function setupFormListeners() {
    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    const extras = document.querySelectorAll('input[name="extras"]');
    const returnLocation = document.getElementById('return-location');
    const form = document.getElementById('booking-form');

    // Recalculate on date/extras change
    [pickupDate, returnDate].forEach(el => {
        if (el) el.addEventListener('change', updateCostSummary);
    });
    extras.forEach(cb => cb.addEventListener('change', updateCostSummary));

    // Pickup date change: update return date min
    if (pickupDate) {
        pickupDate.addEventListener('change', () => {
            if (returnDate && pickupDate.value) {
                returnDate.min = pickupDate.value;
                if (returnDate.value && returnDate.value <= pickupDate.value) {
                    returnDate.value = '';
                }
            }
        });
    }

    // "Same as pickup" logic for return location
    if (returnLocation) {
        returnLocation.addEventListener('change', () => {
            if (returnLocation.value === 'SAME_AS_PICKUP') {
                const pickupLoc = document.getElementById('pickup-location');
                if (pickupLoc && pickupLoc.value) {
                    returnLocation.value = pickupLoc.value;
                }
            }
        });
    }

    // Form submit
    if (form) {
        form.addEventListener('submit', handleBookingSubmit);
    }
}

// ── Cost calculation ──

function updateCostSummary() {
    if (!currentCar) return;

    const pickupVal = document.getElementById('pickup-date')?.value;
    const returnVal = document.getElementById('return-date')?.value;

    const daysEl = document.getElementById('cost-days');
    const baseEl = document.getElementById('cost-base');
    const extrasListEl = document.getElementById('cost-extras-list');
    const totalEl = document.getElementById('cost-total');

    if (!pickupVal || !returnVal) {
        if (daysEl) daysEl.textContent = '0';
        if (baseEl) baseEl.textContent = formatCurrency(0);
        if (extrasListEl) extrasListEl.innerHTML = '';
        if (totalEl) totalEl.textContent = formatCurrency(0);
        return;
    }

    const pickup = new Date(pickupVal);
    const ret = new Date(returnVal);
    const days = Math.ceil((ret - pickup) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
        if (daysEl) daysEl.textContent = '0';
        if (baseEl) baseEl.textContent = formatCurrency(0);
        if (extrasListEl) extrasListEl.innerHTML = '';
        if (totalEl) totalEl.textContent = formatCurrency(0);
        return;
    }

    const baseCost = days * (parseFloat(currentCar.pricePerDay) || 0);
    if (daysEl) daysEl.textContent = days;
    if (baseEl) baseEl.textContent = formatCurrency(baseCost);

    // Calculate extras
    let extrasTotal = 0;
    let extrasHTML = '';
    document.querySelectorAll('input[name="extras"]:checked').forEach(cb => {
        const pricePerUnit = parseFloat(cb.dataset.price) || 0;
        const isFlat = cb.dataset.flat === 'true';
        const cost = isFlat ? pricePerUnit : pricePerUnit * days;
        const label = cb.parentElement.textContent.trim().split('(')[0].trim();
        extrasTotal += cost;
        extrasHTML += `<div class="cost-line cost-extra"><span>${label}</span><span>${formatCurrency(cost)}</span></div>`;
    });

    if (extrasListEl) extrasListEl.innerHTML = extrasHTML;
    if (totalEl) totalEl.textContent = formatCurrency(baseCost + extrasTotal);
}

// ── Form validation ──

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    field.parentElement.appendChild(errorEl);
}

function validateForm() {
    clearErrors();
    let valid = true;

    const name = document.getElementById('customer-name');
    if (!name?.value?.trim()) {
        showFieldError('customer-name', 'Full name is required');
        valid = false;
    }

    const email = document.getElementById('customer-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.value?.trim()) {
        showFieldError('customer-email', 'Email is required');
        valid = false;
    } else if (!emailRegex.test(email.value)) {
        showFieldError('customer-email', 'Enter a valid email address');
        valid = false;
    }

    const phone = document.getElementById('customer-phone');
    const phoneDigits = (phone?.value || '').replace(/\D/g, '');
    if (!phone?.value?.trim()) {
        showFieldError('customer-phone', 'Phone number is required');
        valid = false;
    } else if (phoneDigits.length < 7) {
        showFieldError('customer-phone', 'Enter a valid phone number (at least 7 digits)');
        valid = false;
    }

    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    const today = new Date().toISOString().split('T')[0];

    if (!pickupDate?.value) {
        showFieldError('pickup-date', 'Pickup date is required');
        valid = false;
    } else if (pickupDate.value < today) {
        showFieldError('pickup-date', 'Pickup date cannot be in the past');
        valid = false;
    }

    if (!returnDate?.value) {
        showFieldError('return-date', 'Return date is required');
        valid = false;
    } else if (pickupDate?.value && returnDate.value <= pickupDate.value) {
        showFieldError('return-date', 'Return date must be after pickup date');
        valid = false;
    }

    const pickupLoc = document.getElementById('pickup-location');
    if (!pickupLoc?.value) {
        showFieldError('pickup-location', 'Select a pickup location');
        valid = false;
    }

    const returnLoc = document.getElementById('return-location');
    if (!returnLoc?.value) {
        showFieldError('return-location', 'Select a return location');
        valid = false;
    }

    const terms = document.getElementById('terms-checkbox');
    if (!terms?.checked) {
        showFieldError('terms-checkbox', 'You must accept the terms and conditions');
        valid = false;
    }

    return valid;
}

// ── Submit booking ──

async function handleBookingSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }

    if (!currentCar) {
        showToast('Car data not loaded', 'error');
        return;
    }

    const btn = document.getElementById('confirm-booking-btn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Processing...';
    }

    // Resolve return location
    let returnLoc = document.getElementById('return-location').value;
    if (returnLoc === 'SAME_AS_PICKUP') {
        returnLoc = document.getElementById('pickup-location').value;
    }

    // Map location codes to display names
    const locationMap = {
        'AIRPORT': 'Airport',
        'CITY_CENTER': 'City Center',
        'TRAIN_STATION': 'Train Station',
        'HOTEL_DELIVERY': 'Hotel Delivery'
    };

    const bookingData = {
        carId: currentCar.id,
        customerName: document.getElementById('customer-name').value.trim(),
        customerEmail: document.getElementById('customer-email').value.trim(),
        customerPhone: document.getElementById('customer-phone').value.trim(),
        pickupDate: document.getElementById('pickup-date').value,
        returnDate: document.getElementById('return-date').value,
        pickupLocation: locationMap[document.getElementById('pickup-location').value] || document.getElementById('pickup-location').value,
        returnLocation: locationMap[returnLoc] || returnLoc,
        extrasGPS: isExtraChecked('GPS'),
        extrasChildSeat: isExtraChecked('CHILD_SEAT'),
        extrasExtraDriver: isExtraChecked('ADDITIONAL_DRIVER'),
        extrasInsurance: isExtraChecked('FULL_INSURANCE'),
        extrasFuelPrepay: isExtraChecked('FUEL_PREPAY'),
        notes: document.getElementById('booking-notes')?.value?.trim() || ''
    };

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Booking failed' }));
            throw new Error(err.error || 'Could not create booking');
        }

        const booking = await res.json();
        window.location.href = `booking-confirm.html?token=${booking.reservationToken}`;

    } catch (err) {
        showToast(err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Confirm Booking';
        }
    }
}

function isExtraChecked(value) {
    const cb = document.querySelector(`input[name="extras"][value="${value}"]`);
    return cb ? cb.checked : false;
}
