// ============= Campus Connect Portal - Vanilla JS =============

// Where are the events cards coming from?
// Explanation: The event cards displayed throughout the portal are generated from the data returned by the getEvents() function (see below).
// - The getEvents() function is an asynchronous function that returns a promise resolving to an array of event objects (hardcoded as placeholders for now).
// - This function is called and its result is assigned to the global variable eventsData in several places (see the render function).
// - The appropriate data rendering function (such as renderEventsList() or renderUpcomingEvents()) then uses eventsData to generate HTML for each card, mapping each event object to a block of HTML.
// - These HTML blocks are inserted into containers in the DOM, such as those with id="events-list" or id="upcoming-events" (see renderEventsList and renderUpcomingEvents below).
// See more inline explanations in the relevant functions below.
// Prefer API base configured in `index.html` (window.CAMPUSCONNECT_API_BASE) or in `.env` (REACT_APP_API_URL).
// Always normalize to exactly one trailing slash so we can safely do `${API_BASE}api/...`.
let API_BASE = window.CAMPUSCONNECT_API_BASE || 'http://localhost:8080/';

function normalizeApiBase(raw) {
  const s = String(raw || '').replace(/\/+$/, '');
  return s ? `${s}/` : '';
}

async function initApiBase() {
  // 1) If index.html sets window.CAMPUSCONNECT_API_BASE, use that.
  if (window.CAMPUSCONNECT_API_BASE) {
    API_BASE = normalizeApiBase(window.CAMPUSCONNECT_API_BASE);
    return;
  }

  // 2) Otherwise, try to read REACT_APP_API_URL from the .env file (served as a static file).
  try {
    const res = await fetch('.env', { cache: 'no-store' });
    if (!res.ok) return;
    const text = await res.text();
    const match = text.match(/^REACT_APP_API_URL=(.+)$/m);
    if (match && match[1]) {
      API_BASE = normalizeApiBase(match[1].trim());
      return;
    }
  } catch (e) {
    // If .env is missing or unreadable, silently fall back to the default.
  }

  // 3) Fall back to the default if nothing else worked.
  API_BASE = normalizeApiBase(API_BASE);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    // Keep auth/session behavior consistent with other calls.
    credentials: "include",
    ...options,
  });

  // Some endpoints may return empty body; handle safely.
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;

    // #region agent log
    fetch('http://127.0.0.1:7652/ingest/eb05b2db-ec66-4479-af8a-eb199c54b7a5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '96b9c0',
      },
      body: JSON.stringify({
        sessionId: '96b9c0',
        runId: 'complaint-run',
        hypothesisId: 'H2',
        location: 'app.js:64',
        message: 'fetchJson non-ok response',
        data: {
          url,
          status: res.status,
          statusText: res.statusText,
          responseBodyPreview: typeof data === 'string'
            ? data.slice(0, 200)
            : (data && (data.message || data.error)) || null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    throw new Error(msg);
  }

  return data;
}

function toDateInputValue(raw) {
  const s = (raw ?? "").toString().trim();
  if (!s) return "";
  // Already in yyyy-mm-dd (what <input type="date"> expects).
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Common DB/manual format dd-mm-yyyy
  const m1 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m1) {
    const [, dd, mm, yyyy] = m1;
    return `${yyyy}-${mm}-${dd}`;
  }
  // Common format dd/mm/yyyy
  const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m2) {
    const [, dd, mm, yyyy] = m2;
    return `${yyyy}-${mm}-${dd}`;
  }
  // Try to parse other formats like "Mon Jan 19 2026 ..."
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s; // fallback: show raw
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mapBackendEventToUi(ev) {
  return {
    id: ev?.id,
    title: ev?.eventName || "",
    description: ev?.eventDescription || "",
    date: toDateInputValue(ev?.eventDate),
    // Check for stored image in localStorage, fallback to empty string
    imgsrc: getStoredEventImage(ev?.id) || "",
    registered: false,
    registrations: 0,
  };
}

async function loginStudent(email, password) {
  const response = await fetch(`${API_BASE}api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Required for Spring session (JSESSIONID) to be stored/sent.
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      role: "student",
    }),
  });

  return response.json();
}


async function loginStaff(email, password) {
  const response = await fetch(`${API_BASE}api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      role: "staff",
    }),
  });

return response.json();
}

async function logout() {
  const response = await fetch(`${API_BASE}api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

return response.json();
}

async function getMe() {
  const response = await fetch(`${API_BASE}api/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
}

// Complaints APIs
async function getComplaints() {
  try {
    const response = await fetchJson(`${API_BASE}api/complaint/mycomplaints`, { method: "GET" });
    return Array.isArray(response) ? response.map(mapBackendComplaintToUi) : [];
  } catch (err) {
    console.error("Failed to load complaints from backend", err);
    // If 401, user might not be logged in - return empty array
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      console.warn('Not logged in or not a student - cannot get complaints');
      return [];
    }
    return [];
  }
}

