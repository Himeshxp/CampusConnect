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
  // TODO: Replace with actual API endpoint
  return [
    { id: 1, title: 'Library AC not working', category: 'Facilities', status: 'Pending', date: '2025-01-10', description: 'The air conditioning in the main library has been broken for 3 days.' },
    { id: 2, title: 'WiFi connectivity issues', category: 'IT', status: 'In-progress', date: '2025-01-08', description: 'Intermittent WiFi drops in Block B.' },
    { id: 3, title: 'Cafeteria food quality', category: 'Food', status: 'Resolved', date: '2025-01-05', description: 'Food quality has been declining.' },
  ];
  // return fetch(`${API_BASE}/complaints`).then(res => res.json());
}

async function getAllComplaints() {
  // TODO: Replace with actual API endpoint (for staff)
  return [
    { id: 1, title: 'Library AC not working', category: 'Facilities', status: 'Pending', date: '2025-01-10', studentName: 'John Doe', description: 'The AC is broken.' },
    { id: 2, title: 'WiFi connectivity issues', category: 'IT', status: 'In-progress', date: '2025-01-08', studentName: 'Jane Smith', description: 'WiFi keeps dropping.' },
    { id: 3, title: 'Cafeteria food quality', category: 'Food', status: 'Resolved', date: '2025-01-05', studentName: 'Mike Johnson', description: 'Food quality issue.' },
    { id: 4, title: 'Broken desk in Room 201', category: 'Facilities', status: 'Pending', date: '2025-01-12', studentName: 'Sarah Wilson', description: 'Desk is wobbly.' },
  ];
  // return fetch(`${API_BASE}/staff/complaints`).then(res => res.json());
}

async function submitComplaint(data) {
  // TODO: Replace with actual API endpoint
  console.log('Submit complaint:', data);
  return { success: true, id: Date.now() };
  // const formData = new FormData();
  // Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  // return fetch(`${API_BASE}/complaints`, {
  //   method: 'POST',
  //   body: formData
  // }).then(res => res.json());
}

async function updateComplaintStatus(id, status) {
  // TODO: Replace with actual API endpoint
  console.log('Update complaint status:', { id, status });
  return { success: true };
  // return fetch(`${API_BASE}/complaints/${id}/status`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status })
  // }).then(res => res.json());
}

// Events APIs
async function getEvents() {
  // TODO: Replace with actual API endpoint in a real app.
  // This placeholder just returns some event objects for demo/testing.
  // The mapping between these objects and the UI cards displayed to the user is as follows:
  //   - When you open "Events" (for student or staff), getEvents() is called and result is put in eventsData.
  //   - renderEventsList(), renderUpcomingEvents(), or renderStaffEventsTable() use eventsData to loop and show cards/tables.
  //   - Each object in the returned array below will become a card shown to the user.
  return [
    { id: 1, title: 'Tech Symposium 2025', imgsrc: 'https://imgs.search.brave.com/jNEPEiT5JFlHvQUuX63McNK_p_Ri0Snb3RMQCQ6RBOs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZHJpYmJibGUuY29t/L3VzZXJ1cGxvYWQv/NDIzMjU4MDgvZmls/ZS9vcmlnaW5hbC1m/MTQxZTU3MzRmMzQy/ODliOWNkYjNlMzFi/NDE3MzBlNy5wbmc_/Zm9ybWF0PXdlYnAm/cmVzaXplPTQwMHgz/MDAmdmVydGljYWw9/Y2VudGVy', date: '2025-02-15', description: 'Annual technology conference featuring industry speakers.', registered: false, registrations: 45 },
    { id: 2, title: 'Cultural Fest', imgsrc: 'https://imgs.search.brave.com/jNEPEiT5JFlHvQUuX63McNK_p_Ri0Snb3RMQCQ6RBOs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZHJpYmJibGUuY29t/L3VzZXJ1cGxvYWQv/NDIzMjU4MDgvZmls/ZS9vcmlnaW5hbC1m/MTQxZTU3MzRmMzQy/ODliOWNkYjNlMzFi/NDE3MzBlNy5wbmc_/Zm9ybWF0PXdlYnAm/cmVzaXplPTQwMHgz/MDAmdmVydGljYWw9/Y2VudGVy', date: '2025-02-20', description: 'Celebrate diversity with performances and food from around the world.', registered: false, registrations: 120 },
    { id: 3, title: 'Career Fair', imgsrc: 'https://imgs.search.brave.com/jNEPEiT5JFlHvQUuX63McNK_p_Ri0Snb3RMQCQ6RBOs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZHJpYmJibGUuY29t/L3VzZXJ1cGxvYWQv/NDIzMjU4MDgvZmls/ZS9vcmlnaW5hbC1m/MTQxZTU3MzRmMzQy/ODliOWNkYjNlMzFi/NDE3MzBlNy5wbmc_/Zm9ybWF0PXdlYnAm/cmVzaXplPTQwMHgz/MDAmdmVydGljYWw9/Y2VudGVy', date: '2025-03-01', description: 'Meet top employers and explore internship opportunities.', registered: false, registrations: 200 },
    { id: 4, title: 'Sports Day', imgsrc: 'https://imgs.search.brave.com/jNEPEiT5JFlHvQUuX63McNK_p_Ri0Snb3RMQCQ6RBOs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZHJpYmJibGUuY29t/L3VzZXJ1cGxvYWQv/NDIzMjU4MDgvZmls/ZS9vcmlnaW5hbC1m/MTQxZTU3MzRmMzQy/ODliOWNkYjNlMzFi/NDE3MzBlNy5wbmc_/Zm9ybWF0PXdlYnAm/cmVzaXplPTQwMHgz/MDAmdmVydGljYWw9/Y2VudGVy', date: '2025-03-10', description: 'Inter-department sports competition.', registered: false, registrations: 80 },
  ];
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
  currentPage = page;
  render();
  window.history.pushState({ page }, '', `#${page}`);
}

window.addEventListener('popstate', (e) => {
  currentPage = e.state?.page || getPageFromHash();
  render();
});

function getPageFromHash() {
  const hash = window.location.hash.slice(1);
  return hash || 'landing';
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
    </div>
  `;
  document.getElementById('details-modal').classList.remove('hidden');
}

function closeDetailsModal() {
  document.getElementById('details-modal').classList.add('hidden');
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
    complaintsData.push({
      id: result.id,
      ...data,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });
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
      ...data,
      registered: false,
      registrations: 0,
    });
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
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No complaints found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(complaint => `
    <tr>
      <td>${complaint.title}</td>
      <td>${complaint.category}</td>
      <td>${renderStatusBadge(complaint.status)}</td>
      <td>${complaint.date}</td>
    </tr>
  `).join('');
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
    <img class="event-card-image" src="${event.imgsrc}" alt="event-image" width="100%"/>
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
    <img class="event-card-image" src="${event.imgsrc}" width="100%" height="auto"/>
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
      <td><img src="${event.imgsrc}" height="100" alt="event image"></td>
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
    default:
      app.appendChild(renderNotFound());
  }
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
  currentPage = getPageFromHash();
  render();
});
