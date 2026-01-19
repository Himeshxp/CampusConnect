// ============= Campus Connect Portal - Vanilla JS =============

// Where are the events cards coming from?
// Explanation: The event cards displayed throughout the portal are generated from the data returned by the getEvents() function (see below).
// - The getEvents() function is an asynchronous function that returns a promise resolving to an array of event objects (hardcoded as placeholders for now).
// - This function is called and its result is assigned to the global variable eventsData in several places (see the render function).
// - The appropriate data rendering function (such as renderEventsList() or renderUpcomingEvents()) then uses eventsData to generate HTML for each card, mapping each event object to a block of HTML.
// - These HTML blocks are inserted into containers in the DOM, such as those with id="events-list" or id="upcoming-events" (see renderEventsList and renderUpcomingEvents below).
// See more inline explanations in the relevant functions below.
const API_BASE = '/api';

// Auth APIs
async function loginStudent(email, password) {
  // TODO: Replace with actual API endpoint
  console.log('Login student:', { email, password });
  return { success: true, user: { id: 1, email, role: 'student', name: 'John Student' } };
  // return fetch(`${API_BASE}/auth/student/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // }).then(res => res.json());
}

async function loginStaff(email, password) {
  // TODO: Replace with actual API endpoint
  console.log('Login staff:', { email, password });
  return { success: true, user: { id: 1, email, role: 'staff', name: 'Jane Staff' } };
  // return fetch(`${API_BASE}/auth/staff/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // }).then(res => res.json());
}

async function logout() {
  // TODO: Replace with actual API endpoint
  localStorage.removeItem('user');
  return { success: true };
  // return fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).then(res => res.json());
}

// Complaints APIs
async function getComplaints() {
  // Read complaints from localStorage if available so student feedback/rating persists in the demo.
  try {
    const stored = localStorage.getItem('complaintsData');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Could not read complaints from localStorage', e);
  }

  // Fallback to defaults (will be initialized by getAllComplaints on staff side)
  return [
    { id: 1, title: 'Library AC not working', category: 'Facilities', status: 'Pending', date: '2025-01-10', description: 'The air conditioning in the main library has been broken for 3 days.' },
    { id: 2, title: 'WiFi connectivity issues', category: 'IT', status: 'In-progress', date: '2025-01-08', description: 'Intermittent WiFi drops in Block B.' },
    { id: 3, title: 'Cafeteria food quality', category: 'Food', status: 'Resolved', date: '2025-01-05', description: 'Food quality has been declining.' },
  ];
  // return fetch(`${API_BASE}/complaints`).then(res => res.json());
}

async function getAllComplaints() {
  // For demo: persist complaints to localStorage so ratings/feedback survive reloads.
  try {
    const stored = localStorage.getItem('complaintsData');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Could not read complaints from localStorage', e);
  }

  const defaults = [
    { id: 1, title: 'Library AC not working', category: 'Facilities', status: 'Pending', date: '2025-01-10', studentName: 'John Doe', description: 'The AC is broken.', rated: false },
    { id: 2, title: 'WiFi connectivity issues', category: 'IT', status: 'In-progress', date: '2025-01-08', studentName: 'Jane Smith', description: 'WiFi keeps dropping.', rated: false },
    { id: 3, title: 'Cafeteria food quality', category: 'Food', status: 'Resolved', date: '2025-01-05', studentName: 'Mike Johnson', description: 'Food quality issue.', rated: false },
    { id: 4, title: 'Broken desk in Room 201', category: 'Facilities', status: 'Pending', date: '2025-01-12', studentName: 'Sarah Wilson', description: 'Desk is wobbly.', rated: false },
  ];

  try { localStorage.setItem('complaintsData', JSON.stringify(defaults)); } catch (e) { /* ignore */ }
  return defaults;
  // return fetch(`${API_BASE}/staff/complaints`).then(res => res.json());
}

async function submitComplaint(data) {
  // Demo implementation: assign a small incremental id (based on stored complaints)
  console.log('Submit complaint:', data);
  try {
    const raw = localStorage.getItem('complaintsData');
    let stored = [];
    if (raw) {
      try { stored = JSON.parse(raw) || []; } catch (e) { stored = []; }
    }
    const ids = stored.map(c => Number(c.id)).filter(n => Number.isFinite(n));
    const maxId = ids.length ? Math.max(...ids) : 0;
    const nextId = maxId + 1;
    return { success: true, id: nextId };
  } catch (err) {
    console.warn('Could not determine next complaint id, falling back to timestamp', err);
    return { success: true, id: Date.now() };
  }
  // const formData = new FormData();
  // Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  // return fetch(`${API_BASE}/complaints`, {
  //   method: 'POST',
  //   body: formData
  // }).then(res => res.json());
}

async function updateComplaintStatus(id, status) {
  // For demo: update the stored complaintsData in localStorage so students see status changes.
  console.log('Update complaint status:', { id, status });
  try {
    // Try to load stored complaints (fall back to in-memory complaintsData)
    let stored = [];
    try {
      const raw = localStorage.getItem('complaintsData');
      stored = raw ? JSON.parse(raw) : (Array.isArray(complaintsData) ? complaintsData : []);
    } catch (e) {
      stored = Array.isArray(complaintsData) ? complaintsData : [];
    }

    const idx = stored.findIndex(c => c.id === id);
    if (idx !== -1) {
      stored[idx].status = status;
      // persist
      try { localStorage.setItem('complaintsData', JSON.stringify(stored)); } catch (e) { console.warn('Could not persist complaints to localStorage', e); }
      // update in-memory copy
      if (Array.isArray(complaintsData)) {
        const mem = complaintsData.find(c => c.id === id);
        if (mem) mem.status = status;
      }
      return { success: true };
    }
  } catch (err) {
    console.warn('Failed updating complaint status in storage', err);
  }
  return { success: false };
}

