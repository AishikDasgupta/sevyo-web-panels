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

  if (panel === 'user') initSupportWidgets();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}

function toggleNotif() {
  document.getElementById('notifDropdown').classList.toggle('hidden');
}

/* ===== SOS + floating call / WhatsApp widgets (user panel only) ===== */
function initSupportWidgets() {
  if (document.getElementById('supportWidgets')) return;

  const wrap = document.createElement('div');
  wrap.id = 'supportWidgets';
  wrap.className = 'support-widgets';
  wrap.innerHTML = `
    <a class="float-btn float-wa" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Sevyo, I need help with a booking.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
    </a>
    <a class="float-btn float-call" href="tel:${CONTACT_PHONE}" aria-label="Call Sevyo" title="Call Sevyo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </a>
  `;
  document.body.appendChild(wrap);

  const sos = document.createElement('button');
  sos.className = 'sos-float';
  sos.id = 'sosFloat';
  sos.type = 'button';
  sos.setAttribute('aria-label', 'SOS');
  sos.onclick = openSOS;
  sos.innerHTML = 'SOS';
  document.body.appendChild(sos);

  const modal = document.createElement('div');
  modal.className = 'modal-overlay hidden';
  modal.id = 'sosModal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>🚨 SOS — Call a Family Member</h3>
        <button type="button" data-close-sos style="font-size:1.25rem" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <p class="text-sm text-muted mb-4">Select a family member to call for help right away.</p>
        <div class="space-y-3" id="sosContactList"></div>
        <div class="flex gap-2 mt-4">
          <input class="input" id="sosNewName" placeholder="Name (e.g. Uncle)">
          <input class="input" id="sosNewPhone" placeholder="+91 00000 00000" style="flex:1.5">
          <button type="button" class="btn btn-outline" id="sosAddBtn">Add</button>
        </div>
        <button type="button" class="btn btn-primary btn-block btn-lg mt-4" data-close-sos>Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSOS();
    if (e.target.closest('[data-close-sos]')) closeSOS();
    if (e.target.closest('a[data-call-sos]')) closeSOS();
    if (e.target.closest('#sosAddBtn')) addFamilyContact();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSOS(); });

  renderSOSContacts();
}

function sosContacts() {
  try { return JSON.parse(localStorage.getItem('sevyo_family_contacts') || 'null') || FAMILY_CONTACTS; } catch (e) { return FAMILY_CONTACTS; }
}

function renderSOSContacts() {
  const list = document.getElementById('sosContactList');
  if (!list) return;
  list.innerHTML = sosContacts().map((c, i) => `
    <div class="flex items-center gap-3 p-3 rounded-xl border" style="border-color:var(--border)">
      <div style="width:2.5rem;height:2.5rem;border-radius:999px;background:#fff1f2;color:#e11d48;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${(c.name[0] || '?').toUpperCase()}</div>
      <div style="flex:1"><p style="font-weight:600;font-size:.875rem">${c.name}</p><p class="text-xs text-muted">${c.phone}</p></div>
      <a href="tel:${c.phone.replace(/\s+/g, '')}" class="btn btn-sm btn-accent" data-call-sos>Call</a>
    </div>
  `).join('');
}

function openSOS() { document.getElementById('sosModal').classList.remove('hidden'); document.getElementById('sosModal').setAttribute('aria-hidden', 'false'); renderSOSContacts(); }
function closeSOS() { const m = document.getElementById('sosModal'); if (m) { m.classList.add('hidden'); m.setAttribute('aria-hidden', 'true'); } }

function addFamilyContact() {
  const name = document.getElementById('sosNewName').value.trim();
  const phone = document.getElementById('sosNewPhone').value.trim();
  if (!name || !phone) { toast('Enter a name and phone number'); return; }
  const list = sosContacts();
  list.push({ name, phone });
  localStorage.setItem('sevyo_family_contacts', JSON.stringify(list));
  document.getElementById('sosNewName').value = '';
  document.getElementById('sosNewPhone').value = '';
  renderSOSContacts();
  toast('Family contact added');
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