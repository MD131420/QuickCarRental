/* ========================================
   admin.js — Admin panel: login, dashboard,
   car management, booking management
   ======================================== */

const API_BASE = window.location.port === '8080' ? '/api' : 'http://localhost:8080/api';

let adminCars = [];
let adminBookings = [];
let adminMessages = [];
let editingCarId = null;
let deletingCarId = null;
let viewingBookingToken = null;

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

    // Check if already logged in
    if (sessionStorage.getItem('adminAuth') === 'true') {
        showAdminPanel();
    }

    // Login form
    document.getElementById('admin-login-form')?.addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('admin-logout')?.addEventListener('click', handleLogout);

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Add car button
    document.getElementById('btn-add-car')?.addEventListener('click', () => openCarModal());

    // Car form
    document.getElementById('car-form')?.addEventListener('submit', handleSaveCar);

    // Booking status filter
    document.getElementById('booking-status-filter')?.addEventListener('change', filterBookingsTable);

    // Save status button
    document.getElementById('btn-save-status')?.addEventListener('click', handleSaveBookingStatus);

    // Delete confirm
    document.getElementById('btn-confirm-delete')?.addEventListener('click', handleConfirmDelete);

    // Mark all messages as read
    document.getElementById('btn-mark-all-read')?.addEventListener('click', markAllMessagesRead);

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal')?.classList.add('hidden');
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.closest('.modal')?.classList.add('hidden');
        });
    });
});

// ── Login / Logout ──

async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password')?.value;
    const errorEl = document.getElementById('login-error');

    try {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (data.success) {
            sessionStorage.setItem('adminAuth', 'true');
            showAdminPanel();
        } else {
            if (errorEl) {
                errorEl.textContent = 'Invalid password. Try again.';
                errorEl.classList.remove('hidden');
            }
        }
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = 'Cannot connect to server.';
            errorEl.classList.remove('hidden');
        }
    }
}

function handleLogout() {
    sessionStorage.removeItem('adminAuth');
    document.getElementById('admin-container')?.classList.add('hidden');
    document.getElementById('admin-login')?.style.removeProperty('display');
    document.getElementById('admin-login')?.classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    showToast('Logged out successfully');
}

function showAdminPanel() {
    document.getElementById('admin-login')?.classList.add('hidden');
    const container = document.getElementById('admin-container');
    if (container) container.classList.remove('hidden');
    loadDashboard();
    loadAdminCars();
    loadAdminBookings();
    loadMessages();
}

// ── Tabs ──

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === tabId);
    });
}

