// ============= Campus Connect Portal - Vanilla JS =============

// Where are the events cards coming from?
// Explanation: The event cards displayed throughout the portal are generated from the data returned by the getEvents() function (see below).
// - The getEvents() function is an asynchronous function that returns a promise resolving to an array of event objects (hardcoded as placeholders for now).
// - This function is called and its result is assigned to the global variable eventsData in several places (see the render function).
// - The appropriate data rendering function (such as renderEventsList() or renderUpcomingEvents()) then uses eventsData to generate HTML for each card, mapping each event object to a block of HTML.
// - These HTML blocks are inserted into containers in the DOM, such as those with id="events-list" or id="upcoming-events" (see renderEventsList and renderUpcomingEvents below).
// See more inline explanations in the relevant functions below.
// Prefer API base configured in `index.html` (window.CAMPUSCONNECT_API_BASE).
// Always normalize to exactly one trailing slash so we can safely do `${API_BASE}api/...`.
const API_BASE = `${String(window.CAMPUSCONNECT_API_BASE || 'http://localhost:8080').replace(/\/+$/, '')}/`;

async function fetchJson(url, options = {}) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:14',message:'fetchJson called',data:{url,method:options.method||'GET',hasCredentials:true,isRegistrationEndpoint:url.includes('/events/register/')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const res = await fetch(url, {
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    // Keep auth/session behavior consistent with other calls.
    credentials: "include",
    ...options,
  });

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:25',message:'fetchJson response received',data:{url,status:res.status,statusText:res.statusText,ok:res.ok,isRegistrationEndpoint:url.includes('/events/register/')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Some endpoints may return empty body; handle safely.
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:34',message:'fetchJson error response',data:{url,status:res.status,data,isRegistrationEndpoint:url.includes('/events/register/')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const msg =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
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
    // Backend image/registrations not implemented yet.
    imgsrc: "",
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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:230',message:'getEvents called',data:{currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null,hasCurrentUser:!!currentUser,currentPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:243',message:'calling getMyRegisteredEvents in getEvents',data:{currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      myRegisteredEventIds = await getMyRegisteredEvents();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:245',message:'getMyRegisteredEvents returned',data:{myRegisteredEventIds,count:myRegisteredEventIds.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:248',message:'skipping getMyRegisteredEvents',data:{currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null,reason:!currentUser?'no currentUser':currentUser.role!=='student'?'not student':'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:260',message:'getEvents returning',data:{eventsCount:events.length,registeredCount:events.filter(e=>e.registered).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return events;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:262',message:'getEvents error',data:{errorMessage:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.error("Failed to load events from backend", err);
    return [];
  }
}

async function registerForEvent(eventId) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:267',message:'registerForEvent called',data:{eventId,currentUser:currentUser?{id:currentUser.id,role:currentUser.role,name:currentUser.name}:null,hasCurrentUser:!!currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Ensure we have a valid session before attempting registration
  if (!currentUser) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:270',message:'currentUser is null, calling ensureCurrentUser',data:{eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    await ensureCurrentUser();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:273',message:'after ensureCurrentUser',data:{currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null,hasCurrentUser:!!currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (!currentUser) {
      throw new Error('Not logged in. Please log in to register for events.');
    }
  }
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:277',message:'calling fetchJson for registration',data:{eventId,url:`${API_BASE}api/events/register/${eventId}`,currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const result = await fetchJson(`${API_BASE}api/events/register/${eventId}`, {
      method: 'POST'
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:281',message:'registration API success',data:{eventId,result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:283',message:'registration API error',data:{eventId,errorMessage:err.message,errorStack:err.stack,is401:err.message&&(err.message.includes('Not logged in')||err.message.includes('401'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('Failed to register for event', err);
    // If 401, try to refresh auth and throw a clearer error
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:286',message:'401 error detected, refreshing auth',data:{eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:333',message:'getMyRegisteredEvents called',data:{currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null,hasCurrentUser:!!currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    const eventIds = await fetchJson(`${API_BASE}api/events/register/student/me`, {
      method: 'GET'
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:338',message:'getMyRegisteredEvents success',data:{eventIds,count:Array.isArray(eventIds)?eventIds.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return Array.isArray(eventIds) ? eventIds : [];
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:342',message:'getMyRegisteredEvents error',data:{errorMessage:err.message,is401:err.message&&(err.message.includes('Not logged in')||err.message.includes('401')),currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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

async function updateEvent(eventId) {
    openEventModal(eventId)
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
  
  // TODO: Replace complaints stats with actual API endpoint
  return {
    totalComplaints: 3,
    pendingComplaints: 1,
    eventsRegistered: eventsRegistered,
  };
  // return fetch(`${API_BASE}/student/stats`).then(res => res.json());
}

async function getStaffStats() {
  // Complaints stats are still demo values, but events counts are pulled from backend so dashboards stay accurate.
  const base = {
    totalComplaints: 15,
    pendingComplaints: 5,
    inProgressComplaints: 4,
    resolvedComplaints: 6,
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

// ========== Eye Icon Functionality ==========

function toggleVisibility(eyeicon) {
  const passwordInput = document.getElementById('password');
  if (!passwordInput) return;
  passwordInput.type = (passwordInput.type === 'password') ? 'text' : 'password';
  passwordInput.type === 'text'
  ? eyeicon.firstElementChild.textContent = 'visibility_off'
  : eyeicon.firstElementChild.textContent = 'visibility'
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
      navigate('student-dashboard');      
      return;
    }
    alert(result?.message || 'Student login failed');
  } catch (err) {
    console.error('Student login failed', err);
    alert('Student login failed');
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
    alert(result?.message || 'Staff login failed');
  } catch (err) {
    console.error('Staff login failed', err);
    alert('Staff login failed');
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

async function ensureCurrentUser() {
  if (authChecked) return currentUser;
  authChecked = true;

  try {
    const me = await getMe();
    if (me?.authenticated) {
      currentUser = { id: me.id, email: me.email, name: me.name, role: me.role };
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
  document.getElementById('event-modal').classList.remove('hidden');
}

function closeEventModal() {
  document.getElementById('event-modal').classList.add('hidden');
}

// Store the event ID for registration modal
let pendingRegistrationEventId = null;

async function openRegisterModal(eventId) {
  // Ensure user is authenticated before opening modal
  if (!currentUser) {
    await ensureCurrentUser();
    if (!currentUser) {
      alert('Please log in to register for events');
      navigate('student-login');
      return;
    }
  }
  
  // Check if user is a student
  if (currentUser.role !== 'student') {
    alert('Only students can register for events');
    return;
  }
  
  const event = eventsData.find(e => e.id === eventId);
  if (!event) {
    alert('Event not found');
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
      alert('Please log in to register for events');
      closeRegisterModal();
      navigate('student-login');
      return;
    }
  }
  
  // Check if user is a student
  if (currentUser.role !== 'student') {
    alert('Only students can register for events');
    closeRegisterModal();
    return;
  }
  
  if (!pendingRegistrationEventId) {
    alert('No event selected for registration');
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
      
      alert(result.message || 'Successfully registered for event!');
    } else {
      alert(result?.message || 'Failed to register for event');
    }
  } catch (err) {
    console.error('Registration failed', err);
    // Handle 401 specifically
    if (err.message && (err.message.includes('Not logged in') || err.message.includes('401'))) {
      alert('Your session has expired. Please log in again.');
      closeRegisterModal();
      await handleLogout();
      navigate('student-login');
    } else {
      alert(err?.message || 'Failed to register for event. Please try again.');
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

  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const description = document.getElementById('event-description').value;
  const imageFile = document.getElementById('event-image').files[0];

  // Generate preview URL for UI use only
  let imgsrc = "";
  if (imageFile) {
    imgsrc = URL.createObjectURL(imageFile);
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

      // Add image only for client-side use
      uiEvent.imgsrc = imgsrc;

      // Keep the UI in sync
      eventsData.push(uiEvent);

      closeEventModal();
      renderStaffEventsTable();
      alert('Event created successfully!');
    } else {
      alert('Failed to create event');
    }
  } catch (err) {
    console.error('Create event failed', err);
    alert(err?.message || 'Failed to create event');
  }
}


async function handleRegisterEvent(eventId) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:1280',message:'handleRegisterEvent called',data:{eventId,currentUser:currentUser?{id:currentUser.id,role:currentUser.role,name:currentUser.name}:null,hasCurrentUser:!!currentUser,currentPage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Ensure user is authenticated
  if (!currentUser) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:1283',message:'currentUser is null in handleRegisterEvent',data:{eventId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Try to refresh auth state
    await ensureCurrentUser();
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:1286',message:'after ensureCurrentUser in handleRegisterEvent',data:{currentUser:currentUser?{id:currentUser.id,role:currentUser.role}:null,hasCurrentUser:!!currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (!currentUser) {
      alert('Please log in to register for events');
      navigate('student-login');
      return;
    }
  }
  
  // Check if user is a student
  if (currentUser.role !== 'student') {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:1293',message:'user is not a student',data:{role:currentUser.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    alert('Only students can register for events');
    return;
  }
  
  const event = eventsData.find(e => e.id === eventId);
  if (!event) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/94290e16-d05c-4cf9-b51a-319be0c8f64e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:1298',message:'event not found in eventsData',data:{eventId,eventsDataLength:eventsData.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    alert('Event not found');
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
          
          alert(result.message || 'Successfully unregistered from event!');
        } else {
          alert(result?.message || 'Failed to unregister from event');
        }
      } catch (err) {
        console.error('Unregistration failed', err);
        // Handle 401 specifically
        if (err.message && err.message.includes('Not logged in')) {
          alert('Your session has expired. Please log in again.');
          await handleLogout();
          navigate('student-login');
        } else {
          alert(err?.message || 'Failed to unregister from event. Please try again.');
        }
      }
    }
  } else {
    // Register - open modal for confirmation
    openRegisterModal(eventId);
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
    try {
      const result = await deleteEvent(eventId);
      if (result?.success) {
        eventsData = await getEvents();
        renderStaffEventsTable();
      }
    } catch (err) {
      console.error('Delete event failed', err);
      alert(err?.message || 'Failed to delete event');
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
  
  const upcoming = eventsData.slice(0, 3);
  
  if (upcoming.length === 0) {
    container.innerHTML = '<div class="empty-state">No upcoming events</div>';
    return;
  }

  // EVENT CARD GENERATOR
  container.innerHTML = upcoming.map(event => `
    <div class="event-card w-100">
    <img 
      class="event-card-image w-100"
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
      <td><img src="${getImageSrc(event.imgsrc)}" height="100" alt="event image" style="border-radius: var(--s-round);"></td>
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
    alert(err?.message || 'Failed to update event');
    return;
  }

  // Reload from backend to ensure DB is the source of truth.
  try { eventsData = await getEvents(); } catch (e) { /* ignore */ }

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
  
  const needsStudent = protectedStudentPages.includes(currentPage);
  const needsStaff = protectedStaffPages.includes(currentPage);
  if ((needsStudent || needsStaff) && !authChecked) {
    await ensureCurrentUser();
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

  // Reapply theme to newly inserted templates
  applyTheme(getSavedTheme());
}

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', async () => {
  // try restoring local user
  try {
    const saved = localStorage.getItem('user');
    if (saved) {
      currentUser = JSON.parse(saved);
      authChecked = true;
    }
  } catch (e) {}

  // If no saved user, fallback to server session
  if (!currentUser) {
    await ensureCurrentUser();
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser)); // keep it synced
    }
  }

  currentPage = getPageFromHash();
  render();
});