async function getAllComplaints() {
  try {
    const response = await fetchJson(`${API_BASE}api/complaint/all`, { method: "GET" });
    return Array.isArray(response) ? response.map(mapBackendComplaintToUi) : [];
  } catch (err) {
    console.error("Failed to load all complaints from backend", err);
    return [];
  }
}

function mapBackendComplaintToUi(complaint) {
  return {
    id: complaint?.id,
    title: complaint?.title || "",
    category: complaint?.category || "",
    description: complaint?.description || "",
    status: mapBackendStatusToUi(complaint?.complaintStatus),
    date: formatBackendDate(complaint?.createdAt),
    studentName: complaint?.student ? `${complaint.student.firstName || ''} ${complaint.student.lastName || ''}`.trim() : 'N/A',
    rated: false // This would need to be implemented in backend if needed
  };
}

function mapBackendStatusToUi(backendStatus) {
  switch (backendStatus) {
    case 'PENDING': return 'Pending';
    case 'IN_PROGRESS': return 'In-progress';
    case 'RESOLVED': return 'Resolved';
    default: return 'Pending';
  }
}

function mapUiStatusToBackend(uiStatus) {
  switch (uiStatus) {
    case 'Pending': return 'PENDING';
    case 'In-progress': return 'IN_PROGRESS';
    case 'Resolved': return 'RESOLVED';
    default: return 'PENDING';
  }
}