// Events APIs
async function getEvents() {
  // If an events list has been persisted in localStorage (edits from staff), return that first.
  try {
    const stored = localStorage.getItem('eventsData');
    if (stored) {
      // return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Could not parse events from localStorage', e);
  }

  // Defaults used on first load. We also persist them to localStorage so edits will survive page navigation.
  const defaults = [
    { id: 1, title: 'Tech Symposium 2025', imgsrc: '', date: '2025-02-15', description: 'Annual technology conference featuring industry speakers.', registered: false, registrations: 45 },
    { id: 2, title: 'Cultural Fest', imgsrc: '', date: '2025-02-15', registered: false, registrations: 120 },
    { id: 3, title: 'Career Fair', imgsrc: '', date: '2025-03-01', description: 'Meet top employers and explore internship opportunities.', registered: false, registrations: 200 },
    { id: 4, title: 'Sports Day', imgsrc: '', date: '2025-03-10', description: 'Inter-department sports competition.', registered: false, registrations: 80 },
  ];

  try {
    localStorage.setItem('eventsData', JSON.stringify(defaults));
  } catch (e) {
    /* ignore */
  }

  return defaults;
  // return fetch(`${API_BASE}/events`).then(res => res.json());
}

async function registerForEvent(eventId) {
  // TODO: Replace with actual API endpoint
  console.log('Register for event:', eventId);
  return { success: true };
  // return fetch(`${API_BASE}/events/${eventId}/register`, {
  //   method: 'POST'
  // }).then(res => res.json());
}

async function unregisterForEvent(eventId) {
  // TODO: Replace with actual API endpoint
  console.log('Unregister for event:', eventId);
  return { success: true };
  // return fetch(`${API_BASE}/events/${eventId}/unregister`, {
  //   method: 'POST'
  // }).then(res => res.json());
}

async function createEvent(data) {
  // TODO: Replace with actual API endpoint
  console.log('Create event:', data);
  return { success: true, id: Date.now() };
  // const formData = new FormData();
  // Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  // return fetch(`${API_BASE}/events`, {
  //   method: 'POST',
  //   body: formData
  // }).then(res => res.json());
}

async function deleteEvent(eventId) {
  // TODO: Replace with actual API endpoint
  console.log('Delete event:', eventId);
  return { success: true };
  // return fetch(`${API_BASE}/events/${eventId}`, {
  //   method: 'DELETE'
  // }).then(res => res.json());
}

async function updateEvent(eventId) {
    openEventModal(eventId)
}

// Stats APIs
async function getStudentStats() {
  // TODO: Replace with actual API endpoint
  return {
    totalComplaints: 3,
    pendingComplaints: 1,
    eventsRegistered: 2,
  };
  // return fetch(`${API_BASE}/student/stats`).then(res => res.json());
}

async function getStaffStats() {
  // TODO: Replace with actual API endpoint
  return {
    totalComplaints: 15,
    pendingComplaints: 5,
    inProgressComplaints: 4,
    resolvedComplaints: 6,
    totalEvents: 4,
    upcomingEvents: 3,
  };
  // return fetch(`${API_BASE}/staff/stats`).then(res => res.json());
}

// ========== State Management ==========
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentPage = 'landing';
// The following variable is used as the source for event cards on all event-related screens.
let complaintsData = [];
let eventsData = []; // Events card data is stored here after getEvents() is called.
let statsData = {};
// selectedEventId stores the id of the event being edited in the "event-edit" page
let selectedEventId = null;

// ========== Theme Management ==========
// Tracks current theme ('light' | 'dark'). Defaults to saved value or system preference.
let currentTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/*
TODO: Change The Logo's Image Accordingly to the Theme, logo Image for darkmode = 'Campus-darkmode.png', and for light mode 'Campus.png'.
? DOM img item => document.querySelector('.logo-img img')
*/

function applyTheme(theme) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  try {
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'dark' : 'light');
  } catch (e) {
    console.warn('Could not apply theme attribute', e);
  }
  try {
    localStorage.setItem('theme', currentTheme);
  } catch (e) {
    /* ignore */
  }
  // Update any theme icons that exist in the DOM (navbars, etc.)
  const icons = document.querySelectorAll('.theme-toggle .material-icons-round');
  icons.forEach(i => i.textContent = currentTheme === 'dark' ? 'dark_mode' : 'light_mode');
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  applyTheme(currentTheme);
}

// Initialize theme on load
initTheme();
// Ensure theme icons/text are correct once DOM is ready (covers inline template buttons)
document.addEventListener('DOMContentLoaded', () => applyTheme(currentTheme));

// ========== Routing ==========
function navigate(page) {
  // page may include query params (e.g. 'event-edit?id=1').
  // Store fullPage in history state but set currentPage to the base page (before '?') so render() matches cases.
  const base = String(page).split('?')[0];
  currentPage = base || 'landing';
  render();
  window.history.pushState({ fullPage: page }, '', `#${page}`);
}

