/* ========================================
   reservation-check.js — Reservation lookup,
   status display, cancel/modify/extend actions
   ======================================== */

const API_BASE = window.location.port === '8080' ? '/api' : 'http://localhost:8080/api';

let currentBooking = null;

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

// ── DOM Ready ──

document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // Check URL for token param
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        document.getElementById('token-input').value = token;
        searchReservation(token);
    }

    // Search form
    document.getElementById('reservation-search-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('token-input');
        const val = (input?.value || '').trim();
        if (val) searchReservation(val);
    });

    // Action buttons
    document.getElementById('btn-cancel')?.addEventListener('click', handleCancel);
    document.getElementById('btn-modify')?.addEventListener('click', () => openModal('modify-modal'));
    document.getElementById('btn-extend')?.addEventListener('click', () => openModal('extend-modal'));
    document.getElementById('btn-download')?.addEventListener('click', () => {
        if (currentBooking) {
            window.location.href = `booking-confirm.html?token=${currentBooking.reservationToken}`;
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal')?.classList.add('hidden');
        });
    });

    // Modal overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.closest('.modal')?.classList.add('hidden');
        });
    });

    // Modify form
    document.getElementById('modify-dates-form')?.addEventListener('submit', handleModify);

    // Extend form
    document.getElementById('extend-rental-form')?.addEventListener('submit', handleExtend);
});

// ── Search reservation ──

async function searchReservation(token) {
    const resultDiv = document.getElementById('reservation-result');
    if (!resultDiv) return;

    resultDiv.classList.add('hidden');

    try {
        const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(token)}`);
        if (!res.ok) {
            if (res.status === 404) throw new Error('Reservation not found');
            throw new Error('Failed to load reservation');
        }

        currentBooking = await res.json();
        displayReservation(currentBooking);
        resultDiv.classList.remove('hidden');

    } catch (err) {
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div class="error-message">
                <h2>Reservation Not Found</h2>
                <p>No reservation found for "${token}". Please check the order number and try again.</p>
            </div>`;
        showToast(err.message, 'error');
    }
}

// ── Display reservation ──

function displayReservation(booking) {
    const resultDiv = document.getElementById('reservation-result');
    if (!resultDiv) return;

    // Rebuild the result HTML in case it was replaced by error message
    resultDiv.innerHTML = buildResultHTML();

    // Status badge
    const statusEl = document.getElementById('res-status');
    if (statusEl) {
        const status = (booking.status || '').toUpperCase();
        statusEl.textContent = status;
        statusEl.className = 'status-badge';
        const statusClass = {
            'CONFIRMED': 'status-confirmed',
            'ACTIVE': 'status-active',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled'
        };
        statusEl.classList.add(statusClass[status] || '');
    }

    // Car info
    setText('res-car-name', `${booking.carBrand || ''} ${booking.carModel || ''}`);
    setText('res-car-category', booking.carCategory || '—');
    setText('res-car-plate', booking.carLicensePlate || '—');

    // Dates
    setText('res-pickup-date', formatDate(booking.pickupDate));
    setText('res-return-date', formatDate(booking.returnDate));
    const days = calcDays(booking.pickupDate, booking.returnDate);
    setText('res-duration', `${days} day${days !== 1 ? 's' : ''}`);

    // Locations
    setText('res-pickup-location', booking.pickupLocation || '—');
    setText('res-return-location', booking.returnLocation || '—');

    // Price
    setText('res-daily-rate', booking.carPricePerDay ? formatCurrency(booking.carPricePerDay) : '—');
    setText('res-rental-days', days);
    setText('res-total-price', formatCurrency(booking.totalPrice));

    // Extras
    const extras = [];
    if (booking.extrasGPS) extras.push('GPS');
    if (booking.extrasChildSeat) extras.push('Child Seat');
    if (booking.extrasExtraDriver) extras.push('Extra Driver');
    if (booking.extrasInsurance) extras.push('Insurance');
    if (booking.extrasFuelPrepay) extras.push('Fuel Prepay');
    setText('res-extras', extras.length > 0 ? extras.join(', ') : 'None');

    // Timeline
    updateTimeline(booking.status);

    // Action buttons visibility
    updateActions(booking);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? '—';
}