function formatBackendDate(dateTime) {
  if (!dateTime) return new Date().toISOString().split('T')[0];
  try {
    const date = new Date(dateTime);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

async function submitComplaint(data) {
  try {
    const payload = {
      title: data.title,
      category: data.category,
      description: data.description
    };
    
    const result = await fetchJson(`${API_BASE}api/complaint/add`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    return result;
  } catch (err) {
    console.error('Failed to submit complaint', err);
    throw err;
  }
}

async function updateComplaintStatus(id, status) {
  try {
    const payload = {
      status: mapUiStatusToBackend(status)
    };
    
    const result = await fetchJson(`${API_BASE}api/complaint/status/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    return result;
  } catch (err) {
    console.error('Failed to update complaint status', err);
    throw err;
  }
}

// Events APIs
async function getEvents() {
  try {
    const list = await fetchJson(`${API_BASE}api/events/all`, { method: "GET" });
    if (!Array.isArray(list)) return [];
    
    // Map backend events to UI format
    let events = list.map(mapBackendEventToUi);
    
    // Fetch registration counts from database
    const registrationCounts = await getRegistrationCounts();
    
    // Fetch student's registered events if logged in as student
    let myRegisteredEventIds = [];
    if (currentUser && currentUser.role === 'student') {
      myRegisteredEventIds = await getMyRegisteredEvents();
    }
    
    // Merge registration counts and registration status into events
    events = events.map(event => {
      const eventIdStr = String(event.id);
      const count = registrationCounts[eventIdStr] || 0;
      const isRegistered = myRegisteredEventIds.includes(event.id);
      
      return {
        ...event,
        registrations: count,
        registered: isRegistered
      };
    });
    
    return events;
  } catch (err) {
    console.error("Failed to load events from backend", err);
    return [];
  }
}

async function registerForEvent(eventId) {
  // Ensure we have a valid session before attempting registration
  if (!currentUser) {
    await ensureCurrentUser();
    if (!currentUser) {
      throw new Error('Not logged in. Please log in to register for events.');
    }
  }
  
  try {
    const result = await fetchJson(`${API_BASE}api/events/register/${eventId}`, {
      method: 'POST'
    });
    return result;
  } catch (err) {
    console.error('Failed to register for event', err);
    // If 401, try to refresh auth and throw a clearer error
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      // Refresh auth state
      await ensureCurrentUser();
      throw new Error('Your session has expired. Please log in again.');
    }
    throw err;
  }
}

async function unregisterForEvent(eventId) {
  // Ensure we have a valid session before attempting unregistration
  if (!currentUser) {
    await ensureCurrentUser();
    if (!currentUser) {
      throw new Error('Not logged in. Please log in to unregister from events.');
    }
  }
  
  try {
    const result = await fetchJson(`${API_BASE}api/events/register/${eventId}`, {
      method: 'DELETE'
    });
    return result;
  } catch (err) {
    console.error('Failed to unregister from event', err);
    // If 401, try to refresh auth and throw a clearer error
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      // Refresh auth state
      await ensureCurrentUser();
      throw new Error('Your session has expired. Please log in again.');
    }
    throw err;
  }
}

// Get registration counts for all events from database
async function getRegistrationCounts() {
  try {
    const counts = await fetchJson(`${API_BASE}api/events/register/counts`, {
      method: 'GET'
    });
    return counts || {};
  } catch (err) {
    console.error('Failed to get registration counts', err);
    return {};
  }
}

// Get list of event IDs the current student is registered for
async function getMyRegisteredEvents() {
  try {
    const eventIds = await fetchJson(`${API_BASE}api/events/register/student/me`, {
      method: 'GET'
    });
    return Array.isArray(eventIds) ? eventIds : [];
  } catch (err) {
    // If 401, user might not be logged in or session expired - return empty array
    // This is expected for non-students or when not logged in
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      console.warn('Not logged in or not a student - cannot get registered events');
      return [];
    }
    console.error('Failed to get registered events', err);
    return [];
  }
}

async function createEvent(data) {
  // Backend expects: { eventName, eventDescription, eventDate }
  const payload = {
    eventName: data?.title || "",
    eventDescription: data?.description || "",
    eventDate: data?.date || "",
  };

  const saved = await fetchJson(`${API_BASE}api/events/add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const ui = mapBackendEventToUi(saved);
  return { success: true, id: ui.id, event: ui };
}

async function deleteEvent(eventId) {
  await fetchJson(`${API_BASE}api/events/${eventId}`, { method: "DELETE" });
  return { success: true };
}

async function updateEventApi(eventId, data) {
  const payload = {
    eventName: data?.title || "",
    eventDescription: data?.description || "",
    eventDate: data?.date || "",
  };

  const updated = await fetchJson(`${API_BASE}api/events/update/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return mapBackendEventToUi(updated);
}

// Stats APIs
async function getStudentStats() {
  // Get actual registered events count from database
  let eventsRegistered = 0;
  try {
    const registeredEventIds = await getMyRegisteredEvents();
    eventsRegistered = Array.isArray(registeredEventIds) ? registeredEventIds.length : 0;
  } catch (err) {
    console.warn('Failed to get registered events count for stats', err);
  }
  
  // Get actual complaints count from database
  let totalComplaints = 0;
  let pendingComplaints = 0;
  try {
    const complaints = await getComplaints();
    totalComplaints = complaints.length;
    pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
  } catch (err) {
    console.warn('Failed to get complaints count for stats', err);
  }
  
  return {
    totalComplaints: totalComplaints,
    pendingComplaints: pendingComplaints,
    eventsRegistered: eventsRegistered,
  };
}

async function getStaffStats() {
  // Get actual complaints stats from database
  let totalComplaints = 0;
  let pendingComplaints = 0;
  let inProgressComplaints = 0;
  let resolvedComplaints = 0;
  
  try {
    const complaints = await getAllComplaints();
    totalComplaints = complaints.length;
    pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
    inProgressComplaints = complaints.filter(c => c.status === 'In-progress').length;
    resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  } catch (err) {
    console.warn('Failed to get complaints stats', err);
  }

  const base = {
    totalComplaints: totalComplaints,
    pendingComplaints: pendingComplaints,
    inProgressComplaints: inProgressComplaints,
    resolvedComplaints: resolvedComplaints,
    totalEvents: 0,
    upcomingEvents: 0,
  };

  try {
    const events = await getEvents();
    base.totalEvents = Array.isArray(events) ? events.length : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    base.upcomingEvents = (Array.isArray(events) ? events : []).filter(ev => {
      const d = new Date(ev?.date);
      return !Number.isNaN(d.getTime()) && d >= today;
    }).length;
  } catch (e) {
    // ignore - keep defaults
  }

  return base;
}

// ========== State Management ==========
// Auth state is kept in-memory and restored from the server session via `/api/auth/me`.
let currentUser = null;
let authChecked = false;
let currentPage = 'landing';
// The following variable is used as the source for event cards on all event-related screens.
let complaintsData = [];
let eventsData = []; // Events card data is stored here after getEvents() is called.
let statsData = {};
// selectedEventId stores the id of the event being edited in the "event-edit" page
let selectedEventId = null;

// == Theme Management ==

function getSavedTheme() {
  return localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function getLogoSrc(theme) {
  return theme === 'dark' ? 'images/Campus-darkmode.png' : 'images/Campus.png';
}

function applyTheme(theme) {
  const themeToApply = theme === 'dark' ? 'dark' : 'light';
  const logoToApply = getLogoSrc(themeToApply);

  // Update logo
  const logoImg = document.querySelector('.logo-img img');
  if (logoImg) {
    logoImg.src = logoToApply;
  }

  // Set theme
  document.documentElement.setAttribute('data-theme', themeToApply);

  // Persist
  localStorage.setItem('theme', themeToApply);
  localStorage.setItem('logo_src', logoToApply);
}

function toggleTheme() {
  const prevTheme = getSavedTheme();
  const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function initTheme() {
  const saved = getSavedTheme();
  window.currentTheme = saved;
  applyTheme(saved);
}


// Run only once, after DOM is fully loaded
document.addEventListener('DOMContentLoaded', initTheme);


// ========== Routing ==========
async function navigate(page) {
  const base = String(page).split('?')[0];

  const protectedStudentPages = ['student-dashboard', 'student-complaints', 'student-events'];
  const protectedStaffPages = ['staff-dashboard', 'staff-complaints', 'staff-events'];

  if (protectedStudentPages.includes(base) || protectedStaffPages.includes(base)) {
    await ensureCurrentUser(true);

    if (!currentUser) {
      window.location.hash = '#student-login';
      return;
    }

    // ROLE CHECK (important)
    if (protectedStudentPages.includes(base) && currentUser.role !== 'student') {
      window.location.hash = '#student-login';
      return;
    }

    if (protectedStaffPages.includes(base) && currentUser.role !== 'staff') {
      window.location.hash = '#staff-login';
      return;
    }
  }

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

// ========== Eye Icon Functionality ==========

function toggleVisibility(eyeicon) {
  const passwordInput = document.getElementById('password');
  if (!passwordInput) return;
  passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
  passwordInput.type === 'text'
  ? eyeicon.firstElementChild.textContent = 'visibility_off'
  : eyeicon.firstElementChild.textContent = 'visibility'
}

// function to show toast takes two arguments
function showToast(message, type = 'toast-success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.innerHTML = `<i class="material-icons-round info-icon" aria-hidden="true">info</i> ${message}`
    toastContainer.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('slide-in');
    setTimeout(() => {
        toast.classList.remove('slide-in');
        toast.classList.add('slide-out');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3500);
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

// Smooth Hover Indicator for Navbar Links
function initNavbarLinksIndicator(container) {
  const indicator = container.querySelector('.navbar-links-indicator');
  const linkEls = container.querySelectorAll('.navbar-link');
  if (!indicator || !linkEls.length) return;

  function positionTo(el) {
    if (!el) {
      indicator.style.left = '0';
      indicator.style.width = '0';
      return;
    }
    indicator.style.left = `${el.offsetLeft}px`;
    indicator.style.width = `${el.offsetWidth}px`;
  }

  linkEls.forEach((link) => {
    link.addEventListener('mouseenter', () => positionTo(link));
  });
  container.addEventListener('mouseleave', () => {
    const active = container.querySelector('.navbar-link.active');
    positionTo(active || linkEls[0]);
  });

  // Initial position after nav is in DOM
  setTimeout(() => {
    const active = container.querySelector('.navbar-link.active');
    positionTo(active || linkEls[0]);
  }, 0);
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

  const navLogo = nav.querySelector('.logo-img img');
  if (navLogo) navLogo.src = getLogoSrc(currentTheme);

  
  links.forEach(link => {
    const linkEl = document.createElement('a');
    linkEl.href = '#';
    linkEl.className = `navbar-link ${activePage === link.page ? 'active' : ''}`;
    linkEl.setAttribute('onclick', `navigate('${link.page}'); return false;`);
    linkEl.innerHTML = `${icon(link.icon)} ${link.label}`;
    linksContainer.appendChild(linkEl);
    
    const mobileLink = document.createElement('button');
    mobileLink.className = `navbar-mobile-link w-100 ${activePage === link.page ? 'active' : ''}`;
    mobileLink.setAttribute('onclick', `navigate('${link.page}'); closeMobileNav();`);
    mobileLink.innerHTML = `${icon(link.icon)} ${link.label}`;
    mobileNav.appendChild(mobileLink);
  });

  // Sliding hover indicator (replaces CSS ::after / :has)
  const indicator = document.createElement('div');
  indicator.className = 'navbar-links-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  linksContainer.prepend(indicator);
  initNavbarLinksIndicator(linksContainer);
  
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'navbar-mobile-link w-100 logout';
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

  const staffNameSpan = clone.querySelector('#staff-name');
  if (staffNameSpan) {
    staffNameSpan.textContent = currentUser?.name.trim() || 'Staff';
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
  
  try {
    const result = await loginStudent(email, password);
    if (result?.success) {
      currentUser = { id: result.id, email: result.email, name: result.name, role: result.role };
      authChecked = true;
      localStorage.setItem('user', JSON.stringify(currentUser));
      showToast("Student Login Successful!");
      navigate('student-dashboard');        
      return;
    }
    showToast(result?.message || "Student Login Failed!", "toast-failed")
  } catch (err) {
    console.error('Student login failed', err);
    showToast("Student Login Failed!", "toast-failed")
  }
}

async function handleStaffLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const result = await loginStaff(email, password);
    if (result?.success) {
      currentUser = { id: result.id, email: result.email, name: result.name, role: result.role };
      authChecked = true;
      localStorage.setItem('user', JSON.stringify(currentUser));
      navigate('staff-dashboard');      
      return;
    }
    showToast(result?.message || 'Staff login failed', "toast-failed");
  } catch (err) {
    console.error('Staff login failed', err);
    showToast('Staff login failed', "toast-failed");
  }
}

async function handleLogout() {
  try {
    await logout();
  } catch (err) {
    console.warn('Logout request failed (clearing local state anyway)', err);
  }
  currentUser = null;
  authChecked = true;
  try { localStorage.removeItem('user'); } catch (e) { /* ignore */ }
  navigate('landing');
}

async function ensureCurrentUser(force = false) {
  if (authChecked && !force) return currentUser;

  authChecked = true;

  try {
    const me = await getMe();
    if (me?.authenticated) {
      currentUser = {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role
      };
    } else {
      currentUser = null;
    }
  } catch (err) {
    console.warn('Failed to load session user', err);
    currentUser = null;
  }

  return currentUser;
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
  const modal = document.getElementById('event-modal');
  modal.classList.remove('hidden');
  
  // Add image preview functionality for create event modal
  const imageInput = document.getElementById('event-image');
  if (imageInput) {
    // Remove any existing event listeners to avoid duplicates
    const newImageInput = imageInput.cloneNode(true);
    imageInput.parentNode.replaceChild(newImageInput, imageInput);
    
    // Add event listener for image preview
    newImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      let previewContainer = document.getElementById('create-image-preview-container');
      
      // Create preview container if it doesn't exist
      if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'create-image-preview-container';
        previewContainer.style.marginTop = '0.5rem';
        newImageInput.parentNode.appendChild(previewContainer);
      }
      
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewContainer.innerHTML = `
            <div style="font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;">Image preview:</div>
            <img src="${e.target.result}" alt="Event image preview" 
                 style="
                   width: 120px; 
                   height: 120px; 
                   object-fit: cover; 
                   object-position: center; 
                   border-radius: var(--s-round); 
                   border: 1px solid var(--border);
                 " />
          `;
        };
        reader.readAsDataURL(file);
      } else {
        // Clear preview if no file selected
        previewContainer.innerHTML = '';
      }
    });
  }
}

function closeEventModal() {
  const modal = document.getElementById('event-modal');
  modal.classList.add('hidden');
  
  // Reset form and clear image preview
  const form = modal.querySelector('form');
  if (form) {
    form.reset();
  }
  
  // Clear image preview
  const previewContainer = document.getElementById('create-image-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = '';
  }
}

// Store the event ID for registration modal
let pendingRegistrationEventId = null;

async function openRegisterModal(eventId) {
  // Ensure user is authenticated before opening modal
  if (!currentUser) {
    await ensureCurrentUser();
    if (!currentUser) {
      showToast('Please log in to register for events', "toast-alert");
      navigate('student-login');
      return;
    }
  }
  
  // Check if user is a student
  if (currentUser.role !== 'student') {
    showToast('Only students can register for events', "toast-alert");
    return;
  }
  
  const event = eventsData.find(e => e.id === eventId);
  if (!event) {
    showToast('Event not found', "toast-alert");
    return;
  }
  
  pendingRegistrationEventId = eventId;
  
  // Populate modal with event and student info
  const eventNameEl = document.getElementById('register-event-name');
  const studentInfoEl = document.getElementById('register-student-info');
  
  if (eventNameEl) {
    eventNameEl.textContent = event.title;
  }
  
  if (studentInfoEl && currentUser) {
    studentInfoEl.innerHTML = `
      <div style="margin-top: 0.5rem;">
        <div><strong>Name:</strong> ${currentUser.name || 'N/A'}</div>
        <div><strong>Email:</strong> ${currentUser.email || 'N/A'}</div>
      </div>
    `;
  }
  
  const modal = document.getElementById('event-register-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeRegisterModal(e) {
  if (e && e.target.classList.contains('modal-overlay')) {
    document.getElementById('event-register-modal').classList.add('hidden');
    pendingRegistrationEventId = null;
  } else {
    document.getElementById('event-register-modal').classList.add('hidden');
    pendingRegistrationEventId = null;
  }
}

async function handleEventRegisterSubmit(e) {
  e.preventDefault();
  
  // Ensure user is authenticated
  if (!currentUser) {
    await ensureCurrentUser();
    if (!currentUser) {
      showToast('Please log in to register for events', "toast-alert");
      closeRegisterModal();
      navigate('student-login');
      return;
    }
  }
  
  // Check if user is a student
  if (currentUser.role !== 'student') {
    showToast('Only students can register for events', "toast-alert");
    closeRegisterModal();
    return;
  }
  
  if (!pendingRegistrationEventId) {
    showToast('No event selected for registration', "toast-alert");
    return;
  }
  
  const eventId = pendingRegistrationEventId;
  
  try {
    const result = await registerForEvent(eventId);
    
    if (result?.success) {
      // Close modal
      closeRegisterModal();
      
      // Refresh events data from database (this will update counts and registration status)
      eventsData = await getEvents();
      
      // Re-render the events list and upcoming events
      renderEventsList();
      renderUpcomingEvents();
      
      showToast(result.message || 'Successfully registered for event!');
    } else {
      showToast(result?.message || 'Failed to register for event', "toast-failed");
    }
  } catch (err) {
    console.error('Registration failed', err);
    // Handle 401 specifically
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      showToast('Your session has expired. Please log in again.', "toast-alert");
      closeRegisterModal();
      await handleLogout();
      navigate('student-login');
    } else {
      showToast(err?.message || 'Failed to register for event. Please try again.', "toast-failed");
    }
  }
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
    showToast('Only students can submit feedback for complaints.', "toast-alert");
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
    showToast('Complaint not found', "toast-alert");
    return;
  }

  // Note: Rating functionality would need to be implemented in backend
  // For now, just update local state
  complaint.rated = true;
  complaint.rating = rating;
  complaint.feedbackText = comment;
  complaint.feedbackTags = tags;

  closeRatingModal();
  // Re-render the appropriate complaints table depending on current page
  if (currentPage === 'staff-complaints') renderStaffComplaintsTable();
  if (currentPage === 'student-complaints') renderComplaintsTable();
  showToast('Thanks for your feedback');
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
    file: document.getElementById('complaint-file').files[0], // Note: file upload not implemented in backend yet
  };
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7652/ingest/eb05b2db-ec66-4479-af8a-eb199c54b7a5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '96b9c0',
      },
      body: JSON.stringify({
        sessionId: '96b9c0',
        runId: 'complaint-run',
        hypothesisId: 'H1',
        location: 'app.js:1411',
        message: 'handleSubmitComplaint before API call',
        data: {
          API_BASE,
          hasCurrentUser: !!currentUser,
          currentUserRole: currentUser?.role || null,
          title: data.title,
          category: data.category,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const result = await submitComplaint(data);
    if (result.success) {
      closeComplaintModal();
      
      // Refresh complaints data from database
      complaintsData = await getComplaints();
      
      // Re-render the complaints table
      renderComplaintsTable();
      
      showToast(result.message || 'Complaint submitted successfully!');
      
      // Clear form
      document.getElementById('complaint-title').value = '';
      document.getElementById('complaint-category').value = '';
      document.getElementById('complaint-description').value = '';
      document.getElementById('complaint-file').value = '';
    } else {
      showToast(result.message || 'Failed to submit complaint', "toast-failed");
    }
  } catch (err) {
    console.error('Submit complaint failed', err);
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      showToast('Your session has expired. Please log in again.', "toast-alert");
      await handleLogout();
      navigate('student-login');
    } else {
      showToast(err?.message || 'Failed to submit complaint. Please try again.', "toast-failed");
    }
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Store event image in localStorage
function storeEventImage(eventId, base64Data) {
  try {
    const eventImages = JSON.parse(localStorage.getItem('eventImages') || '{}');
    eventImages[eventId] = base64Data;
    localStorage.setItem('eventImages', JSON.stringify(eventImages));
  } catch (err) {
    console.warn('Could not store event image:', err);
  }
}

// Retrieve event image from localStorage
function getStoredEventImage(eventId) {
  try {
    const eventImages = JSON.parse(localStorage.getItem('eventImages') || '{}');
    return eventImages[eventId] || null;
  } catch (err) {
    console.warn('Could not retrieve event image:', err);
    return null;
  }
}

async function handleCreateEvent(e) {
  e.preventDefault();

  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const description = document.getElementById('event-description').value;
  const imageFile = document.getElementById('event-image').files[0];

  // Generate preview URL and store image data for persistence
  let imgsrc = "";
  if (imageFile) {
    // Create object URL for immediate use
    imgsrc = URL.createObjectURL(imageFile);
    
    // Convert image to base64 for localStorage persistence
    try {
      const base64 = await fileToBase64(imageFile);
      // We'll store this with the event ID after creation
      window.pendingEventImage = base64;
    } catch (err) {
      console.warn('Could not convert image to base64:', err);
    }
  }

  const data = {
    title,
    date,
    description,
    image: imageFile,
  };

  try {
    const result = await createEvent(data);

    if (result?.success) {
      // Backend event (JSON-only)
      const uiEvent = result.event;

      // Add image for client-side use
      uiEvent.imgsrc = imgsrc;

      // Store image in localStorage if we have one
      if (window.pendingEventImage && result.id) {
        storeEventImage(result.id, window.pendingEventImage);
        delete window.pendingEventImage;
      }

      // Keep the UI in sync
      eventsData.push(uiEvent);

      closeEventModal();
      renderStaffEventsTable();
      showToast('Event created successfully!');
    } else {
      showToast('Failed to create event', "toast-failed");
    }
  } catch (err) {
    console.error('Create event failed', err);
    showToast(err?.message || 'Failed to create event', "toast-failed");
  }
}


async function handleRegisterEvent(eventId) {
  // Ensure user is authenticated
  if (!currentUser) {
    // Try to refresh auth state
    await ensureCurrentUser();
    if (!currentUser) {
      showToast('Please log in to register for events', "toast-alert");
      navigate('student-login');
      return;
    }
  }
  
  // Check if user is a student
  if (currentUser.role !== 'student') {
    showToast('Only students can register for events', "toast-alert");
    return;
  }
  
  const event = eventsData.find(e => e.id === eventId);
  if (!event) {
    showToast('Event not found', "toast-alert");
    return;
  }
  
  if (event.registered) {
    // Unregister - direct action, no modal needed
    if (confirm('Are you sure you want to unregister from this event?')) {
      try {
        const result = await unregisterForEvent(eventId);
        if (result?.success) {
          // Refresh events data from database
          eventsData = await getEvents();
          
          // Re-render the events list and upcoming events
          renderEventsList();
          renderUpcomingEvents();
          
          showToast(result.message || 'Successfully unregistered from event!');
        } else {
          showToast(result?.message || 'Failed to unregister from event', "toast-failed");
        }
      } catch (err) {
        console.error('Unregistration failed', err);
        // Handle 401 specifically
        if (err.message && err.message.includes('Not logged in')) {
          showToast('Your session has expired. Please log in again.', "toast-alert");
          await handleLogout();
          navigate('student-login');
        } else {
          showToast(err?.message || 'Failed to unregister from event. Please try again.', "toast-failed");
        }
      }
    }
  } else {
    // Register - open modal for confirmation
    openRegisterModal(eventId);
  }
}

async function handleUpdateStatus(id, status) {
  try {
    const result = await updateComplaintStatus(id, status);
    if (result.success) {
      // Refresh complaints data from database
      complaintsData = await getAllComplaints();
      
      // Re-render the staff complaints table
      renderStaffComplaintsTable();
      
      showToast(result.message || 'Complaint status updated successfully!');
    } else {
      showToast(result.message || 'Failed to update complaint status', "toast-failed");
    }
  } catch (err) {
    console.error('Update status failed', err);
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      showToast('Your session has expired. Please log in again.', "toast-alert");
      await handleLogout();
      navigate('staff-login');
    } else {
      showToast(err?.message || 'Failed to update complaint status. Please try again.', "toast-failed");
    }
  }
}

async function handleDeleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      const result = await deleteEvent(eventId);
      if (result?.success) {
        eventsData = await getEvents();
        renderStaffEventsTable();
      }
    } catch (err) {
      console.error('Delete event failed', err);
      showToast(err?.message || 'Failed to delete event', "toast-failed");
    }
  }
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
      return 'images/fallback.webp';
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
    <div class="event-card w-100">
    <img 
      class="event-card-image w-100" 
      src="${getImageSrc(event.imgsrc)}"
      onerror="this.onerror=null; this.src='images/fallback.webp';"
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
  if (!container) {
    return;
  }
  
  if (!Array.isArray(eventsData) || eventsData.length === 0) {
    container.innerHTML = '<div class="empty-state">No upcoming events</div>';
    return;
  }
  
  const upcoming = eventsData.slice(0, 3);

  // EVENT CARD GENERATOR
  container.innerHTML = upcoming.map(event => `
    <div class="event-card w-100">
    <img 
      class="event-card-image w-100"
      src="${getImageSrc(event.imgsrc)}"
      onerror="this.onerror=null; this.src='images/fallback.webp';"
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
      <td>
        <img 
          src="${getImageSrc(event.imgsrc)}" 
          alt="event image" 
          style="
            width: 80px; 
            height: 80px; 
            object-fit: cover; 
            object-position: center; 
            border-radius: var(--s-round);
            display: block;
          "
          onerror="this.onerror=null; this.src='images/fallback.webp';"
        />
      </td>
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
    if (regEl) regEl.value = event.registrations || 0;
    
    // For file input, we can't set the value, but we can show current image preview
    if (imgEl) {
      // Create container for image preview
      const previewContainer = document.createElement('div');
      previewContainer.id = 'image-preview-container';
      previewContainer.style.marginTop = '0.5rem';
      
      if (event.imgsrc) {
        previewContainer.innerHTML = `
          <div style="font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;">Current image:</div>
          <img id="current-image-preview" src="${event.imgsrc}" alt="Current event image" 
               style="
                 width: 120px; 
                 height: 120px; 
                 object-fit: cover; 
                 object-position: center; 
                 border-radius: var(--s-round); 
                 border: 1px solid var(--border);
               " 
               onerror="this.style.display='none';" />
        `;
      }
      
      imgEl.parentNode.appendChild(previewContainer);
      
      // Add event listener for new file selection
      imgEl.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const previewContainer = document.getElementById('image-preview-container');
        
        if (file && previewContainer) {
          const reader = new FileReader();
          reader.onload = function(e) {
            previewContainer.innerHTML = `
              <div style="font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;">New image preview:</div>
              <img src="${e.target.result}" alt="New event image preview" 
                   style="
                     width: 120px; 
                     height: 120px; 
                     object-fit: cover; 
                     object-position: center; 
                     border-radius: var(--s-round); 
                     border: 1px solid var(--border);
                   " />
            `;
          };
          reader.readAsDataURL(file);
        } else if (!file && previewContainer && event.imgsrc) {
          // Restore original image if file selection is cleared
          previewContainer.innerHTML = `
            <div style="font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;">Current image:</div>
            <img src="${event.imgsrc}" alt="Current event image" 
                 style="
                   width: 120px; 
                   height: 120px; 
                   object-fit: cover; 
                   object-position: center; 
                   border-radius: var(--s-round); 
                   border: 1px solid var(--border);
                 " 
                 onerror="this.style.display='none';" />
          `;
        }
      });
    }
  } catch (err) {
    console.warn('Could not populate event edit fields on clone', err);
  }

  return clone;
}

// Handle saving edits from the edit page form.
async function handleSaveEditedEvent(e) {
  e.preventDefault();
  if (selectedEventId == null) {
    showToast('No event selected to edit', "toast-alert");
    return;
  }

  const title = document.getElementById('event-edit-title').value.trim();
  const date = document.getElementById('event-edit-date').value;
  const description = document.getElementById('event-edit-description').value.trim();
  const imageFile = document.getElementById('event-edit-image').files[0];
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
    showToast('Event not found', "toast-alert");
    return;
  }

  // Handle image update
  let imgsrc = ev.imgsrc; // Keep existing image by default
  if (imageFile) {
    // Generate new preview URL
    imgsrc = URL.createObjectURL(imageFile);
    
    // Convert and store new image
    try {
      const base64 = await fileToBase64(imageFile);
      storeEventImage(selectedEventId, base64);
    } catch (err) {
      console.warn('Could not convert image to base64:', err);
    }
  }

  try {
    const updatedUi = await updateEventApi(selectedEventId, {
      title,
      date,
      description,
    });

    // Update UI-only fields that backend doesn't store (image/registrations).
    updatedUi.imgsrc = imgsrc;
    updatedUi.registrations = registrations;
    updatedUi.registered = ev.registered || false;

    // Update in-memory list
    const idx = eventsData.findIndex(x => x.id === selectedEventId);
    if (idx !== -1) eventsData[idx] = { ...eventsData[idx], ...updatedUi };
  } catch (err) {
    console.error('Failed to update event via API', err);
    showToast(err?.message || 'Failed to update event', "toast-failed");
    return;
  }

  // Reload from backend to ensure DB is the source of truth.
  try { eventsData = await getEvents(); } catch (e) { /* ignore */ }

  // After save, navigate back to staff events and refresh table
  navigate('staff-events');
  // ensure events are present and re-render the table
  renderStaffEventsTable();
  showToast('Event updated successfully');
}

// ========== Main Render Function ==========
// This function controls which page is visible and updates data accordingly.
// For example, when the Events page is shown, it updates eventsData using getEvents(), which means all event cards on that page use the array getEvents() returns.
async function render() {
  const app = document.getElementById('app');
  
  // Check auth for protected pages
  const protectedStudentPages = ['student-dashboard', 'student-complaints', 'student-events'];
  const protectedStaffPages = ['staff-dashboard', 'staff-complaints', 'staff-events'];
  
  const needsStudent = protectedStudentPages.includes(currentPage);
  const needsStaff = protectedStaffPages.includes(currentPage);
  if (needsStudent || needsStaff) {
    await ensureCurrentUser(); // ALWAYS verify with backend
  }

  if (needsStudent && (!currentUser || currentUser.role !== 'student')) {
    navigate('student-login');
    return;
  }
  
  if (needsStaff && (!currentUser || currentUser.role !== 'staff')) {
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
      // Use requestAnimationFrame to ensure DOM is ready before rendering upcoming events
      requestAnimationFrame(() => {
        renderUpcomingEvents();
      });
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

  // Reapply theme to newly inserted templates
  applyTheme(getSavedTheme());
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize API base URL before any backend calls
  await initApiBase();

  // Try restoring user from localStorage (fast, no network)
  try {
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    // ignore parsing errors
  }

  // IMPORTANT:
  // We call ensureCurrentUser ONLY ONCE here with force=true
  // This verifies session with backend (/auth/me)
  // and prevents multiple duplicate API calls later
  await ensureCurrentUser(true);

  // Sync localStorage if backend confirms user is logged in
  if (currentUser) {
    localStorage.setItem('user', JSON.stringify(currentUser));
  }

  // Set initial page from URL hash (routing)
  currentPage = getPageFromHash();

  // Render the app (UI should NOT block on multiple auth calls anymore)
  render();
});