window.addEventListener('popstate', (e) => {
  // When navigating via browser controls, prefer the fullPage in state if available,
  // but always set currentPage to the base page name (before any '?').
  const statePage = e.state?.fullPage || e.state?.page;
  if (statePage) {
    currentPage = String(statePage).split('?')[0] || getPageFromHash();
  } else {
    currentPage = getPageFromHash();
  }
  render();
});

function getPageFromHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return 'landing';
  // Support optional query string like 'event-edit?id=3' — return only the page part before '?'
  const page = hash.split('?')[0];
  return page || 'landing';
}

// ========== Icon Helper ==========
function icon(name) {
  return `<span class="material-icons-round">${name}</span>`;
}

// ========== Template Helper ==========
function cloneTemplate(templateId) {
  const template = document.getElementById(`template-${templateId}`);
  if (!template) {
    console.error(`Template not found: template-${templateId}`);
    return null;
  }
  return template.content.cloneNode(true);
}

// ========== Components ==========
function renderLandingPage() {
  const clone = cloneTemplate('landing');
  return clone ? clone : document.createDocumentFragment();
}

function renderStudentLoginPage() {
  const clone = cloneTemplate('student-login');
  return clone ? clone : document.createDocumentFragment();
}

function renderStaffLoginPage() {
  const clone = cloneTemplate('staff-login');
  return clone ? clone : document.createDocumentFragment();
}

function renderNavbar(role, activePage) {
  const isStudent = role === 'student';
  const links = isStudent 
    ? [
        { page: 'student-dashboard', label: 'Home', icon: 'home' },
        { page: 'student-complaints', label: 'Complaints', icon: 'report_problem' },
        { page: 'student-events', label: 'Events', icon: 'event' },
      ]
    : [
        { page: 'staff-dashboard', label: 'Home', icon: 'home' },
        { page: 'staff-complaints', label: 'Complaints', icon: 'report_problem' },
        { page: 'staff-events', label: 'Events', icon: 'event' },
      ];
  
  const clone = cloneTemplate('navbar');
  if (!clone) return document.createDocumentFragment();
  
  const nav = clone.querySelector('nav');
  const brand = nav.querySelector('[data-nav-brand]');
  const linksContainer = nav.querySelector('[data-nav-links]');
  const mobileNav = nav.querySelector('[data-nav-mobile]');
  const userSpan = nav.querySelector('[data-nav-user]');
  
  brand.setAttribute('onclick', `navigate('${isStudent ? 'student-dashboard' : 'staff-dashboard'}'); return false;`);
  userSpan.textContent = currentUser?.name || 'User';
  // Ensure the theme icon in this cloned navbar reflects current theme
  const themeIconEl = nav.querySelector('.theme-toggle .material-icons-round');
  if (themeIconEl) themeIconEl.textContent = currentTheme === 'dark' ? 'dark_mode' : 'light_mode';
  
  links.forEach(link => {
    const linkEl = document.createElement('a');
    linkEl.href = '#';
    linkEl.className = `navbar-link ${activePage === link.page ? 'active' : ''}`;
    linkEl.setAttribute('onclick', `navigate('${link.page}'); return false;`);
    linkEl.innerHTML = `${icon(link.icon)} ${link.label}`;
    linksContainer.appendChild(linkEl);
    
    const mobileLink = document.createElement('button');
    mobileLink.className = `navbar-mobile-link ${activePage === link.page ? 'active' : ''}`;
    mobileLink.setAttribute('onclick', `navigate('${link.page}'); closeMobileNav();`);
    mobileLink.innerHTML = `${icon(link.icon)} ${link.label}`;
    mobileNav.appendChild(mobileLink);
  });
  
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'navbar-mobile-link logout';
  logoutBtn.setAttribute('onclick', 'handleLogout()');
  logoutBtn.innerHTML = `${icon('logout')} Logout`;
  mobileNav.appendChild(logoutBtn);
  
  return clone;
}

function renderStatCard(title, value, iconName, variant = 'default') {
  return `
    <div class="stat-card stat-card-${variant}">
      <div class="stat-card-icon">${icon(iconName)}</div>
      <div class="stat-card-content">
        <div class="stat-card-title">${title}</div>
        <div class="stat-card-value">${value}</div>
      </div>
    </div>
  `;
}

function renderStatusBadge(status) {
  const statusClass = status === 'Pending' ? 'status-pending' 
    : status === 'In-progress' ? 'status-in-progress' 
    : 'status-resolved';
  return `<span class="status-badge ${statusClass}">${status}</span>`;
}

function renderStudentDashboard() {
  const clone = cloneTemplate('student-dashboard');
  if (!clone) return document.createDocumentFragment();
  
  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('student', 'student-dashboard');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }
  
  const titleEl = clone.querySelector('[data-dashboard-title]');
  if (titleEl) {
    titleEl.textContent = `Welcome back, ${currentUser?.name || 'Student'}!`;
  }
  
  const statsSection = clone.querySelector('#student-stats');
  if (statsSection) {
    statsSection.innerHTML = `
      ${renderStatCard('Total Complaints', statsData.totalComplaints || 0, 'description', 'default')}
      ${renderStatCard('Pending', statsData.pendingComplaints || 0, 'pending', 'warning')}
      ${renderStatCard('Events Registered', statsData.eventsRegistered || 0, 'event_available', 'success')}
    `;
  }
  
  return clone;
}