function calcDays(start, end) {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(0, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

function buildResultHTML() {
    return `
        <div class="reservation-header">
            <h2>Reservation Details</h2>
            <span id="res-status" class="status-badge"></span>
        </div>
        <div class="reservation-details-grid">
            <div class="detail-card">
                <h3>Car Information</h3>
                <p><strong>Car:</strong> <span id="res-car-name">—</span></p>
                <p><strong>Category:</strong> <span id="res-car-category">—</span></p>
                <p><strong>License Plate:</strong> <span id="res-car-plate">—</span></p>
            </div>
            <div class="detail-card">
                <h3>Rental Dates</h3>
                <p><strong>Pickup:</strong> <span id="res-pickup-date">—</span></p>
                <p><strong>Return:</strong> <span id="res-return-date">—</span></p>
                <p><strong>Duration:</strong> <span id="res-duration">—</span></p>
            </div>
            <div class="detail-card">
                <h3>Locations</h3>
                <p><strong>Pickup Location:</strong> <span id="res-pickup-location">—</span></p>
                <p><strong>Return Location:</strong> <span id="res-return-location">—</span></p>
            </div>
            <div class="detail-card">
                <h3>Price Breakdown</h3>
                <p><strong>Daily Rate:</strong> <span id="res-daily-rate">—</span></p>
                <p><strong>Rental Days:</strong> <span id="res-rental-days">—</span></p>
                <p><strong>Extras:</strong> <span id="res-extras">—</span></p>
                <p class="price-total"><strong>Total:</strong> <span id="res-total-price">—</span></p>
            </div>
        </div>
        <div class="reservation-timeline">
            <h3>Rental Progress</h3>
            <div class="timeline">
                <div class="timeline-step" data-step="booked">
                    <div class="timeline-dot"></div>
                    <span class="timeline-label">Booked</span>
                </div>
                <div class="timeline-step" data-step="picked-up">
                    <div class="timeline-dot"></div>
                    <span class="timeline-label">Picked Up</span>
                </div>
                <div class="timeline-step" data-step="in-use">
                    <div class="timeline-dot"></div>
                    <span class="timeline-label">In Use</span>
                </div>
                <div class="timeline-step" data-step="returned">
                    <div class="timeline-dot"></div>
                    <span class="timeline-label">Returned</span>
                </div>
            </div>
        </div>
        <div id="reservation-actions" class="reservation-actions">
            <button type="button" id="btn-cancel" class="btn btn-danger">Cancel Reservation</button>
            <button type="button" id="btn-modify" class="btn btn-secondary">Modify Dates</button>
            <button type="button" id="btn-extend" class="btn btn-secondary">Extend Rental</button>
            <button type="button" id="btn-download" class="btn btn-outline">Download Ticket</button>
        </div>`;
}

// ── Timeline ──

function updateTimeline(status) {
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach(step => {
        step.classList.remove('completed', 'active', 'cancelled');
    });

    const statusUpper = (status || '').toUpperCase();

    switch (statusUpper) {
        case 'CONFIRMED':
            setTimelineStep('booked', 'active');
            break;
        case 'ACTIVE':
            setTimelineStep('booked', 'completed');
            setTimelineStep('picked-up', 'completed');
            setTimelineStep('in-use', 'active');
            break;
        case 'COMPLETED':
            setTimelineStep('booked', 'completed');
            setTimelineStep('picked-up', 'completed');
            setTimelineStep('in-use', 'completed');
            setTimelineStep('returned', 'completed');
            break;
        case 'CANCELLED':
            setTimelineStep('booked', 'cancelled');
            break;
    }
}

function setTimelineStep(stepName, className) {
    const step = document.querySelector(`.timeline-step[data-step="${stepName}"]`);
    if (step) step.classList.add(className);
}

// ── Action buttons ──

function updateActions(booking) {
    const status = (booking.status || '').toUpperCase();
    const cancelBtn = document.getElementById('btn-cancel');
    const modifyBtn = document.getElementById('btn-modify');
    const extendBtn = document.getElementById('btn-extend');
    const downloadBtn = document.getElementById('btn-download');

    // Re-attach event listeners after innerHTML rebuild
    cancelBtn?.addEventListener('click', handleCancel);
    modifyBtn?.addEventListener('click', () => openModal('modify-modal'));
    extendBtn?.addEventListener('click', () => openModal('extend-modal'));
    downloadBtn?.addEventListener('click', () => {
        if (currentBooking) {
            window.location.href = `booking-confirm.html?token=${currentBooking.reservationToken}`;
        }
    });

    // Show/hide based on status
    if (cancelBtn) {
        // Cancel only if CONFIRMED and pickup > 24h away
        const canCancel = status === 'CONFIRMED' && isPickupMoreThan24hAway(booking.pickupDate);
        cancelBtn.style.display = canCancel ? '' : 'none';
    }

    if (modifyBtn) {
        modifyBtn.style.display = status === 'CONFIRMED' ? '' : 'none';
    }

    if (extendBtn) {
        extendBtn.style.display = status === 'ACTIVE' ? '' : 'none';
    }

    if (downloadBtn) {
        downloadBtn.style.display = status !== 'CANCELLED' ? '' : 'none';
    }
}

function isPickupMoreThan24hAway(pickupDate) {
    if (!pickupDate) return false;
    const pickup = new Date(pickupDate);
    const now = new Date();
    const diff = pickup.getTime() - now.getTime();
    return diff > 24 * 60 * 60 * 1000;
}

// ── Modal helpers ──

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

// ── Cancel reservation ──

async function handleCancel() {
    if (!currentBooking) return;
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
        const res = await fetch(`${API_BASE}/bookings/${currentBooking.reservationToken}/cancel`, {
            method: 'PATCH'
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Cancellation failed' }));
            throw new Error(err.error || 'Could not cancel reservation');
        }

        showToast('Reservation cancelled successfully');
        searchReservation(currentBooking.reservationToken);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ── Modify dates ──

async function handleModify(e) {
    e.preventDefault();
    if (!currentBooking) return;

    const pickupInput = document.getElementById('modify-pickup-date');
    const returnInput = document.getElementById('modify-return-date');

    // Extract date part only (YYYY-MM-DD) from datetime-local
    const pickupDate = pickupInput?.value?.split('T')[0];
    const returnDate = returnInput?.value?.split('T')[0];

    if (!pickupDate || !returnDate) {
        showToast('Please select both dates', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/bookings/${currentBooking.reservationToken}/modify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickupDate, returnDate })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Modification failed' }));
            throw new Error(err.error || 'Could not modify reservation');
        }

        document.getElementById('modify-modal')?.classList.add('hidden');
        showToast('Reservation dates updated successfully');
        searchReservation(currentBooking.reservationToken);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ── Extend rental ──

async function handleExtend(e) {
    e.preventDefault();
    if (!currentBooking) return;

    const returnInput = document.getElementById('extend-return-date');
    const returnDate = returnInput?.value?.split('T')[0];

    if (!returnDate) {
        showToast('Please select a new return date', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/bookings/${currentBooking.reservationToken}/extend`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ returnDate })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Extension failed' }));
            throw new Error(err.error || 'Could not extend reservation');
        }

        document.getElementById('extend-modal')?.classList.add('hidden');
        showToast('Rental period extended successfully');
        searchReservation(currentBooking.reservationToken);
    } catch (err) {
        showToast(err.message, 'error');
    }
}
