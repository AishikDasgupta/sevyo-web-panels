/* Sevyo — Shared app logic for the static HTML version. */

/* ===== Sidebar configs (icons via inline SVG strings) ===== */
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  vendors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>',
  caregivers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  bookings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  reviews: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  finance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  schedule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  visitLog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  browse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
};

const SIDEBARS = {
  admin: {
    title: 'Admin Panel',
    items: [
      { label: 'Dashboard', path: 'admin-dashboard.html', icon: 'dashboard' },
      { label: 'Vendors', path: 'admin-vendors.html', icon: 'vendors', badge: '4' },
      { label: 'Caregivers', path: 'admin-caregivers.html', icon: 'caregivers' },
      { label: 'Bookings', path: 'admin-bookings.html', icon: 'bookings', badge: '7' },
      { label: 'Users', path: 'admin-users.html', icon: 'users' },
      { label: 'Reviews', path: 'admin-reviews.html', icon: 'reviews' },
    ],
  },
  vendor: {
    title: 'Vendor Panel',
    items: [
      { label: 'Dashboard', path: 'vendor-dashboard.html', icon: 'dashboard' },
      { label: 'Caregivers', path: 'vendor-caregivers.html', icon: 'caregivers' },
      { label: 'Bookings', path: 'vendor-bookings.html', icon: 'bookings', badge: '3' },
      { label: 'Finance', path: 'vendor-finance.html', icon: 'finance' },
    ],
  },
  resource: {
    title: 'Caregiver Panel',
    items: [
      { label: 'Dashboard', path: 'resource-dashboard.html', icon: 'dashboard' },
      { label: 'Schedule', path: 'resource-schedule.html', icon: 'schedule' },
      { label: 'Visit Log', path: 'resource-visit-log.html', icon: 'visitLog' },
      { label: 'Profile', path: 'resource-profile.html', icon: 'profile' },
    ],
  },
  user: {
    title: 'Patient Portal',
    items: [
      { label: 'Home', path: 'user-home.html', icon: 'home' },
      { label: 'Browse Care', path: 'user-browse.html', icon: 'browse' },
      { label: 'My Bookings', path: 'user-bookings.html', icon: 'bookings', badge: '5' },
      { label: 'Profile', path: 'user-profile.html', icon: 'profile' },
    ],
  },
};

/* ===== Render sidebar + topbar for a panel page ===== */
function initPanel(panel, activePath) {
  const cfg = SIDEBARS[panel];
  if (!cfg) return;

  const sidebarHTML = `
    <button class="mobile-toggle" onclick="toggleSidebar()" aria-label="Menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
    </button>
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <img src="${LOGO_URL}" alt="Sevyo" class="logo">
        <p class="panel-title">${cfg.title}</p>
      </div>
      <nav>
        ${cfg.items.map(it => `
          <a href="${it.path}" class="${it.path === activePath ? 'active' : ''}">
            ${ICONS[it.icon] || ''}
            <span>${it.label}</span>
            ${it.badge ? `<span class="nav-badge">${it.badge}</span>` : ''}
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Topbar with notification bell
  const mainArea = document.getElementById('mainArea');
  if (mainArea) {
    const topbar = document.createElement('div');
    topbar.className = 'topbar';
    topbar.innerHTML = `
      <div class="notif-bell" id="notifBell">
        <button class="notif-btn" onclick="toggleNotif()">
          ${ICONS.bell}
          <span class="notif-dot">3</span>
        </button>
        <div class="notif-dropdown hidden" id="notifDropdown">
          <div class="flex justify-between items-center px-4 py-3 border-b" style="border-color:var(--border)">
            <h4 style="font-size:.875rem;font-weight:600">Notifications</h4>
            <button onclick="document.getElementById('notifDropdown').classList.add('hidden')">&times;</button>
          </div>
          <div style="max-height:20rem;overflow-y:auto">
            <div class="flex gap-3 px-4 py-3 border-b" style="border-color:var(--border)">
              <div style="width:2rem;height:2rem;border-radius:.5rem;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0">${ICONS.bell}</div>
              <div><p style="font-size:.75rem;font-weight:600">New Booking Received</p><p style="font-size:.75rem;color:var(--muted-fg)">IV Cannulation — John Doe</p></div>
            </div>
            <div class="flex gap-3 px-4 py-3 border-b" style="border-color:var(--border)">
              <div style="width:2rem;height:2rem;border-radius:.5rem;background:#ecfdf5;color:#059669;display:flex;align-items:center;justify-content:center;flex-shrink:0">✓</div>
              <div><p style="font-size:.75rem;font-weight:600">Booking Completed</p><p style="font-size:.75rem;color:var(--muted-fg)">Post-surgery care — ₹2200</p></div>
            </div>
            <div class="flex gap-3 px-4 py-3">
              <div style="width:2rem;height:2rem;border-radius:.5rem;background:#fffbeb;color:#d97706;display:flex;align-items:center;justify-content:center;flex-shrink:0">⚡</div>
              <div><p style="font-size:.75rem;font-weight:600">Broadcast Request</p><p style="font-size:.75rem;color:var(--muted-fg)">IV Cannulation needs vendor</p></div>
            </div>
          </div>
        </div>
      </div>
    `;
    mainArea.insertBefore(topbar, mainArea.firstChild);
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}

function toggleNotif() {
  document.getElementById('notifDropdown').classList.toggle('hidden');
}

/* ===== Helpers ===== */
function fmtINR(n) { return '₹' + (n || 0).toLocaleString('en-IN'); }

function statusBadge(status) {
  const map = {
    confirmed: 'badge-confirmed', pending: 'badge-pending', broadcast: 'badge-broadcast',
    in_progress: 'badge-in_progress', completed: 'badge-completed', cancelled: 'badge-cancelled',
    expired: 'badge-expired', active: 'badge-active', inactive: 'badge-inactive',
    pending_v: 'badge-pending-v', paid: 'badge-paid', unpaid: 'badge-unpaid',
  };
  const label = status === 'in_progress' ? 'In Progress' : status === 'pending_v' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1);
  return `<span class="badge ${map[status] || ''}">${label}</span>`;
}

function starsRow(rating) {
  let html = '<div class="stars-row">';
  for (let i = 1; i <= 5; i++) {
    html += `<svg viewBox="0 0 24 24" class="${i <= Math.round(rating) ? 'star-filled' : 'star-empty'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
  html += '</div>';
  return html;
}

function avatarOrInitial(entity, size) {
  const s = size || 40;
  if (entity.avatar) return `<img src="${entity.avatar}" class="avatar" style="width:${s}px;height:${s}px" alt="">`;
  const initial = (entity.name || entity.agency_name || '?')[0];
  return `<div class="avatar-placeholder" style="width:${s}px;height:${s}px;background:var(--primary);font-size:${s*0.4}px">${initial}</div>`;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  const item = document.createElement('div');
  item.className = 'toast-item';
  item.textContent = msg;
  el.appendChild(item);
  setTimeout(() => item.remove(), 3000);
}

/* ===== Fade-in on scroll ===== */
function initFadeIn() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-section').forEach(el => obs.observe(el));
}

/* ===== FAQ accordion ===== */
function initFAQ() {
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('open');
      const ans = item.querySelector('.faq-a');
      ans.style.display = item.classList.contains('open') ? 'block' : 'none';
    });
  });
}

/* Close notif on outside click */
document.addEventListener('click', (e) => {
  const bell = document.getElementById('notifBell');
  const dd = document.getElementById('notifDropdown');
  if (bell && dd && !bell.contains(e.target)) dd.classList.add('hidden');
});

/* Common DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initFAQ();
});