function renderStudentComplaints() {
  const clone = cloneTemplate('student-complaints');
  if (!clone) return document.createDocumentFragment();
  
  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('student', 'student-complaints');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }
  
  return clone;
}

function renderStudentEvents() {
  const clone = cloneTemplate('student-events');
  if (!clone) return document.createDocumentFragment();
  
  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('student', 'student-events');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }
  
  return clone;
}

function renderStaffDashboard() {
  const resolutionRate = statsData.totalComplaints > 0 
    ? Math.round((statsData.resolvedComplaints / statsData.totalComplaints) * 100) 
    : 0;
  
  const clone = cloneTemplate('staff-dashboard');
  if (!clone) return document.createDocumentFragment();
  
  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('staff', 'staff-dashboard');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }
  
  const statsSection = clone.querySelector('#staff-stats');
  if (statsSection) {
    statsSection.innerHTML = `
      ${renderStatCard('Total Complaints', statsData.totalComplaints || 0, 'description', 'default')}
      ${renderStatCard('Pending', statsData.pendingComplaints || 0, 'pending', 'warning')}
      ${renderStatCard('In Progress', statsData.inProgressComplaints || 0, 'autorenew', 'primary')}
      ${renderStatCard('Resolved', statsData.resolvedComplaints || 0, 'check_circle', 'success')}
    `;
  }
  
  const progressFill = clone.querySelector('[data-resolution-progress]');
  const progressLabel = clone.querySelector('[data-resolution-label]');
  if (progressFill) progressFill.style.width = `${resolutionRate}%`;
  if (progressLabel) progressLabel.textContent = `${resolutionRate}% resolved`;
  
  const totalEvents = clone.querySelector('[data-total-events]');
  const upcomingEvents = clone.querySelector('[data-upcoming-events]');
  if (totalEvents) totalEvents.textContent = statsData.totalEvents || 0;
  if (upcomingEvents) upcomingEvents.textContent = statsData.upcomingEvents || 0;
  
  return clone;
}

function renderStaffComplaints() {
  const clone = cloneTemplate('staff-complaints');
  if (!clone) return document.createDocumentFragment();
  
  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('staff', 'staff-complaints');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }
  
  return clone;
}

function renderStaffEvents() {
  const clone = cloneTemplate('staff-events');
  if (!clone) return document.createDocumentFragment();
  
  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('staff', 'staff-events');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }
  
  return clone;
}

function renderNotFound() {
  const clone = cloneTemplate('not-found');
  return clone ? clone : document.createDocumentFragment();
}

// ========== Event Handlers ==========
async function handleStudentLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const result = await loginStudent(email, password);
  if (result.success) {
    currentUser = result.user;
    localStorage.setItem('user', JSON.stringify(currentUser));
    navigate('student-dashboard');
  }
}

async function handleStaffLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const result = await loginStaff(email, password);
  if (result.success) {
    currentUser = result.user;
    localStorage.setItem('user', JSON.stringify(currentUser));
    navigate('staff-dashboard');
  }
}

async function handleLogout() {
  await logout();
  currentUser = null;
  navigate('landing');
}

function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  nav.classList.toggle('open');
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  nav.classList.remove('open');
}

function openComplaintModal() {
  document.getElementById('complaint-modal').classList.remove('hidden');
}

function closeComplaintModal() {
  document.getElementById('complaint-modal').classList.add('hidden');
}

function openEventModal() {
  document.getElementById('event-modal').classList.remove('hidden');
}

function closeEventModal() {
  document.getElementById('event-modal').classList.add('hidden');
}

