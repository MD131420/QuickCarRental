/* ========================================
   cars.js — Car listing page with filters,
   sorting, and search functionality
   ======================================== */

const API_BASE = window.location.port === '8080' ? '/api' : 'http://localhost:8080/api';

let allCars = [];

// ── Utility functions (duplicated from app.js since this page loads cars.js only) ──

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
    // Default sedan / economy / comfort
    return `<svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:70%;opacity:0.25"><path d="M20 55h160M35 55l10-20h30l15-15h45l20 15h15l5 20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="58" cy="55" r="11" stroke="#fff" stroke-width="3"/><circle cx="148" cy="55" r="11" stroke="#fff" stroke-width="3"/><path d="M78 35h40v10H78z" stroke="#fff" stroke-width="2" rx="2"/><path d="M125 25h30v15h-30z" stroke="#fff" stroke-width="2" rx="2"/></svg>`;
}

// ── DOM Ready ──

document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    loadCars();

    document.getElementById('apply-filters')?.addEventListener('click', applyFiltersAndRender);
    document.getElementById('reset-filters')?.addEventListener('click', resetFilters);
    document.getElementById('sort-select')?.addEventListener('change', applyFiltersAndRender);
    document.getElementById('search-input')?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFiltersAndRender();
    });
});

// ── Load cars from API ──

async function loadCars() {
    const carList = document.getElementById('car-list');
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'flex';

    try {
        const res = await fetch(`${API_BASE}/cars`);
        if (!res.ok) throw new Error('Failed to load cars');
        allCars = await res.json();
        applyFiltersAndRender();
    } catch (err) {
        if (carList) carList.innerHTML = '<p class="text-muted">Could not load cars. Is the backend running?</p>';
        showToast(err.message, 'error');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}

// ── Filter and sort logic ──

function getFilterValues() {
    const search = (document.getElementById('search-input')?.value || '').trim().toLowerCase();

    const categories = [];
    document.querySelectorAll('input[name="category"]:checked').forEach(cb => categories.push(cb.value));

    const transmission = document.querySelector('input[name="transmission"]:checked')?.value || '';

    const fuels = [];
    document.querySelectorAll('input[name="fuel"]:checked').forEach(cb => fuels.push(cb.value));

    const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;

    const seatsMin = parseInt(document.getElementById('seats-select')?.value) || 0;

    const sort = document.getElementById('sort-select')?.value || 'price_asc';

    return { search, categories, transmission, fuels, minPrice, maxPrice, seatsMin, sort };
}

function filterCars(cars, filters) {
    return cars.filter(car => {
        // Search by brand or model
        if (filters.search) {
            const text = `${car.brand} ${car.model}`.toLowerCase();
            if (!text.includes(filters.search)) return false;
        }

        // Category filter
        if (filters.categories.length > 0) {
            if (!filters.categories.includes((car.category || '').toUpperCase())) return false;
        }

        // Transmission filter
        if (filters.transmission) {
            if ((car.transmission || '').toUpperCase() !== filters.transmission.toUpperCase()) return false;
        }

        // Fuel type filter
        if (filters.fuels.length > 0) {
            if (!filters.fuels.includes((car.fuelType || '').toUpperCase())) return false;
        }

        // Price range
        const price = parseFloat(car.pricePerDay) || 0;
        if (price < filters.minPrice || price > filters.maxPrice) return false;

        // Seats
        if (filters.seatsMin > 0 && (car.seats || 0) < filters.seatsMin) return false;

        return true;
    });
}

function sortCars(cars, sortKey) {
    const sorted = [...cars];
    switch (sortKey) {
        case 'price_asc':
            sorted.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
            break;
        case 'price_desc':
            sorted.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
            break;
        case 'name_asc':
            sorted.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
            break;
    }
    return sorted;
}

function applyFiltersAndRender() {
    const filters = getFilterValues();
    let filtered = filterCars(allCars, filters);
    filtered = sortCars(filtered, filters.sort);
    renderCars(filtered);
}

// ── Render car cards ──

function renderCars(cars) {
    const carList = document.getElementById('car-list');
    const countEl = document.getElementById('results-count');
    if (!carList) return;

    if (countEl) {
        countEl.textContent = `${cars.length} car${cars.length !== 1 ? 's' : ''} found`;
    }

    if (cars.length === 0) {
        carList.innerHTML = '<p class="text-muted">No cars match your filters. Try adjusting your search criteria.</p>';
        return;
    }

    carList.innerHTML = cars.map(car => {
        const isAvailable = (car.status || '').toLowerCase() === 'available';
        const badgeClass = isAvailable ? 'badge-success' : 'badge-danger';
        const badgeText = isAvailable ? 'Available' : 'Unavailable';
        const cat = (car.category || '').toUpperCase();

        return `
            <div class="car-card">
                <div class="car-image-placeholder" style="background:${getCarGradient(cat)}">
                    ${getCarSVG(cat)}
                    <span class="car-category-label">${cat || 'Car'}</span>
                </div>
                <div class="car-card-body">
                    <div class="car-card-header">
                        <h3 class="car-card-title">${car.brand} ${car.model}</h3>
                        <span class="badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <p class="car-card-price">${formatCurrency(car.pricePerDay)} <span class="price-period">/ day</span></p>
                    <div class="car-card-specs">
                        <span>${car.fuelType || '—'}</span>
                        <span>${car.transmission || '—'}</span>
                        <span>${car.seats || '—'} seats</span>
                        <span>${car.year || ''}</span>
                    </div>
                    <a href="car-detail.html?id=${car.id}" class="btn btn-primary btn-sm">View Details</a>
                </div>
            </div>
        `;
    }).join('');
}

// ── Reset filters ──

function resetFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('input[name="category"]:checked').forEach(cb => cb.checked = false);

    const allRadio = document.querySelector('input[name="transmission"][value=""]');
    if (allRadio) allRadio.checked = true;

    document.querySelectorAll('input[name="fuel"]:checked').forEach(cb => cb.checked = false);

    const minPrice = document.getElementById('min-price');
    const maxPrice = document.getElementById('max-price');
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    const seatsSelect = document.getElementById('seats-select');
    if (seatsSelect) seatsSelect.value = '';

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'price_asc';

    applyFiltersAndRender();
}