// ── Dashboard ──

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/admin/stats`);
        if (!res.ok) throw new Error('Failed to load stats');
        const stats = await res.json();

        setStatValue('stat-total-cars', stats.totalCars ?? 0);
        setStatValue('stat-active-bookings', stats.activeBookings ?? 0);
        setStatValue('stat-available-cars', stats.availableCars ?? 0);
        setStatValue('stat-daily-revenue', formatCurrency(stats.dailyRevenue ?? 0));
        setStatValue('stat-unread-messages', stats.unreadMessages ?? 0);
        updateUnreadBadge(stats.unreadMessages ?? 0);

        renderChart(stats.last7DaysData || {});
    } catch (err) {
        showToast('Could not load dashboard data', 'error');
    }
}

function setStatValue(cardId, value) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const valEl = card.querySelector('.stat-value');
    if (valEl) valEl.textContent = value;
}

function renderChart(data) {
    const chart = document.getElementById('bookings-chart');
    if (!chart) return;

    const entries = Object.entries(data);
    if (entries.length === 0) {
        chart.innerHTML = '<p class="text-muted">No booking data for the last 7 days.</p>';
        return;
    }

    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    chart.innerHTML = `
        <div class="chart-bars">
            ${entries.map(([date, count]) => {
                const height = Math.max((count / maxVal) * 150, 4);
                const label = date.substring(5); // MM-DD
                return `
                    <div class="chart-bar-wrapper">
                        <span class="chart-bar-count">${count}</span>
                        <div class="chart-bar" style="height:${height}px"></div>
                        <span class="chart-bar-label">${label}</span>
                    </div>`;
            }).join('')}
        </div>`;
}

// ── Manage Cars ──

async function loadAdminCars() {
    try {
        const res = await fetch(`${API_BASE}/cars`);
        if (!res.ok) throw new Error('Failed to load cars');
        adminCars = await res.json();
        renderCarsTable();
    } catch (err) {
        showToast('Could not load cars', 'error');
    }
}

function renderCarsTable() {
    const tbody = document.querySelector('#cars-table tbody');
    if (!tbody) return;

    if (adminCars.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No cars found</td></tr>';
        return;
    }

    tbody.innerHTML = adminCars.map(car => `
        <tr>
            <td>${car.id}</td>
            <td>${car.brand}</td>
            <td>${car.model}</td>
            <td>${car.category || '—'}</td>
            <td>${formatCurrency(car.pricePerDay)}</td>
            <td>
                <select class="status-select" data-car-id="${car.id}" onchange="handleCarStatusChange(${car.id}, this.value)">
                    <option value="available" ${car.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="maintenance" ${car.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                    <option value="retired" ${car.status === 'retired' ? 'selected' : ''}>Retired</option>
                </select>
            </td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-outline" onclick="openCarModal(${car.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${car.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function openCarModal(carId = null) {
    editingCarId = carId;
    const modal = document.getElementById('car-modal');
    const title = document.getElementById('car-modal-title');
    const form = document.getElementById('car-form');

    if (!modal || !form) return;

    form.reset();

    if (carId) {
        const car = adminCars.find(c => c.id === carId);
        if (!car) return;

        if (title) title.textContent = 'Edit Car';
        document.getElementById('car-id').value = car.id;
        document.getElementById('car-brand').value = car.brand || '';
        document.getElementById('car-model').value = car.model || '';
        document.getElementById('car-year').value = car.year || '';
        document.getElementById('car-category').value = (car.category || '').toUpperCase();
        document.getElementById('car-price').value = car.pricePerDay || '';
        document.getElementById('car-seats').value = car.seats || '';
        document.getElementById('car-transmission').value = (car.transmission || '').toLowerCase();
        document.getElementById('car-fuel').value = (car.fuelType || '').toLowerCase();
        document.getElementById('car-plate').value = car.licensePlate || '';
        document.getElementById('car-status').value = car.status || 'available';
        document.getElementById('car-image').value = car.imageUrl || '';
    } else {
        if (title) title.textContent = 'Add New Car';
        document.getElementById('car-id').value = '';
    }

    modal.classList.remove('hidden');
}

async function handleSaveCar(e) {
    e.preventDefault();

    const carData = {
        brand: document.getElementById('car-brand').value,
        model: document.getElementById('car-model').value,
        year: parseInt(document.getElementById('car-year').value),
        category: document.getElementById('car-category').value || '',
        pricePerDay: parseFloat(document.getElementById('car-price').value),
        seats: parseInt(document.getElementById('car-seats').value),
        transmission: document.getElementById('car-transmission').value,
        fuelType: document.getElementById('car-fuel').value,
        licensePlate: document.getElementById('car-plate').value,
        status: document.getElementById('car-status').value,
        imageUrl: document.getElementById('car-image').value || '',
        doors: 4,
        hasAC: true,
        hasBluetooth: true
    };

    try {
        let res;
        if (editingCarId) {
            res = await fetch(`${API_BASE}/cars/${editingCarId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carData)
            });
        } else {
            res = await fetch(`${API_BASE}/cars`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carData)
            });
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Save failed' }));
            throw new Error(err.error || 'Could not save car');
        }

        document.getElementById('car-modal')?.classList.add('hidden');
        showToast(editingCarId ? 'Car updated successfully' : 'Car added successfully');
        loadAdminCars();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleCarStatusChange(carId, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/cars/${carId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) throw new Error('Status update failed');
        showToast('Car status updated');
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
        loadAdminCars(); // Revert select
    }
}

function openDeleteModal(carId) {
    deletingCarId = carId;
    document.getElementById('delete-confirm-modal')?.classList.remove('hidden');
}

async function handleConfirmDelete() {
    if (!deletingCarId) return;

    try {
        const res = await fetch(`${API_BASE}/cars/${deletingCarId}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Delete failed' }));
            throw new Error(err.error || 'Could not delete car');
        }

        document.getElementById('delete-confirm-modal')?.classList.add('hidden');
        showToast('Car deleted successfully');
        loadAdminCars();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }

    deletingCarId = null;
}

// ── Manage Bookings ──

async function loadAdminBookings() {
    try {
        const res = await fetch(`${API_BASE}/bookings`);
        if (!res.ok) throw new Error('Failed to load bookings');
        adminBookings = await res.json();
        renderBookingsTable(adminBookings);
    } catch (err) {
        showToast('Could not load bookings', 'error');
    }
}

function renderBookingsTable(bookings) {
    const tbody = document.querySelector('#bookings-table tbody');
    if (!tbody) return;

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No bookings found</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(b => {
        const statusClass = {
            'CONFIRMED': 'status-confirmed',
            'ACTIVE': 'status-active',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled'
        }[(b.status || '').toUpperCase()] || '';

        return `
            <tr data-status="${(b.status || '').toUpperCase()}">
                <td><code>${b.reservationToken}</code></td>
                <td>${b.customerName || '—'}</td>
                <td>${b.carBrand || ''} ${b.carModel || ''}</td>
                <td>${formatDate(b.pickupDate)} — ${formatDate(b.returnDate)}</td>
                <td><span class="status-badge ${statusClass}">${b.status || '—'}</span></td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-outline" onclick="openBookingDetail('${b.reservationToken}')">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterBookingsTable() {
    const filterVal = document.getElementById('booking-status-filter')?.value?.toUpperCase() || '';

    // Map the filter dropdown values to actual status values
    const filterMap = {
        'BOOKED': 'CONFIRMED',
        'PICKED-UP': 'ACTIVE',
        'IN-USE': 'ACTIVE',
        'RETURNED': 'COMPLETED',
        'CANCELLED': 'CANCELLED'
    };

    const mappedFilter = filterMap[filterVal] || filterVal;

    if (!mappedFilter) {
        renderBookingsTable(adminBookings);
    } else {
        const filtered = adminBookings.filter(b =>
            (b.status || '').toUpperCase() === mappedFilter
        );
        renderBookingsTable(filtered);
    }
}

function openBookingDetail(token) {
    viewingBookingToken = token;
    const booking = adminBookings.find(b => b.reservationToken === token);
    if (!booking) return;

    const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val ?? '—';
    };

    setText('detail-token', booking.reservationToken);
    setText('detail-customer', booking.customerName);
    setText('detail-email', booking.customerEmail);
    setText('detail-phone', booking.customerPhone);
    setText('detail-car', `${booking.carBrand || ''} ${booking.carModel || ''}`);
    setText('detail-pickup', formatDate(booking.pickupDate));
    setText('detail-return', formatDate(booking.returnDate));
    setText('detail-pickup-loc', booking.pickupLocation);
    setText('detail-return-loc', booking.returnLocation);
    setText('detail-total', formatCurrency(booking.totalPrice));
    setText('detail-status', booking.status);

    // Set the status change dropdown
    const statusSelect = document.getElementById('detail-status-change');
    if (statusSelect) {
        // Clear and rebuild options with actual enum values
        statusSelect.innerHTML = `
            <option value="CONFIRMED" ${booking.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
            <option value="ACTIVE" ${booking.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="COMPLETED" ${booking.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            <option value="CANCELLED" ${booking.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
        `;
    }

    document.getElementById('booking-detail-modal')?.classList.remove('hidden');
}

async function handleSaveBookingStatus() {
    if (!viewingBookingToken) return;

    const newStatus = document.getElementById('detail-status-change')?.value;
    if (!newStatus) return;

    try {
        const res = await fetch(`${API_BASE}/bookings/${viewingBookingToken}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Status update failed' }));
            throw new Error(err.error || 'Could not update booking status');
        }

        document.getElementById('booking-detail-modal')?.classList.add('hidden');
        showToast('Booking status updated');
        loadAdminBookings();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ── Contact Messages ──

async function loadMessages() {
    try {
        const res = await fetch(`${API_BASE}/admin/messages`);
        if (!res.ok) throw new Error('Failed to load messages');
        adminMessages = await res.json();
        renderMessagesTable(adminMessages);
        updateUnreadBadge(adminMessages.filter(m => !m.read).length);
    } catch (err) {
        console.error('Could not load messages:', err);
    }
}

function openMessageModal(id) {
    const m = adminMessages.find(msg => msg.id === id);
    if (!m) return;

    document.getElementById('msg-name').textContent    = m.name || '—';
    document.getElementById('msg-email').textContent   = m.email || '—';
    document.getElementById('msg-subject').textContent = m.subject || '—';
    document.getElementById('msg-date').textContent    = formatDate(m.createdAt);
    document.getElementById('msg-body').textContent    = m.message || '—';

    document.getElementById('message-view-modal')?.classList.remove('hidden');

    // Auto-mark as read when opened
    if (!m.read) markMessageRead(id);
}

function renderMessagesTable(messages) {
    const tbody = document.querySelector('#messages-table tbody');
    if (!tbody) return;

    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:2rem;color:var(--gray)">No messages yet.</td></tr>';
        return;
    }

    tbody.innerHTML = messages.map(m => `
        <tr class="${m.read ? '' : 'message-unread'}">
            <td style="white-space:nowrap">${formatDate(m.createdAt)}</td>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.email)}</td>
            <td>${escapeHtml(m.subject || '—')}</td>
            <td class="message-text">${escapeHtml(m.message)}</td>
            <td style="white-space:nowrap">
                <button class="btn btn-sm btn-primary" onclick="openMessageModal(${m.id})">View</button>
                ${!m.read ? `<button class="btn btn-sm btn-outline" onclick="markMessageRead(${m.id})" style="margin-left:4px">Mark Read</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function updateUnreadBadge(count) {
    const badge = document.getElementById('unread-badge');
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

async function markMessageRead(id) {
    try {
        await fetch(`${API_BASE.replace('/api', '')}/api/contact/${id}/read`, { method: 'PATCH' });
        loadMessages();
    } catch (err) {
        showToast('Could not update message', 'error');
    }
}

async function markAllMessagesRead() {
    try {
        const res = await fetch(`${API_BASE}/admin/messages`);
        const messages = await res.json();
        const unread = messages.filter(m => !m.read);
        await Promise.all(unread.map(m =>
            fetch(`${API_BASE.replace('/api', '')}/api/contact/${m.id}/read`, { method: 'PATCH' })
        ));
        loadMessages();
        showToast('All messages marked as read');
    } catch (err) {
        showToast('Could not update messages', 'error');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Make functions available globally for inline onclick handlers
window.openCarModal = openCarModal;
window.openDeleteModal = openDeleteModal;
window.handleCarStatusChange = handleCarStatusChange;
window.openBookingDetail = openBookingDetail;
window.markMessageRead = markMessageRead;
window.openMessageModal = openMessageModal;