function openDetailsModal(complaint) {
  const details = document.getElementById('complaint-details');
  details.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <div style="font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground);">Title</div>
        <div style="color: var(--foreground);">${complaint.title}</div>
      </div>
      <div>
        <div style="font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground);">Category</div>
        <div style="color: var(--foreground);">${complaint.category}</div>
      </div>
      <div>
        <div style="font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground);">Student</div>
        <div style="color: var(--foreground);">${complaint.studentName}</div>
      </div>
      <div>
        <div style="font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground);">Status</div>
        <div>${renderStatusBadge(complaint.status)}</div>
      </div>
      <div>
        <div style="font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground);">Description</div>
        <div style="color: var(--muted-foreground); margin-top: 0.25rem;">${complaint.description}</div>
      </div>
      ${complaint.rated ? `
      <div>
        <div style="font-size: 0.875rem; font-weight: 500; color: var(--muted-foreground); margin-top:0.5rem;">Feedback</div>
        <div style="margin-top:0.25rem;">
          <div style="font-weight:600;">Rating: ${'★'.repeat(complaint.rating || 0)}${'☆'.repeat(5 - (complaint.rating || 0))}</div>
          ${complaint.feedbackTags && complaint.feedbackTags.length ? `<div style="margin-top:0.5rem;">Tags: ${complaint.feedbackTags.map(t => `<span style=\"margin-right:0.5rem;\">${t}</span>`).join('')}</div>` : ''}
          ${complaint.feedbackText ? `<div style="margin-top:0.5rem;color:var(--muted-foreground);">${complaint.feedbackText}</div>` : ''}
        </div>
      </div>
      ` : ''}
    </div>
  `;
  document.getElementById('details-modal').classList.remove('hidden');
}

function closeDetailsModal() {
  document.getElementById('details-modal').classList.add('hidden');
}

// ========== Rating Modal Logic ==========
let ratingState = {
  complaintId: null,
  rating: 0,
  tags: new Set(),
};

function openRatingModal(complaintId) {
  // Only students can submit ratings
  if (currentUser?.role !== 'student') {
    alert('Only students can submit feedback for complaints.');
    return;
  }

  ratingState = { complaintId, rating: 0, tags: new Set() };
  const modal = document.getElementById('rating-modal');
  if (!modal) return;

  // render stars
  const starsContainer = modal.querySelector('#rating-stars');
  starsContainer.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const span = document.createElement('button');
    span.type = 'button';
    span.className = 'rating-star';
    span.style.fontSize = '1.6rem';
    span.style.background = 'transparent';
    span.style.border = 'none';
    span.style.cursor = 'pointer';
    span.textContent = '☆';
    span.dataset.value = i;
    span.onclick = () => {
      ratingState.rating = i;
      updateStarDisplay(starsContainer, i);
    };
    starsContainer.appendChild(span);
  }

  // setup tags
  const tagsContainer = modal.querySelectorAll('.tag-btn');
  tagsContainer.forEach(btn => {
    btn.classList.remove('active');
    btn.onclick = () => {
      const tag = btn.dataset.tag;
      if (ratingState.tags.has(tag)) {
        ratingState.tags.delete(tag);
        btn.classList.remove('active');
      } else {
        ratingState.tags.add(tag);
        btn.classList.add('active');
      }
    };
  });

  // clear comment
  modal.querySelector('#rating-comment').value = '';

  modal.classList.remove('hidden');
}

function updateStarDisplay(container, value) {
  const children = Array.from(container.children);
  children.forEach(ch => {
    const v = Number(ch.dataset.value);
    ch.textContent = v <= value ? '★' : '☆';
    ch.style.color = v <= value ? 'gold' : '';
  });
}

function closeRatingModal() {
  const modal = document.getElementById('rating-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  ratingState = { complaintId: null, rating: 0, tags: new Set() };
}

async function handleSubmitRating(e) {
  e.preventDefault();
  if (!ratingState || !ratingState.complaintId) return;

  const comment = document.getElementById('rating-comment').value.trim();
  const tags = Array.from(ratingState.tags);
  const rating = ratingState.rating || 0;

  const complaint = complaintsData.find(c => c.id === ratingState.complaintId);
  if (!complaint) {
    alert('Complaint not found');
    return;
  }

  // save rating data
  complaint.rated = true;
  complaint.rating = rating;
  complaint.feedbackText = comment;
  complaint.feedbackTags = tags;

  // persist
  try { localStorage.setItem('complaintsData', JSON.stringify(complaintsData)); } catch (err) { console.warn(err); }

  closeRatingModal();
  // Re-render the appropriate complaints table depending on current page
  if (currentPage === 'staff-complaints') renderStaffComplaintsTable();
  if (currentPage === 'student-complaints') renderComplaintsTable();
  alert('Thanks for your feedback');
}

function closeModal(e, modalId) {
  if (e.target.classList.contains('modal-overlay')) {
    document.getElementById(modalId).classList.add('hidden');
  }
}

async function handleSubmitComplaint(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById('complaint-title').value,
    category: document.getElementById('complaint-category').value,
    description: document.getElementById('complaint-description').value,
    file: document.getElementById('complaint-file').files[0],
  };
  
  const result = await submitComplaint(data);
  if (result.success) {
    const newComplaint = {
      id: result.id,
      title: data.title,
      category: data.category,
      description: data.description,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      studentName: currentUser?.name || 'Student',
      rated: false,
    };

    // update in-memory list
    complaintsData.push(newComplaint);

    // persist so staff can see it as well
    try {
      const raw = localStorage.getItem('complaintsData');
      const stored = raw ? JSON.parse(raw) : [];
      stored.push(newComplaint);
      localStorage.setItem('complaintsData', JSON.stringify(stored));
    } catch (err) {
      console.warn('Could not persist new complaint to localStorage', err);
    }

    closeComplaintModal();
    renderComplaintsTable();
    alert('Complaint submitted successfully!');
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById('event-title').value,
    date: document.getElementById('event-date').value,
    description: document.getElementById('event-description').value,
    image: document.getElementById('event-image').files[0],
  };
  
  const result = await createEvent(data);
  if (result.success) {
    eventsData.push({
      id: result.id,
      title: data.title,
      date: data.date,
      description: data.description,
      imgsrc: '', // file uploads not implemented in this demo; leave blank or add URL
      registered: false,
      registrations: 0,
    });
    try { localStorage.setItem('eventsData', JSON.stringify(eventsData)); } catch (e) { /* ignore */ }
    closeEventModal();
    renderStaffEventsTable();
    alert('Event created successfully!');
  }
}

async function handleRegisterEvent(eventId) {
  const event = eventsData.find(e => e.id === eventId);
  if (!event) return;
  
  if (event.registered) {
    // Unregister
    const result = await unregisterForEvent(eventId);
    if (result.success) {
      event.registered = false;
      if (event.registrations > 0) {
        event.registrations--;
      }
      renderEventsList();
      renderUpcomingEvents();
    }
  } else {
    // Register
    const result = await registerForEvent(eventId);
    if (result.success) {
      event.registered = true;
      event.registrations++;
      renderEventsList();
      renderUpcomingEvents();
    }
  }
}

async function handleUpdateStatus(id, status) {
  const result = await updateComplaintStatus(id, status);
  if (result.success) {
    const complaint = complaintsData.find(c => c.id === id);
    if (complaint) complaint.status = status;
    renderStaffComplaintsTable();
  }
}

async function handleDeleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    const result = await deleteEvent(eventId);
    if (result.success) {
      eventsData = eventsData.filter(e => e.id !== eventId);
      try { localStorage.setItem('eventsData', JSON.stringify(eventsData)); } catch (e) { /* ignore */ }
      renderStaffEventsTable();
    }
  }
}

async function handleUpdateEvent(eventId) {
    updateEventTable(eventId);
}

function filterComplaints() {
  renderComplaintsTable();
}

function filterEvents() {
  renderEventsList();
}

function filterStaffComplaints() {
  renderStaffComplaintsTable();
}

// ========== Data Rendering ==========

// For events, event cards are rendered by looping through eventsData and generating HTML for each.
// eventsData is updated whenever getEvents() is called - see render() below.
function renderComplaintsTable() {
  const tbody = document.getElementById('complaints-table');
  if (!tbody) return;
  
  const categoryFilter = document.getElementById('category-filter')?.value || 'all';
  const statusFilter = document.getElementById('status-filter')?.value || 'all';
  
  let filtered = complaintsData.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No complaints found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(complaint => `
    <tr>
      <td>${complaint.title}</td>
      <td>${complaint.category}</td>
      <td>${renderStatusBadge(complaint.status)}</td>
      <td>${complaint.date}</td>
      <td>
        <div class="action-buttons">
          ${complaint.status === 'Resolved' && (currentUser?.role === 'student') ? (
            complaint.rated ? `<button class="btn btn-ghost btn-sm" disabled>Thanks for feedback</button>` : `<button class="btn btn-ghost btn-sm" onclick="openRatingModal(${complaint.id})">⭐ Rate</button>`
          ) : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// Function to Check Image's Availability
  function getImageSrc(src) {
    if (!src || src.trim() === '') {
      return 'fallback.webp';
    }
    return src;
  }


// Here, the events cards are populated from eventsData, which is updated from getEvents().
function renderEventsList() {
  const container = document.getElementById('events-list');
  if (!container) return;
  
  const search = document.getElementById('event-search')?.value?.toLowerCase() || '';
  
  let filtered = eventsData.filter(e => {
    if (search && !e.title.toLowerCase().includes(search) && !e.description.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">No events found</div>';
    return;
  }

  container.innerHTML = filtered.map(event => `
    <div class="event-card">
    <img 
      class="event-card-image" 
      src="${getImageSrc(event.imgsrc)}"
      onerror="this.onerror=null; this.src='fallback.webp';"
      alt="Event Image" 
      width="100%"
    />
    <hr style="margin-bottom: 1em;">
      <div class="event-card-header">
        <h3 class="event-card-title">${event.title}</h3>
        ${event.registered ? '<span class="status-badge badge-registered">Registered</span>' : ''}
      </div>
      <div class="event-card-date">
        ${icon('calendar_today')} ${event.date}
      </div>
      <p class="event-card-description">${event.description}</p>
      <div class="event-card-footer">
        <div class="event-card-registrations">
          ${icon('people')} ${event.registrations} registered
        </div>
        ${event.registered 
          ? `<button class="btn btn-primary btn-sm unregister-btn" onclick="handleRegisterEvent(${event.id})">Unregister</button>` 
          : `<button class="btn btn-primary btn-sm register-btn" onclick="handleRegisterEvent(${event.id})">Register</button>`
        }
      </div>
    </div>
  `).join('');
}

// Upcoming events cards also use eventsData (subset of first 3 items).
function renderUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  
  const upcoming = eventsData.slice(0, 2);
  
  if (upcoming.length === 0) {
    container.innerHTML = '<div class="empty-state">No upcoming events</div>';
    return;
  }

  // EVENT CARD GENERATOR
  container.innerHTML = upcoming.map(event => `
    <div class="event-card">
    <img 
      class="event-card-image"
      src="${getImageSrc(event.imgsrc)}"
      onerror="this.onerror=null; this.src='fallback.webp';"
      alt="Event Image"
      width="100%"
      style="height: auto;"
    />
    <hr style="margin-bottom: 1em;">
      <div class="event-card-header">
        <h3 class="event-card-title">${event.title}</h3>
        ${event.registered ? '<span class="status-badge badge-registered">Registered</span>' : ''}
      </div>
      <div class="event-card-date">
        ${icon('calendar_today')} ${event.date}
      </div>
      <p class="event-card-description">${event.description}</p>
      <div class="event-card-footer">
        <div class="event-card-registrations">
          ${icon('people')} ${event.registrations} registered
        </div>
        ${event.registered 
          ? `<button class="btn btn-primary btn-sm unregister-btn" onclick="handleRegisterEvent(${event.id})">Unregister</button>`
          : `<button class="btn btn-primary btn-sm register-btn" onclick="handleRegisterEvent(${event.id})">Register</button>`
        }
      </div>
    </div>
  `).join('');
}

function renderStaffComplaintsTable() {
  const tbody = document.getElementById('staff-complaints-table');
  if (!tbody) return;
  
  const search = document.getElementById('complaint-search')?.value?.toLowerCase() || '';
  const categoryFilter = document.getElementById('staff-category-filter')?.value || 'all';
  const statusFilter = document.getElementById('staff-status-filter')?.value || 'all';
  
  let filtered = complaintsData.filter(c => {
    if (search && !c.title.toLowerCase().includes(search) && !c.studentName?.toLowerCase().includes(search)) {
      return false;
    }
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No complaints found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(complaint => `
    <tr>
      <td>#${complaint.id}</td>
      <td>${complaint.title}</td>
      <td>${complaint.studentName || 'N/A'}</td>
      <td>${complaint.category}</td>
      <td>${complaint.date}</td>
      <td>
        <select class="status-select" value="${complaint.status}" onchange="handleUpdateStatus(${complaint.id}, this.value)">
          <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In-progress" ${complaint.status === 'In-progress' ? 'selected' : ''}>In-progress</option>
          <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-ghost btn-sm" onclick='openDetailsModal(${JSON.stringify(complaint)})'>
            ${icon('visibility')}
          </button>
          ${complaint.rated ? `<button class="btn btn-ghost btn-sm" onclick='openDetailsModal(${JSON.stringify(complaint)})'>View feedback</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStaffEventsTable() {
  const tbody = document.getElementById('staff-events-table');
  if (!tbody) return;
  
  if (eventsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No events found</td></tr>';
    return;
  }
  
  tbody.innerHTML = eventsData.map(event => `
    <tr>
      <td><img src="${getImageSrc(event.imgsrc)}" height="100" alt="event image"></td>
      <td>${event.title}</td>
      <td>${event.date}</td>
      <td>
        <div class="event-card-registrations">
          ${icon('people')} ${event.registrations}
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-destructive" onclick="handleDeleteEvent(${event.id})">
            ${icon('delete')}
          </button>
          <button class="btn btn-neutral" onclick="updateEventModel(${event.id})">
            ${icon('edit')}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateEventModal() {

}

// Called when user clicks the edit button in the staff events table.
// This sets the selected event id and navigates to the dedicated edit page.
function updateEventModel(eventId) {
  selectedEventId = eventId;
  // Navigate including the id so the URL can be deep-linked and reloads keep the selected id
  navigate(`event-edit?id=${eventId}`);
}

// Render the event edit page template and populate fields from eventsData.
function renderEventEdit() {
  const clone = cloneTemplate('event-edit');
  if (!clone) return document.createDocumentFragment();

  const navbarPlaceholder = clone.querySelector('[data-navbar-placeholder]');
  const navbar = renderNavbar('staff', '');
  if (navbarPlaceholder && navbar) {
    const navElement = navbar.querySelector('nav');
    if (navElement) navbarPlaceholder.replaceWith(navElement);
  }

  // Populate form fields directly on the cloned fragment to avoid timing/attachment issues.
  const event = eventsData.find(e => e.id === selectedEventId) || {};
  try {
    const titleEl = clone.querySelector('#event-edit-title');
    const dateEl = clone.querySelector('#event-edit-date');
    const descEl = clone.querySelector('#event-edit-description');
    const imgEl = clone.querySelector('#event-edit-image');
    const regEl = clone.querySelector('#event-edit-registrations');

    if (titleEl) titleEl.value = event.title || '';
    if (dateEl) dateEl.value = event.date || '';
    if (descEl) descEl.value = event.description || '';
    if (imgEl) imgEl.value = event.imgsrc || '';
    if (regEl) regEl.value = event.registrations || 0;
  } catch (err) {
    console.warn('Could not populate event edit fields on clone', err);
  }

  return clone;
}

// Handle saving edits from the edit page form.
async function handleSaveEditedEvent(e) {
  e.preventDefault();
  if (selectedEventId == null) {
    alert('No event selected to edit');
    return;
  }

  const title = document.getElementById('event-edit-title').value.trim();
  const date = document.getElementById('event-edit-date').value;
  const description = document.getElementById('event-edit-description').value.trim();
  const imgsrc = document.getElementById('event-edit-image').value.trim();
  const registrationsInput = document.getElementById('event-edit-registrations')?.value;
  // Parse registrations as integer, default to 0 and ensure non-negative
  let registrations = 0;
  if (registrationsInput !== undefined && registrationsInput !== null && String(registrationsInput).trim() !== '') {
    registrations = parseInt(registrationsInput, 10);
    if (Number.isNaN(registrations) || registrations < 0) registrations = 0;
  }

  // Update local in-memory event object (placeholder for real API update)
  const ev = eventsData.find(ei => ei.id === selectedEventId);
  if (!ev) {
    alert('Event not found');
    return;
  }

  ev.title = title;
  ev.date = date;
  ev.description = description;
  ev.imgsrc = imgsrc;
  ev.registrations = registrations;

  // Placeholder API call - could be replaced with real updateEvent API
  try {
    // If an API existed, we'd call something like: await updateEventApi(selectedEventId, ev)
  } catch (err) {
    console.error('Failed to update event via API', err);
  }

  // Persist updated events list so the change survives navigation/reloads (until backend is wired)
  try {
    localStorage.setItem('eventsData', JSON.stringify(eventsData));
  } catch (e) {
    console.warn('Could not persist events to localStorage', e);
  }

  // After save, navigate back to staff events and refresh table
  navigate('staff-events');
  // ensure events are present and re-render the table
  renderStaffEventsTable();
  alert('Event updated successfully');
}

// ========== Main Render Function ==========
// This function controls which page is visible and updates data accordingly.
// For example, when the Events page is shown, it updates eventsData using getEvents(), which means all event cards on that page use the array getEvents() returns.
async function render() {
  const app = document.getElementById('app');
  
  // Check auth for protected pages
  const protectedStudentPages = ['student-dashboard', 'student-complaints', 'student-events'];
  const protectedStaffPages = ['staff-dashboard', 'staff-complaints', 'staff-events'];
  
  if (protectedStudentPages.includes(currentPage) && (!currentUser || currentUser.role !== 'student')) {
    navigate('student-login');
    return;
  }
  
  if (protectedStaffPages.includes(currentPage) && (!currentUser || currentUser.role !== 'staff')) {
    navigate('staff-login');
    return;
  }
  
  // Clear app and render page
  app.innerHTML = '';
  
  // Render page
  switch (currentPage) {
    case 'landing':
      app.appendChild(renderLandingPage());
      // Query the element after it's been rendered to the DOM
      const heroText = document.querySelector('.hero-highlight');
      const description = document.querySelector('.hero-description');
      
      // Helper function to animate text letter by letter
      function animateText(element, delay = 0, letterDelay = 30) {
        if (!element || !element.textContent) return 0;
        
        const text = element.textContent;
        // Wrap each letter in a span with initial opacity 0
        const wrappedText = [...text].map((letter) => {
          // Preserve spaces and newlines
          if (letter === ' ') return ' ';
          if (letter === '\n') return '\n';
          return `<span class="letter-animate" style="opacity: 0;">${letter}</span>`;
        }).join('');
        element.innerHTML = wrappedText;
        
        // Animate letters one by one
        const letters = element.querySelectorAll('.letter-animate');
        letters.forEach((letter, index) => {
          setTimeout(() => {
            letter.style.transition = 'opacity 0.3s ease-in-out';
            letter.style.opacity = '1';
          }, delay + (index * letterDelay));
        });
        
        return letters.length * letterDelay; // Return total animation duration
      }
      
      // Animate hero-highlight first, then description
      if (heroText && description) {
        // Store original text for glare effect
        const originalText = heroText.textContent;
        heroText.setAttribute('data-text', originalText);
        
        // Fade in hero-highlight element with opacity animation
        heroText.style.opacity = '0';
        heroText.style.transition = 'opacity 0.6s ease-in-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), letter-spacing 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // Start opacity fade-in, then letter animation
        setTimeout(() => {
          heroText.style.opacity = '1';
        }, 0);
        
        // Remove inline transition after animation completes to allow CSS to take over
        setTimeout(() => {
          heroText.style.transition = '';
        }, 600);
        
        const heroDuration = animateText(heroText, 300, 40); // Start letter animation after 300ms fade-in
        animateText(description, heroDuration + 150, 30); // 30ms delay between letters for description
      }
      
      break;
    case 'student-login':
      app.appendChild(renderStudentLoginPage());
      break;
    case 'staff-login':
      app.appendChild(renderStaffLoginPage());
      break;
    case 'student-dashboard':
      statsData = await getStudentStats();
      eventsData = await getEvents(); // <- This populates the cards shown via renderUpcomingEvents()
      app.appendChild(renderStudentDashboard());
      renderUpcomingEvents();
      break;
    case 'student-complaints':
      complaintsData = await getComplaints();
      app.appendChild(renderStudentComplaints());
      renderComplaintsTable();
      break;
    case 'student-events':
      eventsData = await getEvents(); // <- Event cards on this page are rendered from this
      app.appendChild(renderStudentEvents());
      renderEventsList();
      break;
    case 'staff-dashboard':
      statsData = await getStaffStats();
      app.appendChild(renderStaffDashboard());
      break;
    case 'staff-complaints':
      complaintsData = await getAllComplaints();
      app.appendChild(renderStaffComplaints());
      renderStaffComplaintsTable();
      break;
    case 'staff-events':
      eventsData = await getEvents(); // <- Event cards on this page are rendered from this
      app.appendChild(renderStaffEvents());
      renderStaffEventsTable();
      break;
    case 'event-edit':
      // Load fresh events data and render the dedicated edit page for the selected event.
      // Support deep-linking: if the hash contains an id like '#event-edit?id=3', use that id.
      eventsData = await getEvents();
      // parse id param from hash if present
      try {
        const raw = window.location.hash.slice(1);
        const qs = raw.split('?')[1] || '';
        const params = new URLSearchParams(qs);
        const id = params.get('id');
        if (id) selectedEventId = Number(id);
        // If still no selectedEventId, default to the first event so the page shows something
        if (selectedEventId == null) selectedEventId = eventsData[0]?.id || null;
      } catch (err) {
        // fallback: ensure selectedEventId has a sensible value
        if (selectedEventId == null) selectedEventId = eventsData[0]?.id || null;
      }
      app.appendChild(renderEventEdit());
      break;
    default:
      app.appendChild(renderNotFound());
  }
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
  currentPage = getPageFromHash();
  render();
});
