// LNMIIT Faculty Recruitment System - Client-side SPA Controller
// Implements Screens S-01 to S-11 and UC-006, UC-007, UC-009/10

const API_BASE = '/api';

// Current session state
let currentUser = {
  userId: "U102",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  role: "APPLICANT",
  applicantId: "A102"
};

// Active screen state
let currentScreen = 'vacancies'; // default view
let currentVacancy = null;
let currentApplication = null;
let currentDraftId = null;
let currentFormStep = 1;
let currentInterview = null;

// Demo personas
const PERSONAS = [
  { id: 'applicant', label: '👨‍🎓 Rahul Sharma (Applicant)', role: 'APPLICANT', email: 'rahul.sharma@example.com', defaultScreen: 'vacancies' },
  { id: 'recruiter', label: '👩‍💼 Anita Verma (Recruitment Cell)', role: 'RECRUITMENT_CELL', email: 'anita.verma@lnmiit.ac.in', defaultScreen: 'rc-dashboard' },
  { id: 'panel1', label: '👨‍🏫 Dr. K. Iyer (Panel 1)', role: 'INTERVIEW_PANEL', email: 'k.iyer@lnmiit.ac.in', defaultScreen: 'panel-interviews' },
  { id: 'panel2', label: '👨‍🏫 Dr. S. Bansal (Panel 2)', role: 'INTERVIEW_PANEL', email: 's.bansal@lnmiit.ac.in', defaultScreen: 'panel-interviews' },
  { id: 'hod', label: '🏛️ Prof. Biswas (HOD CSE)', role: 'HOD', email: 'hod.cse@lnmiit.ac.in', defaultScreen: 'hod-review' }
];

// Helper: Fetch wrapper with standardized error handling
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(currentUser ? { 'Authorization': `Bearer ${currentUser.userId}` } : {})
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    return data;
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}

// Switch Persona instantly
async function switchPersona(personaId) {
  const p = PERSONAS.find(x => x.id === personaId);
  if (!p) return;

  try {
    const user = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: p.email, password: 'dummy' })
    });
    currentUser = user;
    updatePersonaButtons();
    updateNavMenu();
    updateUserPill();
    navigateTo(p.defaultScreen);
    showToast(`Switched persona to ${user.name} (${user.role})`);
  } catch (err) {
    alert(err.message || "Failed to switch persona");
  }
}

function updatePersonaButtons() {
  document.querySelectorAll('.persona-btn').forEach(btn => {
    const pId = btn.getAttribute('data-persona');
    const p = PERSONAS.find(x => x.id === pId);
    if (p && currentUser && p.email === currentUser.email) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateUserPill() {
  const el = document.getElementById('user-pill-container');
  if (!el) return;
  if (currentUser) {
    el.innerHTML = `
      <div class="user-status-pill">
        <span>👤 <strong>${currentUser.name}</strong></span>
        <span class="role-tag">${currentUser.role}</span>
        <button class="btn btn-secondary btn-sm" onclick="showLoginScreen()">Switch/Logout</button>
      </div>
    `;
  } else {
    el.innerHTML = `<button class="btn btn-primary btn-sm" onclick="showLoginScreen()">Sign In</button>`;
  }
}

function updateNavMenu() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let html = '';
  if (currentUser && currentUser.role === 'APPLICANT') {
    html += `<li><a class="nav-link ${currentScreen === 'vacancies' ? 'active' : ''}" onclick="navigateTo('vacancies')">Vacancies</a></li>`;
    html += `<li><a class="nav-link ${currentScreen === 'my-applications' ? 'active' : ''}" onclick="navigateTo('my-applications')">My Applications</a></li>`;
  } else if (currentUser && currentUser.role === 'RECRUITMENT_CELL') {
    html += `<li><a class="nav-link ${currentScreen === 'rc-dashboard' ? 'active' : ''}" onclick="navigateTo('rc-dashboard')">Dashboard & Applications</a></li>`;
    html += `<li><a class="nav-link ${currentScreen === 'create-vacancy' ? 'active' : ''}" onclick="navigateTo('create-vacancy')">➕ List New Vacancy</a></li>`;
    html += `<li><a class="nav-link ${currentScreen === 'vacancies' ? 'active' : ''}" onclick="navigateTo('vacancies')">Browse Openings</a></li>`;
  } else if (currentUser && currentUser.role === 'INTERVIEW_PANEL') {
    html += `<li><a class="nav-link ${currentScreen === 'panel-interviews' ? 'active' : ''}" onclick="navigateTo('panel-interviews')">My Assigned Interviews</a></li>`;
  } else if (currentUser && currentUser.role === 'HOD') {
    html += `<li><a class="nav-link ${currentScreen === 'hod-review' ? 'active' : ''}" onclick="navigateTo('hod-review')">Shortlisted Approvals</a></li>`;
  }

  html += `<li><a class="nav-link" onclick="openTraceabilityModal()">📘 Traceability & UML</a></li>`;
  html += `<li><a class="nav-link" onclick="openAuditModal()">📜 Audit Log</a></li>`;

  nav.innerHTML = html;
}

// Router / Navigation
function navigateTo(screen, params = {}) {
  currentScreen = screen;
  updateNavMenu();
  const container = document.getElementById('content-area');
  container.innerHTML = '<div style="text-align:center; padding: 40px;">⏳ Loading...</div>';

  switch (screen) {
    case 'login':
      renderLoginScreen();
      break;
    case 'vacancies':
      renderVacanciesScreen();
      break;
    case 'vacancy-details':
      renderVacancyDetailsScreen(params.vacancyId);
      break;
    case 'application-form':
      renderApplicationWizard(params.applicationId, params.step || 1);
      break;
    case 'my-applications':
      renderMyApplicationsScreen();
      break;
    case 'rc-dashboard':
      renderRCDashboardScreen(params.vacancyId);
      break;
    case 'create-vacancy':
      renderCreateVacancyScreen();
      break;
    case 'screen-application':
      renderScreenApplicationScreen(params.applicationId);
      break;
    case 'panel-interviews':
      renderPanelInterviewsScreen();
      break;
    case 'interview-eval':
      renderInterviewEvalScreen(params.interviewId);
      break;
    case 'eval-summary':
      renderEvalSummaryScreen(params.interviewId);
      break;
    case 'hod-review':
      renderHODReviewScreen();
      break;
    case 'appointment-letter':
      renderAppointmentLetterScreen(params.applicationId);
      break;
    default:
      renderVacanciesScreen();
  }
}

// --- S-01: LOGIN SCREEN (Figure 7.2) ---
function renderLoginScreen() {
  const container = document.getElementById('content-area');
  container.innerHTML = `
    <div style="max-width: 460px; margin: 40px auto;">
      <div class="card">
        <div class="card-header" style="justify-content:center; text-align:center;">
          <div>
            <h2 class="card-title">Sign In</h2>
            <p class="card-subtitle">Faculty Recruitment Portal - LNMIIT Jaipur</p>
          </div>
        </div>

        <div id="login-error-container"></div>

        <form id="login-form" onsubmit="handleLoginSubmit(event)">
          <div class="form-group">
            <label class="form-label">Login as:</label>
            <div style="display:flex; gap: 20px; font-size: 0.9rem; margin-bottom: 8px;">
              <label><input type="radio" name="loginType" value="APPLICANT" checked> Applicant</label>
              <label><input type="radio" name="loginType" value="STAFF"> Institute staff (RC / Panel / HOD)</label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Email</label>
            <input type="email" id="login-email" class="form-control" placeholder="name@example.com" value="rahul.sharma@example.com" required>
          </div>

          <div class="form-group">
            <label class="form-label required">Password</label>
            <input type="password" id="login-password" class="form-control" placeholder="••••••••" value="password123" required>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 10px;">Login</button>
        </form>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-muted);">
          <p><strong>Quick Login Suggestions:</strong></p>
          <ul style="margin-left: 20px; margin-top: 6px; line-height: 1.6;">
            <li><a href="javascript:void(0)" onclick="quickFillLogin('rahul.sharma@example.com')">rahul.sharma@example.com (Applicant)</a></li>
            <li><a href="javascript:void(0)" onclick="quickFillLogin('anita.verma@lnmiit.ac.in')">anita.verma@lnmiit.ac.in (Recruitment Cell)</a></li>
            <li><a href="javascript:void(0)" onclick="quickFillLogin('k.iyer@lnmiit.ac.in')">k.iyer@lnmiit.ac.in (Interview Panel 1)</a></li>
            <li><a href="javascript:void(0)" onclick="quickFillLogin('hod.cse@lnmiit.ac.in')">hod.cse@lnmiit.ac.in (HOD CSE)</a></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function quickFillLogin(email) {
  document.getElementById('login-email').value = email;
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorContainer = document.getElementById('login-error-container');

  try {
    const user = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    currentUser = user;
    updatePersonaButtons();
    updateUserPill();
    updateNavMenu();

    if (user.role === 'APPLICANT') navigateTo('vacancies');
    else if (user.role === 'RECRUITMENT_CELL') navigateTo('rc-dashboard');
    else if (user.role === 'INTERVIEW_PANEL') navigateTo('panel-interviews');
    else if (user.role === 'HOD') navigateTo('hod-review');
    else navigateTo('vacancies');

  } catch (err) {
    // V-01 (Figure 7.2 & Section 3.1.4)
    errorContainer.innerHTML = `
      <div class="alert-danger-box">
        <strong>Invalid email or password. Please try again.</strong><br>
        <span style="font-size: 0.78rem; opacity: 0.85;">(FR-004: the message does not reveal which field was wrong)</span>
      </div>
    `;
  }
}

function showLoginScreen() {
  renderLoginScreen();
}

// --- S-02: VACANCY LIST (Figure 7.3) ---
async function renderVacanciesScreen() {
  const container = document.getElementById('content-area');
  try {
    const vacancies = await apiRequest('/vacancies');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">Published Faculty Vacancies</h2>
            <p class="card-subtitle">Openings across academic departments at LNMIIT Jaipur</p>
          </div>
          ${currentUser && currentUser.role === 'RECRUITMENT_CELL' ? `
            <button class="btn btn-primary btn-sm" onclick="navigateTo('create-vacancy')">
              ➕ List New Vacancy
            </button>
          ` : ''}
        </div>

        <!-- Filter bar (Figure 7.3) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; display:flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;">
          <div style="flex: 2; min-width: 200px;">
            <label class="form-label">Search by keyword:</label>
            <input type="text" id="vac-search" class="form-control" placeholder="Specialization, ID...">
          </div>
          <div style="flex: 1; min-width: 160px;">
            <label class="form-label">Department:</label>
            <select id="vac-dept" class="form-control">
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics & Comm.">Electronics & Comm.</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 160px;">
            <label class="form-label">Designation:</label>
            <select id="vac-desig" class="form-control">
              <option value="All">All Designations</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
            </select>
          </div>
          <div>
            <button class="btn btn-primary" onclick="filterVacancies()">Filter</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Vacancy ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Specialization</th>
                <th>Closing Date</th>
                <th>Window</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="vacancies-table-body">
              ${renderVacancyRows(vacancies)}
            </tbody>
          </table>
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:10px;">
          Showing 1-${vacancies.length} of ${vacancies.length}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading vacancies: ${err.message}</div>`;
  }
}

function renderVacancyRows(vacancies) {
  if (!vacancies || vacancies.length === 0) {
    return `<tr><td colspan="7" style="text-align:center; padding: 20px;">No vacancies match the criteria.</td></tr>`;
  }
  return vacancies.map(v => {
    const isOpen = v.status === 'PUBLISHED' && new Date() <= new Date(v.closingDate);
    const windowBadge = isOpen ?
      `<span class="status-pill status-OPEN">Open</span>` :
      `<span class="status-pill status-CLOSED">Closed</span>`;
    return `
      <tr>
        <td><strong>${v.vacancyId}</strong></td>
        <td>${v.department}</td>
        <td>${v.designation}</td>
        <td>${v.specialization}</td>
        <td>${v.closingDate}</td>
        <td>${windowBadge}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('vacancy-details', { vacancyId: '${v.vacancyId}' })">View details</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function filterVacancies() {
  const q = document.getElementById('vac-search').value;
  const dept = document.getElementById('vac-dept').value;
  const desig = document.getElementById('vac-desig').value;

  const vacancies = await apiRequest(`/vacancies?dept=${encodeURIComponent(dept)}&designation=${encodeURIComponent(desig)}&q=${encodeURIComponent(q)}`);
  document.getElementById('vacancies-table-body').innerHTML = renderVacancyRows(vacancies);
}

// --- S-03: VACANCY DETAILS (Figure 7.4) ---
async function renderVacancyDetailsScreen(vacancyId) {
  const container = document.getElementById('content-area');
  try {
    const v = await apiRequest(`/vacancies/${vacancyId}`);
    currentVacancy = v;

    const isOpen = v.status === 'PUBLISHED' && new Date() <= new Date(v.closingDate);

    // Check if current applicant has already applied
    let alreadyApplied = null;
    if (currentUser && currentUser.applicantId) {
      const myApps = await apiRequest(`/applications/my?applicantId=${currentUser.applicantId}`);
      alreadyApplied = myApps.find(a => a.vacancyId === vacancyId);
    }

    let actionCardHtml = '';
    if (alreadyApplied) {
      // V-04 (Figure 7.4 & Section 3.1.4)
      actionCardHtml = `
        <div class="card" style="border: 2px solid #e53e3e; background: #fff5f5;">
          <h3 style="font-size:1.1rem; color:#9b2c2c; margin-bottom: 8px;">Already Applied</h3>
          <p style="font-size:0.88rem; color:#9b2c2c; margin-bottom: 12px;">
            You have already applied for this vacancy (Application ID <strong>${alreadyApplied.applicationId}</strong>).
          </p>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('my-applications')">View status</button>
        </div>
      `;
    } else if (!isOpen) {
      // V-03 (Figure 7.4 & Section 3.1.4)
      actionCardHtml = `
        <div class="card" style="border: 2px solid #e53e3e; background: #fff5f5;">
          <h3 style="font-size:1.1rem; color:#9b2c2c; margin-bottom: 8px;">Applications Closed</h3>
          <p style="font-size:0.88rem; color:#9b2c2c; margin-bottom: 12px;">
            Applications for this vacancy are closed. The deadline was <strong>${v.closingDate}</strong>.
          </p>
          <button class="btn btn-secondary btn-sm" disabled>[Apply button disabled]</button>
        </div>
      `;
    } else {
      actionCardHtml = `
        <div class="card" style="background:#f8fafc; border: 1px solid #cbd5e1;">
          <h3 style="font-size:1.1rem; color:var(--lnmiit-navy); margin-bottom: 8px;">Apply for this vacancy</h3>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom: 16px;">
            Keep scanned copies of your certificates ready (PDF/JPG, max 2 MB each).
          </p>
          <button class="btn btn-primary" style="width:100%;" onclick="startApplicationFlow('${v.vacancyId}')">Apply Now</button>
        </div>
      `;
    }

    container.innerHTML = `
      <div>
        <p style="margin-bottom: 14px;">
          <a href="javascript:void(0)" onclick="navigateTo('vacancies')" style="text-decoration:none; color:var(--lnmiit-blue); font-weight:600;">
            ← Back to vacancies
          </a>
        </p>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left: Details Table -->
          <div class="card">
            <h2 class="card-title" style="margin-bottom: 16px;">
              ${v.designation} – ${v.department} (${v.vacancyId})
            </h2>

            <table class="data-table" style="margin-top: 10px;">
              <tbody>
                <tr><th style="width: 32%;">Department</th><td>${v.department}</td></tr>
                <tr><th>Specialization</th><td><strong>${v.specialization}</strong></td></tr>
                <tr><th>Academic level</th><td>${v.academicLevel}</td></tr>
                <tr><th>Education eligibility</th><td>${v.educationEligibility}</td></tr>
                <tr><th>Experience eligibility</th><td>${v.experienceEligibility}</td></tr>
                <tr><th>Compensation & benefits</th><td>${v.compensation}<br><small style="color:var(--text-muted);">${v.benefits}</small></td></tr>
                <tr><th>Nature of position / location</th><td>${v.natureOfPosition}, ${v.location}</td></tr>
                <tr><th>Teaching responsibilities</th><td>${v.teachingResponsibilities}</td></tr>
                <tr><th>Application window</th><td>${v.openingDate} to <strong>${v.closingDate}</strong></td></tr>
                <tr><th>Special Notes</th><td>${v.notes}</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Right: Action Box -->
          <div>
            ${actionCardHtml}

            <div class="card" style="margin-top: 16px; font-size: 0.85rem;">
              <h4 style="font-weight:700; margin-bottom:8px;">Mandatory Documents</h4>
              <ul style="margin-left: 18px; color: var(--text-muted); line-height: 1.6;">
                <li>Aadhar card</li>
                <li>10th / 12th marksheet</li>
                <li>Bachelors & Masters degree certificates</li>
                <li>Experience certificate</li>
                <li>Birth certificate</li>
                <li>Disability certificate (if applicable)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading vacancy details: ${err.message}</div>`;
  }
}

async function startApplicationFlow(vacancyId) {
  if (!currentUser || currentUser.role !== 'APPLICANT') {
    alert("Please switch to an Applicant persona (e.g. Rahul Sharma) to apply.");
    return;
  }

  try {
    const res = await apiRequest(`/vacancies/${vacancyId}/applications`, {
      method: 'POST',
      body: JSON.stringify({ applicantId: currentUser.applicantId })
    });

    currentDraftId = res.applicationId;
    navigateTo('application-form', { applicationId: res.applicationId, step: 1 });
  } catch (err) {
    alert(err.message || "Failed to start application");
  }
}

// --- S-04, S-05, S-06: APPLICATION WIZARD ---
async function renderApplicationWizard(applicationId, step) {
  currentFormStep = step;
  currentDraftId = applicationId;
  const container = document.getElementById('content-area');

  try {
    const appDetails = await apiRequest(`/rc/applications/${applicationId}`);
    currentApplication = appDetails.application;
    const profile = appDetails.profile || {};

    container.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
          <div>
            <h2 style="font-size:1.3rem; font-weight:700; color:var(--lnmiit-navy);">
              Application for ${currentApplication.vacancyId}
            </h2>
            <span class="status-pill status-${currentApplication.status}">${currentApplication.status}</span>
            <span style="font-size:0.85rem; color:var(--text-muted); margin-left: 8px;">ID: ${currentApplication.applicationId}</span>
          </div>
          <div>
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('vacancy-details', { vacancyId: '${currentApplication.vacancyId}' })">Back to Vacancy</button>
          </div>
        </div>

        <!-- Wizard Navigation Stepper (Figure 7.5) -->
        <div class="wizard-steps">
          <div class="wizard-step ${step === 1 ? 'active' : (step > 1 ? 'completed' : '')}" onclick="renderApplicationWizard('${applicationId}', 1)">
            1. Personal ${step > 1 ? '✓' : ''}
          </div>
          <div class="wizard-step ${step === 2 ? 'active' : (step > 2 ? 'completed' : '')}" onclick="renderApplicationWizard('${applicationId}', 2)">
            2. Education ${step > 2 ? '✓' : ''}
          </div>
          <div class="wizard-step ${step === 3 ? 'active' : (step > 3 ? 'completed' : '')}" onclick="renderApplicationWizard('${applicationId}', 3)">
            3. Experience ${step > 3 ? '✓' : ''}
          </div>
          <div class="wizard-step ${step === 4 ? 'active' : (step > 4 ? 'completed' : '')}" onclick="renderApplicationWizard('${applicationId}', 4)">
            4. Documents ${step > 4 ? '✓' : ''}
          </div>
          <div class="wizard-step ${step === 5 ? 'active' : ''}" onclick="renderApplicationWizard('${applicationId}', 5)">
            5. Review & Submit
          </div>
        </div>

        <div id="step-content-container">
          ${getStepContentHtml(step, profile, currentApplication)}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading application wizard: ${err.message}</div>`;
  }
}

function getStepContentHtml(step, profile, app) {
  if (step === 1) {
    // Step 1: Personal (Figure 7.5)
    return `
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 16px;">1. Personal Information</h3>
        <div id="step-error-banner"></div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label required">Salutation</label>
            <select id="p-salutation" class="form-control">
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label required">First Name</label>
            <input type="text" id="p-fname" class="form-control" value="${currentUser.name.split(' ')[0] || 'Rahul'}">
          </div>
          <div class="form-group">
            <label class="form-label required">Last Name</label>
            <input type="text" id="p-lname" class="form-control" value="${currentUser.name.split(' ')[1] || 'Sharma'}">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label required">Date of Birth</label>
            <input type="date" id="p-dob" class="form-control" value="${profile.dateOfBirth || '1995-04-12'}">
          </div>
          <div class="form-group">
            <label class="form-label required">Email</label>
            <input type="email" id="p-email" class="form-control" value="${currentUser.email}" readonly>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label required">Phone Number (10 digits)</label>
            <input type="tel" id="p-phone" class="form-control" value="9876543210" placeholder="10-digit number">
          </div>
          <div class="form-group">
            <label class="form-label required">Willing to relocate?</label>
            <div style="margin-top: 8px; display:flex; gap: 20px;">
              <label><input type="radio" name="p-relocate" value="yes" checked> Yes</label>
              <label><input type="radio" name="p-relocate" value="no"> No</label>
            </div>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label required">Current Residential Address</label>
            <textarea id="p-curr-addr" class="form-control" rows="2">${profile.currentAddress ? `${profile.currentAddress.plotBuilding}, ${profile.currentAddress.locality}, ${profile.currentAddress.city}, ${profile.currentAddress.state} - ${profile.currentAddress.pincode}` : 'Plot 12, Malviya Nagar, Jaipur, Rajasthan, 302017'}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label required">Permanent Residential Address</label>
            <textarea id="p-perm-addr" class="form-control" rows="2">${profile.permanentAddress ? `${profile.permanentAddress.plotBuilding}, ${profile.permanentAddress.locality}, ${profile.permanentAddress.city}, ${profile.permanentAddress.state} - ${profile.permanentAddress.pincode}` : 'Plot 12, Malviya Nagar, Jaipur, Rajasthan, 302017'}</textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Disability Status</label>
          <div style="display:flex; gap: 20px;">
            <label><input type="radio" name="p-disability" value="no" checked> No</label>
            <label><input type="radio" name="p-disability" value="yes"> Yes (certificate required in step 4)</label>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <button class="btn btn-secondary" onclick="saveDraftOnly()">Save Draft</button>
          <button class="btn btn-primary" onclick="proceedToStep(2)">Next: Education →</button>
        </div>
      </div>
    `;
  } else if (step === 2) {
    // Step 2: Education
    const edus = profile.education || [];
    return `
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 16px;">2. Educational Qualifications</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 16px;">
          List all academic degrees starting from your highest qualification (M.Tech / PhD).
        </p>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Degree</th>
                <th>Field of Study</th>
                <th>Institute</th>
                <th>CGPA / Grade</th>
                <th>Passing Year</th>
              </tr>
            </thead>
            <tbody>
              ${edus.map(e => `
                <tr>
                  <td><strong>${e.degree}</strong></td>
                  <td>${e.fieldOfStudy}</td>
                  <td>${e.institute}</td>
                  <td>${e.grade}</td>
                  <td>${e.endYear}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 16px; background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px dashed #cbd5e1;">
          <h4 style="font-size:0.9rem; margin-bottom: 8px;">+ Add Additional Degree / Certificate</h4>
          <div class="form-grid-3">
            <input type="text" id="new-edu-degree" class="form-control" placeholder="Degree (e.g. PhD, M.Tech)">
            <input type="text" id="new-edu-field" class="form-control" placeholder="Field of Study">
            <input type="text" id="new-edu-inst" class="form-control" placeholder="Institute / University">
          </div>
          <div class="form-grid-2" style="margin-top: 10px;">
            <input type="text" id="new-edu-grade" class="form-control" placeholder="Grade/CGPA (e.g. 8.5)">
            <input type="number" id="new-edu-year" class="form-control" placeholder="Passing Year (e.g. 2020)">
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="addEducationRow()">Add Degree</button>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <button class="btn btn-secondary" onclick="renderApplicationWizard('${currentDraftId}', 1)">← Back: Personal</button>
          <div>
            <button class="btn btn-secondary" onclick="saveDraftOnly()">Save Draft</button>
            <button class="btn btn-primary" onclick="proceedToStep(3)">Next: Experience →</button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 3) {
    // Step 3: Experience
    const exps = profile.experience || [];
    return `
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 16px;">3. Teaching & Research Experience</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 16px;">
          Total experience is automatically calculated and evaluated against the vacancy requirement.
        </p>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Position</th>
                <th>Start Year</th>
                <th>End Year</th>
                <th>Total Years</th>
              </tr>
            </thead>
            <tbody>
              ${exps.map(x => `
                <tr>
                  <td><strong>${x.organization}</strong></td>
                  <td>${x.position}</td>
                  <td>${x.startYear}</td>
                  <td>${x.endYear}</td>
                  <td>${x.totalExperience} yrs</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 16px; background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px dashed #cbd5e1;">
          <h4 style="font-size:0.9rem; margin-bottom: 8px;">+ Add Experience Record</h4>
          <div class="form-grid-2">
            <input type="text" id="new-exp-org" class="form-control" placeholder="Institute / Organization">
            <input type="text" id="new-exp-pos" class="form-control" placeholder="Position (e.g. Assistant Professor)">
          </div>
          <div class="form-grid-3" style="margin-top: 10px;">
            <input type="number" id="new-exp-start" class="form-control" placeholder="Start Year">
            <input type="number" id="new-exp-end" class="form-control" placeholder="End Year">
            <input type="number" step="0.5" id="new-exp-years" class="form-control" placeholder="Total Yrs (e.g. 2.5)">
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="addExperienceRow()">Add Experience</button>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <button class="btn btn-secondary" onclick="renderApplicationWizard('${currentDraftId}', 2)">← Back: Education</button>
          <div>
            <button class="btn btn-secondary" onclick="saveDraftOnly()">Save Draft</button>
            <button class="btn btn-primary" onclick="proceedToStep(4)">Next: Documents →</button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 4) {
    // Step 4: Documents (Figure 7.6)
    const docs = app.documents || [];
    const docTypeList = [
      { type: 'AADHAR_CARD', label: 'Aadhar card', required: true },
      { type: 'MARKSHEET_10', label: '10th / 12th marksheet', required: true },
      { type: 'MASTERS_DEGREE', label: 'Masters degree certificate', required: true },
      { type: 'EXPERIENCE_CERTIFICATE', label: 'Experience certificate', required: true },
      { type: 'BIRTH_CERTIFICATE', label: 'Birth certificate', required: true },
      { type: 'DISABILITY_CERTIFICATE', label: 'Disability certificate', required: profile.hasDisability }
    ];

    return `
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 16px;">4. Upload Documents</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 14px;">
          Allowed formats are <strong>PDF, JPG, PNG</strong> up to <strong>2 MB</strong> per file (UC-006 A5).
        </p>

        <div id="doc-error-banner"></div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Required</th>
                <th>File</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${docTypeList.map(dt => {
                const uploaded = docs.find(d => d.documentType === dt.type);
                const isUploaded = !!uploaded;
                const statusBadge = isUploaded ?
                  (uploaded.verificationStatus === 'REJECTED' ?
                    `<span class="status-pill status-NOT_ELIGIBLE">Rejected</span>` :
                    `<span class="status-pill status-OPEN">Uploaded (${uploaded.fileSizeKB} KB)</span>`) :
                  `<span class="status-pill status-CLOSED">Missing</span>`;

                return `
                  <tr>
                    <td><strong>${dt.label}</strong></td>
                    <td>${dt.required ? '<span style="color:#e53e3e; font-weight:bold;">Yes</span>' : 'If applicable'}</td>
                    <td>${isUploaded ? `<a href="javascript:void(0)" onclick="previewFakeDoc('${uploaded.fileName}')">${uploaded.fileName}</a>` : '<em style="color:#a0aec0;">Not selected</em>'}</td>
                    <td>${statusBadge}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="triggerFileUpload('${dt.type}', '${dt.label}')">
                        ${isUploaded ? 'Replace' : 'Choose file'}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <button class="btn btn-secondary" onclick="renderApplicationWizard('${currentDraftId}', 3)">← Back: Experience</button>
          <div>
            <button class="btn btn-secondary" onclick="saveDraftOnly()">Save Draft</button>
            <button class="btn btn-primary" onclick="proceedToStep(5)">Next: Review & Submit →</button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 5) {
    // Step 5: Review & Submit (Figure 7.7)
    const docs = app.documents || [];
    const isSubmitted = app.status !== 'DRAFT';

    if (isSubmitted) {
      // Confirmation state (Figure 7.7 right side)
      return `
        <div class="card" style="border: 2px solid #38a169;">
          <div style="text-align:center; padding: 20px 0;">
            <div style="font-size:3rem; margin-bottom: 10px;">✅</div>
            <h2 style="color:#22543d; font-size:1.4rem;">Application Submitted Successfully</h2>
            <p style="color:var(--text-muted); font-size:0.9rem; margin-top: 4px;">
              Your application has been logged into the LNMIIT recruitment database.
            </p>
          </div>

          <table class="data-table" style="max-width: 600px; margin: 16px auto;">
            <tbody>
              <tr><th style="width:40%;">Application ID</th><td><strong>${app.applicationId}</strong></td></tr>
              <tr><th>Vacancy</th><td>${app.vacancyId}</td></tr>
              <tr><th>Submitted On</th><td>${app.submissionDate || new Date().toLocaleString()}</td></tr>
              <tr><th>Initial Status</th><td><span class="status-pill status-${app.status}">${app.status}</span></td></tr>
            </tbody>
          </table>

          <div class="alert-info" style="max-width: 600px; margin: 16px auto; font-size:0.85rem;">
            📧 A confirmation email has been sent to <strong>${app.applicantEmail}</strong> (FR-025).
          </div>

          <div style="text-align:center; margin-top: 24px; display:flex; justify-content:center; gap: 14px;">
            <button class="btn btn-primary" onclick="navigateTo('my-applications')">Track Application Status</button>
            <button class="btn btn-secondary" onclick="navigateTo('vacancies')">Back to Vacancies</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <h3 class="card-title" style="margin-bottom: 16px;">5. Review & Final Submission</h3>

        <div id="submit-error-banner"></div>

        <div style="background:#f8fafc; padding: 18px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h4 style="font-size: 1rem; color: var(--lnmiit-navy); margin-bottom: 12px;">Submission Summary</h4>
          <ul style="line-height: 1.8; font-size: 0.9rem; margin-left: 20px;">
            <li>Applicant: <strong>${app.applicantName}</strong> (${app.applicantEmail})</li>
            <li>Target Opening: <strong>${app.vacancyId}</strong></li>
            <li>Highest Degree: <strong>${profile.education && profile.education.length > 0 ? profile.education[0].degree : 'M.Tech'}</strong></li>
            <li>Total Experience: <strong>${profile.experience ? profile.experience.reduce((s,x)=>s+(parseFloat(x.totalExperience)||0),0) : 3.0} years</strong></li>
            <li>Uploaded Documents: <strong>${docs.length} verified attachments</strong></li>
          </ul>
        </div>

        <div style="margin-bottom: 20px; padding: 14px; background: #fffaf0; border: 1px solid #fbd38d; border-radius: 6px; font-size: 0.88rem;">
          <label style="display:flex; align-items:flex-start; gap: 10px; cursor:pointer;">
            <input type="checkbox" id="declaration-check" style="margin-top: 4px;">
            <span>
              <strong>Applicant Declaration (BR-005):</strong><br>
              I hereby declare that all information submitted in this application is true and complete to the best of my knowledge.
              I understand that once submitted, <strong>no changes are permitted</strong> and the record is permanently locked for screening.
            </span>
          </label>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <button class="btn btn-secondary" onclick="renderApplicationWizard('${currentDraftId}', 4)">← Back: Documents</button>
          <div>
            <button class="btn btn-secondary" onclick="saveDraftOnly()">Save Draft</button>
            <button class="btn btn-success" onclick="confirmAndSubmitApplication('${app.applicationId}')">Submit Application</button>
          </div>
        </div>
      </div>
    `;
  }
}

async function proceedToStep(nextStep) {
  await saveDraftOnly();
  renderApplicationWizard(currentDraftId, nextStep);
}

async function saveDraftOnly() {
  if (!currentDraftId) return;

  const profileData = {
    profile: {
      dateOfBirth: document.getElementById('p-dob') ? document.getElementById('p-dob').value : '1995-04-12',
      willingnessToRelocate: true
    }
  };

  try {
    await apiRequest(`/applications/${currentDraftId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    showToast("Draft saved successfully");
  } catch (err) {
    console.error("Draft save error:", err);
  }
}

function triggerFileUpload(documentType, label) {
  const modalHtml = `
    <div class="modal-overlay" id="upload-modal">
      <div class="modal-content" style="max-width: 450px;">
        <div class="modal-header">
          <h3 class="modal-title">Upload ${label}</h3>
          <button class="close-btn" onclick="closeModal('upload-modal')">&times;</button>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 14px;">
          Select file (simulated upload). Allowed: PDF, JPG, PNG &le; 2MB.
        </p>

        <div class="form-group">
          <label class="form-label">Simulate Sample File:</label>
          <select id="mock-file-select" class="form-control">
            <option value="valid_cert.pdf:450:application/pdf">valid_cert.pdf (450 KB - Valid)</option>
            <option value="scanned_id.jpg:620:image/jpeg">scanned_id.jpg (620 KB - Valid)</option>
            <option value="large_file.pdf:3100:application/pdf">large_file.pdf (3.1 MB - Size Error V-07)</option>
            <option value="resume.docx:120:application/docx">resume.docx (Invalid format Error V-07)</option>
          </select>
        </div>

        <div style="display:flex; justify-content:flex-end; gap: 10px; margin-top: 20px;">
          <button class="btn btn-secondary" onclick="closeModal('upload-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="executeMockUpload('${documentType}')">Upload File</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function executeMockUpload(documentType) {
  const val = document.getElementById('mock-file-select').value;
  const [fileName, sizeKB, mimeType] = val.split(':');
  closeModal('upload-modal');

  try {
    await apiRequest(`/applications/${currentDraftId}/documents`, {
      method: 'POST',
      body: JSON.stringify({
        documentType,
        fileName,
        fileSizeKB: parseInt(sizeKB),
        mimeType
      })
    });
    showToast(`Uploaded ${fileName} successfully`);
    renderApplicationWizard(currentDraftId, 4);
  } catch (err) {
    // V-07 (Section 3.1.4)
    const banner = document.getElementById('doc-error-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="alert-danger-box">
          <strong>${err.message || 'File upload error'}</strong>
        </div>
      `;
    } else {
      alert(err.message);
    }
  }
}

async function confirmAndSubmitApplication(applicationId) {
  const check = document.getElementById('declaration-check');
  if (!check || !check.checked) {
    alert("Please acknowledge the declaration checkbox before submitting.");
    return;
  }

  if (!confirm("Submit application? You will not be able to edit it afterwards (BR-005).")) {
    return;
  }

  try {
    const res = await apiRequest(`/applications/${applicationId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ applicantId: currentUser.applicantId })
    });
    showToast("Application submitted successfully!");
    renderApplicationWizard(applicationId, 5);
  } catch (err) {
    // V-08 (Missing documents) or V-03 (Window closed)
    const banner = document.getElementById('submit-error-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="alert-danger-box">
          <strong>${err.message}</strong>
        </div>
      `;
    } else {
      alert(err.message);
    }
  }
}

// --- FR-018 & BR-010: MY APPLICATIONS & TIMELINE TRACKER ---
async function renderMyApplicationsScreen() {
  const container = document.getElementById('content-area');
  try {
    const apps = await apiRequest(`/applications/my?applicantId=${currentUser.applicantId || 'A102'}`);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">My Applications</h2>
            <p class="card-subtitle">Real-time status tracking across recruitment stages (FR-018, BR-010)</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('vacancies')">+ Apply for Another Vacancy</button>
        </div>

        ${apps.length === 0 ? `<p style="padding: 20px; text-align:center;">No applications submitted yet.</p>` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Vacancy</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Stage Tracking</th>
                </tr>
              </thead>
              <tbody>
                ${apps.map(a => `
                  <tr>
                    <td><strong>${a.applicationId}</strong></td>
                    <td>${a.vacancyId}</td>
                    <td>${a.submissionDate ? new Date(a.submissionDate).toLocaleDateString() : 'Draft'}</td>
                    <td><span class="status-pill status-${a.status}">${a.status}</span></td>
                    <td>
                      <button class="btn btn-primary btn-sm" onclick="showApplicationTimeline('${a.applicationId}')">View Progress Tracker</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <div id="timeline-details-area"></div>
    `;

    if (apps.length > 0) {
      showApplicationTimeline(apps[0].applicationId);
    }
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading applications: ${err.message}</div>`;
  }
}

async function showApplicationTimeline(applicationId) {
  const area = document.getElementById('timeline-details-area');
  const details = await apiRequest(`/rc/applications/${applicationId}`);
  const a = details.application;

  // Stages: Submitted -> Screening -> Interview -> HOD Approval -> Appointed
  const stages = [
    { key: 'SUBMITTED', label: '1. Submitted' },
    { key: 'SCREENED', label: '2. Screening' },
    { key: 'INTERVIEW', label: '3. Interview' },
    { key: 'HOD', label: '4. HOD Approval' },
    { key: 'APPOINTED', label: '5. Appointment' }
  ];

  let activeIndex = 0;
  if (['SUBMITTED', 'UNDER_SCREENING'].includes(a.status)) activeIndex = 1;
  else if (['ELIGIBLE', 'SHORTLISTED', 'REVIEW_REQUIRED'].includes(a.status)) activeIndex = 2;
  else if (['INTERVIEW_SCHEDULED', 'IN_PROGRESS', 'VALIDATED'].includes(a.status)) activeIndex = 3;
  else if (['APPROVED_BY_HOD'].includes(a.status)) activeIndex = 4;
  else if (['APPOINTED'].includes(a.status)) activeIndex = 5;

  area.innerHTML = `
    <div class="card" style="margin-top: 20px;">
      <h3 class="card-title" style="margin-bottom: 4px;">Recruitment Stage Progress: ${a.applicationId}</h3>
      <p class="card-subtitle">Current status: <strong>${a.status}</strong></p>

      <div class="timeline">
        ${stages.map((st, idx) => {
          const isDone = idx < activeIndex;
          const isCurr = idx === activeIndex - 1;
          const cls = isDone ? 'completed' : (isCurr ? 'active' : '');
          return `
            <div class="timeline-item ${cls}">
              <div class="timeline-circle">${isDone ? '✓' : (idx + 1)}</div>
              <div class="timeline-label">${st.label}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border-radius: 6px; padding: 16px; margin-top: 16px; font-size: 0.88rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 8px;">Stage Notes & Updates:</h4>
        <ul style="line-height: 1.7; margin-left: 20px; color: var(--text-muted);">
          ${a.submissionDate ? `<li>Application submitted on: <strong>${new Date(a.submissionDate).toLocaleString()}</strong></li>` : ''}
          ${a.screeningRecord ? `<li>Screening Result: <strong>${a.screeningRecord.result}</strong> (${a.screeningRecord.comments})</li>` : '<li>Application awaiting screening by Recruitment Cell.</li>'}
          ${a.interviewId ? `<li>Assigned Interview Session: <strong>${a.interviewId}</strong></li>` : ''}
          ${a.hodReview && a.hodReview.reviewed ? `<li>HOD Review: <strong>${a.hodReview.decision}</strong> (${a.hodReview.comments})</li>` : ''}
          ${a.appointmentLetter ? `<li>Official Appointment Letter Issued: <strong>${a.appointmentLetter.referenceNo}</strong></li>` : ''}
        </ul>

        ${a.appointmentLetter ? `
          <div style="margin-top: 14px;">
            <button class="btn btn-success" onclick="navigateTo('appointment-letter', { applicationId: '${a.applicationId}' })">
              📄 View Appointment Letter
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// --- S-07: RECRUITMENT CELL DASHBOARD & APPLICATION LIST (Figure 7.8) ---
async function renderRCDashboardScreen(selectedVacancyId) {
  const container = document.getElementById('content-area');
  try {
    const vacancies = await apiRequest('/vacancies');
    const defaultVacId = selectedVacancyId || 'FAC-CS-2026-01';
    const currentVac = vacancies.find(v => v.vacancyId === defaultVacId) || vacancies[0];
    const apps = await apiRequest(`/rc/vacancies/${currentVac.vacancyId}/applications`);

    // Counter metrics (Figure 7.8 summary box)
    const totalCount = apps.length;
    const submittedCount = apps.filter(a => a.status === 'SUBMITTED').length;
    const eligibleCount = apps.filter(a => a.status === 'ELIGIBLE' || a.status === 'SHORTLISTED').length;
    const notEligibleCount = apps.filter(a => a.status === 'NOT_ELIGIBLE').length;
    const reviewReqCount = apps.filter(a => a.status === 'REVIEW_REQUIRED').length;

    const isWindowClosed = currentVac.status === 'CLOSED' || (new Date() > new Date(currentVac.closingDate));

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 280px 1fr; gap: 20px;">
        <!-- Left Sidebar: Vacancies & Summary -->
        <div>
          <div class="card" style="padding: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--lnmiit-navy); margin:0;">Vacancies</h3>
              <button class="btn btn-primary btn-sm" onclick="navigateTo('create-vacancy')" style="padding: 3px 8px; font-size: 0.75rem;">+ List New</button>
            </div>
            <ul style="list-style:none; line-height: 1.8; font-size: 0.85rem;">
              ${vacancies.map(v => `
                <li style="margin-bottom: 6px;">
                  <a href="javascript:void(0)" onclick="renderRCDashboardScreen('${v.vacancyId}')"
                     style="font-weight: ${v.vacancyId === currentVac.vacancyId ? 'bold' : 'normal'}; color: ${v.vacancyId === currentVac.vacancyId ? 'var(--lnmiit-blue)' : 'inherit'}; text-decoration:none;">
                    ▶ ${v.vacancyId} (${v.status === 'CLOSED' ? 'Closed' : 'Open'})
                  </a>
                </li>
              `).join('')}
            </ul>

            <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border-color); font-size: 0.82rem;">
              <h4 style="font-weight:700; margin-bottom: 6px;">Summary: ${currentVac.vacancyId}</h4>
              <p>Total: <strong>${totalCount}</strong></p>
              <p>Submitted: <strong>${submittedCount}</strong></p>
              <p>Eligible: <strong>${eligibleCount}</strong></p>
              <p>Not eligible: <strong>${notEligibleCount}</strong></p>
              <p>Requires review: <strong>${reviewReqCount}</strong></p>
            </div>
          </div>
        </div>

        <!-- Right: Applications Table -->
        <div>
          <div class="card">
            <div class="card-header">
              <div>
                <h2 class="card-title">Applications – ${currentVac.vacancyId}</h2>
                <p class="card-subtitle">${currentVac.designation}, ${currentVac.specialization} (${currentVac.department})</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="navigateTo('create-vacancy')">
                ➕ List New Vacancy
              </button>
            </div>

            <!-- Precondition Notice (V-10) -->
            ${!isWindowClosed ? `
              <div class="alert-warning" style="font-size:0.85rem;">
                ⚠️ Screening is available after the application window closes on ${currentVac.closingDate} (UC-007 precondition).
              </div>
            ` : ''}

            <!-- Filter Controls -->
            <div style="display:flex; justify-content:space-between; gap: 12px; margin-bottom: 16px;">
              <input type="text" id="rc-search-input" class="form-control" placeholder="Search applicant name / ID" style="max-width: 300px;">
              <select id="rc-status-filter" class="form-control" style="max-width: 200px;">
                <option value="ALL">Status: All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ELIGIBLE">Eligible</option>
                <option value="NOT_ELIGIBLE">Not eligible</option>
                <option value="REVIEW_REQUIRED">Requires review</option>
              </select>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Applicant</th>
                    <th>Highest Degree</th>
                    <th>Exp. (yrs)</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${apps.map(a => `
                    <tr>
                      <td><strong>${a.applicationId}</strong></td>
                      <td>${a.applicantName}</td>
                      <td>${a.highestDegree}</td>
                      <td>${a.totalExperience}</td>
                      <td>${a.submissionDate ? a.submissionDate.split('T')[0] : 'Draft'}</td>
                      <td><span class="status-pill status-${a.status}">${a.status}</span></td>
                      <td>
                        <button class="btn btn-primary btn-sm" onclick="navigateTo('screen-application', { applicationId: '${a.applicationId}' })">
                          ${a.screeningRecord ? 'View / Re-screen' : 'Screen'}
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading RC Dashboard: ${err.message}</div>`;
  }
}

// --- S-08: SCREEN APPLICATION (Figure 7.9) ---
async function renderScreenApplicationScreen(applicationId) {
  const container = document.getElementById('content-area');
  try {
    const data = await apiRequest(`/rc/applications/${applicationId}`);
    const app = data.application;
    const profile = data.profile || {};
    const vacancy = data.vacancy || {};
    const suggestion = data.suggestion || { suggested: 'REVIEW_REQUIRED', reason: '' };

    container.innerHTML = `
      <div>
        <p style="margin-bottom: 14px;">
          <a href="javascript:void(0)" onclick="navigateTo('rc-dashboard', { vacancyId: '${app.vacancyId}' })" style="text-decoration:none; color:var(--lnmiit-blue); font-weight:600;">
            ← Back to applications
          </a>
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--lnmiit-navy);">
              Screening: ${app.applicationId} – ${app.applicantName}
            </h2>
            <span class="status-pill status-${app.status}">${app.status}</span>
          </div>
        </div>

        <div id="screening-error-banner"></div>

        <div class="screen-split-container">
          <!-- Left Column: Applicant Information & Documents -->
          <div class="card">
            <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">Applicant Information</h3>
            <div style="font-size:0.88rem; line-height: 1.7; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 18px;">
              <p><strong>Education:</strong> ${profile.education && profile.education.length > 0 ? `${profile.education[0].degree} (${profile.education[0].fieldOfStudy}), ${profile.education[0].institute}, Grade: ${profile.education[0].grade}` : 'M.Tech (CSE)'}</p>
              <p><strong>Experience:</strong> ${profile.experience && profile.experience.length > 0 ? `${profile.experience[0].position}, ${profile.experience[0].organization} (${profile.experience[0].totalExperience} yrs)` : '3.0 yrs'}</p>
              <p><strong>DOB:</strong> ${profile.dateOfBirth || '1995-04-12'} | <strong>Relocate:</strong> ${profile.willingnessToRelocate ? 'Yes' : 'No'}</p>
            </div>

            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 10px;">Submitted Documents & Verification</h4>
            <div class="table-responsive">
              <table class="data-table" style="font-size:0.82rem;">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Verification Check</th>
                  </tr>
                </thead>
                <tbody>
                  ${(app.documents || []).map(d => `
                    <tr>
                      <td>
                        <a href="javascript:void(0)" onclick="previewFakeDoc('${d.fileName}')" style="font-weight:600; color:var(--lnmiit-blue);">
                          ${d.fileName}
                        </a>
                        <br><small style="color:var(--text-muted);">${d.documentType}</small>
                      </td>
                      <td>
                        <label style="margin-right: 12px; cursor:pointer;">
                          <input type="radio" name="doc_verify_${d.documentId}" value="VERIFIED"
                                 ${d.verificationStatus === 'VERIFIED' ? 'checked' : ''}
                                 onchange="handleDocVerificationChange('${app.applicationId}', '${d.documentId}', 'VERIFIED')">
                          Verified
                        </label>
                        <label style="cursor:pointer; color:#c53030;">
                          <input type="radio" name="doc_verify_${d.documentId}" value="REJECTED"
                                 ${d.verificationStatus === 'REJECTED' ? 'checked' : ''}
                                 onchange="handleDocVerificationChange('${app.applicationId}', '${d.documentId}', 'REJECTED')">
                          Issue
                        </label>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column: Eligibility Criteria Comparison & Decision -->
          <div class="card">
            <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">Eligibility Criteria (${vacancy.criteria ? vacancy.criteria.criteriaId : 'ELIG-CS-01'})</h3>

            <table class="data-table" style="font-size:0.85rem; margin-bottom: 16px;">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Required</th>
                  <th>Applicant</th>
                  <th>Check</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Education</td>
                  <td>${vacancy.criteria ? vacancy.criteria.educationRequirement : 'M.Tech / PhD'}</td>
                  <td>${app.highestDegree}</td>
                  <td><span style="color:#276749; font-weight:bold;">✓</span></td>
                </tr>
                <tr>
                  <td>Experience</td>
                  <td>&ge; ${vacancy.criteria ? vacancy.criteria.minExperienceYears : 2.0} yrs</td>
                  <td>${app.totalExperience} yrs</td>
                  <td><span style="color:#276749; font-weight:bold;">✓</span></td>
                </tr>
                <tr>
                  <td>Other</td>
                  <td>As per institute rules</td>
                  <td>Verified</td>
                  <td><span style="color:#276749; font-weight:bold;">✓</span></td>
                </tr>
              </tbody>
            </table>

            <!-- System suggestion banner (Figure 7.9) -->
            <div style="background: #ebf8ff; border: 1px solid #90cdf4; border-radius: 6px; padding: 10px; margin-bottom: 16px; font-size: 0.85rem;">
              <strong>System suggestion:</strong> <span class="status-pill status-${suggestion.suggested}">${suggestion.suggested}</span>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-top: 4px;">(${suggestion.reason})</p>
            </div>

            <!-- Decision Radio Controls -->
            <div class="form-group">
              <label class="form-label required">Screening Result *</label>
              <div style="display:flex; gap: 16px; font-size: 0.9rem;">
                <label style="cursor:pointer;"><input type="radio" name="screening-res" value="ELIGIBLE" ${app.status === 'ELIGIBLE' || suggestion.suggested === 'ELIGIBLE' ? 'checked' : ''}> Eligible</label>
                <label style="cursor:pointer;"><input type="radio" name="screening-res" value="NOT_ELIGIBLE" ${app.status === 'NOT_ELIGIBLE' ? 'checked' : ''}> Not eligible</label>
                <label style="cursor:pointer;"><input type="radio" name="screening-res" value="REQUIRES_REVIEW" ${app.status === 'REVIEW_REQUIRED' ? 'checked' : ''}> Requires review</label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">Comments / Reasons *</label>
              <textarea id="screening-comments" class="form-control" rows="3" placeholder="Mandatory if Not eligible or Requires review (V-11)">${app.screeningRecord ? app.screeningRecord.comments : 'Required qualifications and experience satisfied'}</textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap: 12px; margin-top: 20px;">
              <button class="btn btn-secondary" onclick="navigateTo('rc-dashboard', { vacancyId: '${app.vacancyId}' })">Cancel</button>
              <button class="btn btn-primary" onclick="submitScreeningDecision('${app.applicationId}')">Save Screening Result</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading screening screen: ${err.message}</div>`;
  }
}

async function handleDocVerificationChange(applicationId, documentId, status) {
  try {
    await apiRequest(`/rc/applications/${applicationId}/verify-doc`, {
      method: 'POST',
      body: JSON.stringify({ documentId, status })
    });

    if (status === 'REJECTED') {
      // V-12: Document issue forces result to Requires review
      const revRadio = document.querySelector('input[name="screening-res"][value="REQUIRES_REVIEW"]');
      if (revRadio) revRadio.checked = true;

      const banner = document.getElementById('screening-error-banner');
      if (banner) {
        banner.innerHTML = `
          <div class="alert-warning" style="font-size:0.85rem;">
            ⚠️ One or more documents could not be verified. Result is automatically switched to Requires review (V-12, BR-007).
          </div>
        `;
      }
    }
  } catch (err) {
    console.error("Doc verify error:", err);
  }
}

async function submitScreeningDecision(applicationId) {
  const resultRadio = document.querySelector('input[name="screening-res"]:checked');
  const comments = document.getElementById('screening-comments').value;
  const result = resultRadio ? resultRadio.value : 'ELIGIBLE';

  try {
    await apiRequest(`/rc/applications/${applicationId}/screening`, {
      method: 'POST',
      body: JSON.stringify({
        rcUserId: currentUser.userId,
        result,
        comments
      })
    });
    showToast("Screening result recorded successfully!");
    renderScreenApplicationScreen(applicationId);
  } catch (err) {
    // V-11: No reason for negative result
    const banner = document.getElementById('screening-error-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="alert-danger-box">
          <strong>${err.message}</strong>
        </div>
      `;
    } else {
      alert(err.message);
    }
  }
}

// --- S-09: ASSIGNED INTERVIEWS (Figure 7.10) ---
async function renderPanelInterviewsScreen() {
  const container = document.getElementById('content-area');
  try {
    const memberId = currentUser.memberId || 'PNL-01';
    const interviews = await apiRequest(`/panel/interviews?memberId=${memberId}`);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">My Assigned Interviews</h2>
            <p class="card-subtitle">Logged in as: <strong>${currentUser.name}</strong> (${currentUser.department})</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Interview ID</th>
                <th>Candidate</th>
                <th>Vacancy</th>
                <th>Date / Time</th>
                <th>Panel</th>
                <th>Status</th>
                <th>My Evaluation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${interviews.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding: 20px;">You have no interviews assigned (V-13).</td></tr>` :
                interviews.map(iv => {
                  const myEval = iv.evaluations.find(e => e.memberId === memberId);
                  const evalBadge = myEval ?
                    `<span class="status-pill status-OPEN">Submitted (${myEval.score}/10)</span>` :
                    `<span class="status-pill status-DRAFT">Not started</span>`;

                  return `
                    <tr>
                      <td><strong>${iv.interviewId}</strong></td>
                      <td>${iv.candidateName}</td>
                      <td>${iv.vacancyId}</td>
                      <td>${iv.interviewDate} ${iv.interviewTime}</td>
                      <td>${iv.panel.length} members</td>
                      <td><span class="status-pill status-${iv.status}">${iv.status}</span></td>
                      <td>${evalBadge}</td>
                      <td>
                        <button class="btn btn-primary btn-sm" onclick="navigateTo('interview-eval', { interviewId: '${iv.interviewId}' })">
                          ${iv.status === 'VALIDATED' || iv.status === 'COMPLETED' ? 'View' : 'Open'}
                        </button>
                        ${iv.evaluations.length >= iv.panel.length ? `
                          <button class="btn btn-secondary btn-sm" onclick="navigateTo('eval-summary', { interviewId: '${iv.interviewId}' })">
                            Summary
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading interviews: ${err.message}</div>`;
  }
}

// --- S-10: EVALUATION FORM (Figure 7.11) ---
async function renderInterviewEvalScreen(interviewId) {
  const container = document.getElementById('content-area');
  try {
    const data = await apiRequest(`/panel/interviews/${interviewId}`);
    const iv = data.interview;
    const memberId = currentUser.memberId || 'PNL-01';
    const myEval = iv.evaluations.find(e => e.memberId === memberId) || {};

    const submittedCount = iv.evaluations.length;
    const panelSize = iv.panel.length;

    container.innerHTML = `
      <div>
        <p style="margin-bottom: 14px;">
          <a href="javascript:void(0)" onclick="navigateTo('panel-interviews')" style="text-decoration:none; color:var(--lnmiit-blue); font-weight:600;">
            ← Back to assigned interviews
          </a>
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--lnmiit-navy);">
              ${iv.interviewId} – ${iv.candidateName}, ${iv.designation} (${iv.department})
            </h2>
            <span class="status-pill status-${iv.status}">${iv.status}</span>
          </div>
          <div>
            <span class="status-pill status-OPEN">${submittedCount} of ${panelSize} panel evaluations submitted</span>
          </div>
        </div>

        <div id="eval-error-banner"></div>

        <div class="screen-split-container">
          <!-- Left: Candidate summary and attendance -->
          <div class="card">
            <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">Candidate Dossier</h3>
            <div style="background:#f8fafc; padding:12px; border-radius:6px; font-size:0.88rem; line-height: 1.7; margin-bottom: 16px;">
              <p><strong>Candidate:</strong> ${iv.candidateName}</p>
              <p><strong>Vacancy:</strong> ${iv.vacancyId} (${iv.designation})</p>
              <p><strong>Scheduled Slot:</strong> ${iv.interviewDate} at ${iv.interviewTime}</p>
            </div>

            <div class="form-group" style="background:#fffaf0; padding:12px; border:1px solid #fbd38d; border-radius:6px;">
              <label class="form-label required">Candidate Attendance (V-16)</label>
              <div style="display:flex; gap: 20px; font-size:0.9rem;">
                <label style="cursor:pointer;"><input type="radio" name="cand-attendance" value="true" checked> Candidate attended</label>
                <label style="cursor:pointer; color:#c53030;"><input type="radio" name="cand-attendance" value="false"> Not attended</label>
              </div>
              <small style="color:var(--text-muted); display:block; margin-top:4px;">
                Selecting "Not attended" confirms ends the flow for this candidate (UC-009/10 A1).
              </small>
            </div>

            <h4 style="font-size: 0.95rem; font-weight:700; margin-bottom: 8px;">Evaluation Guidance</h4>
            <ul style="font-size:0.82rem; color:var(--text-muted); line-height:1.6; margin-left: 18px;">
              <li>Subject Depth & Teaching Demo (Weightage: 40%)</li>
              <li>Research Potential & Publication Quality (Weightage: 30%)</li>
              <li>Communication & Institutional Fit (Weightage: 30%)</li>
            </ul>
          </div>

          <!-- Right: Evaluation Form -->
          <div class="card">
            <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">My Evaluation</h3>

            <div class="form-group">
              <label class="form-label required">Score (0 – 10) *</label>
              <input type="number" step="0.5" id="eval-score" class="form-control" placeholder="e.g. 8.0" value="${myEval.score !== undefined ? myEval.score : 8.0}" min="0" max="10">
              <small style="color:var(--text-muted);">Must be between 0 and 10 (AC-17, V-14).</small>
            </div>

            <div class="form-group">
              <label class="form-label required">Comments on Performance *</label>
              <textarea id="eval-comments" class="form-control" rows="4" placeholder="Mandatory comments regarding candidate performance (V-15)">${myEval.comments || 'Strong networking fundamentals, clear research vision in 5G wireless mesh networks.'}</textarea>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
              <button class="btn btn-secondary" onclick="navigateTo('panel-interviews')">Cancel</button>
              <div>
                <button class="btn btn-primary" onclick="submitPanelEvaluation('${iv.interviewId}')">Submit Evaluation</button>
              </div>
            </div>

            ${submittedCount >= panelSize ? `
              <div style="margin-top: 16px; text-align:center;">
                <button class="btn btn-success" style="width:100%;" onclick="navigateTo('eval-summary', { interviewId: '${iv.interviewId}' })">
                  Go to Panel Summary & Recommendation →
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading interview evaluation: ${err.message}</div>`;
  }
}

async function submitPanelEvaluation(interviewId) {
  const memberId = currentUser.memberId || 'PNL-01';
  const attendedRadio = document.querySelector('input[name="cand-attendance"]:checked');
  const attended = attendedRadio ? attendedRadio.value === 'true' : true;

  if (!attended) {
    // V-16 confirmation modal
    if (!confirm("Mark this candidate as Not attended? This ends the interview process for this candidate (UC-009/10 A1).")) {
      return;
    }
    await apiRequest(`/panel/interviews/${interviewId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ memberId, attended: false })
    });
    showToast("Candidate marked as Not Attended.");
    navigateTo('panel-interviews');
    return;
  }

  const score = document.getElementById('eval-score').value;
  const comments = document.getElementById('eval-comments').value;

  try {
    const res = await apiRequest(`/panel/interviews/${interviewId}/evaluations`, {
      method: 'POST',
      body: JSON.stringify({ memberId, score, comments })
    });

    showToast("Evaluation submitted successfully!");

    if (res.submitted >= res.panelSize) {
      navigateTo('eval-summary', { interviewId });
    } else {
      renderInterviewEvalScreen(interviewId);
    }
  } catch (err) {
    const banner = document.getElementById('eval-error-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="alert-danger-box">
          <strong>${err.message}</strong>
        </div>
      `;
    } else {
      alert(err.message);
    }
  }
}

// --- S-11: EVALUATION RESULT & RECOMMENDATION (Figure 7.12) ---
async function renderEvalSummaryScreen(interviewId) {
  const container = document.getElementById('content-area');
  try {
    const summary = await apiRequest(`/panel/interviews/${interviewId}/summary`);

    container.innerHTML = `
      <div>
        <p style="margin-bottom: 14px;">
          <a href="javascript:void(0)" onclick="navigateTo('panel-interviews')" style="text-decoration:none; color:var(--lnmiit-blue); font-weight:600;">
            ← Back to assigned interviews
          </a>
        </p>

        <div class="card">
          <div class="card-header">
            <div>
              <h2 class="card-title">${summary.interviewId} – Evaluation Summary</h2>
              <p class="card-subtitle">Candidate: <strong>${summary.candidateName}</strong> | Status: <span class="status-pill status-${summary.status}">${summary.status}</span></p>
            </div>
          </div>

          <div id="summary-error-banner"></div>

          <div class="screen-split-container">
            <!-- Left: All Panel Scores Table -->
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 10px;">Panel Evaluations</h3>
              <div class="table-responsive">
                <table class="data-table" style="font-size:0.85rem;">
                  <thead>
                    <tr>
                      <th>Panel Member</th>
                      <th>Score</th>
                      <th>Comments</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${summary.evaluations.map(e => `
                      <tr>
                        <td><strong>${e.memberName}</strong></td>
                        <td><span style="font-size:1.05rem; font-weight:bold; color:var(--lnmiit-blue);">${e.score}</span> / 10</td>
                        <td>${e.comments}</td>
                        <td>${e.evaluationDate ? e.evaluationDate.split('T')[1].slice(0,5) : 'Done'}</td>
                      </tr>
                    `).join('')}
                    <tr style="background:#edf2f7; font-weight:bold;">
                      <td>Aggregate (mean)</td>
                      <td style="font-size:1.15rem; color:#276749;">${summary.aggregateScore || '8.0'}</td>
                      <td colspan="2"><small>computed automatically by the system (CS-3 step 12)</small></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Right: Panel Recommendation Card -->
            <div>
              <div class="card" style="background:#f8fafc; border:1px solid #cbd5e1;">
                <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 12px;">Panel Recommendation *</h3>

                <div class="form-group">
                  <div style="display:flex; flex-direction:column; gap: 10px; font-size:0.9rem;">
                    <label style="cursor:pointer; display:flex; align-items:center; gap: 8px;">
                      <input type="radio" name="panel-rec" value="RECOMMENDED" checked>
                      <strong>Recommend for HOD approval</strong>
                    </label>
                    <label style="cursor:pointer; display:flex; align-items:center; gap: 8px;">
                      <input type="radio" name="panel-rec" value="NOT_RECOMMENDED">
                      Do not recommend
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Consolidated Remarks</label>
                  <textarea id="panel-remarks" class="form-control" rows="3" placeholder="Remarks for HOD">${summary.panelRemarks || 'Recommended unanimously by the CSE interview panel.'}</textarea>
                </div>

                <button class="btn btn-primary" style="width:100%;" onclick="confirmPanelRecommendation('${summary.interviewId}')">
                  Confirm Recommendation & Forward to HOD
                </button>

                <p style="font-size:0.75rem; color:var(--text-muted); margin-top: 10px; line-height: 1.4;">
                  On confirm: interview status → COMPLETED, application status updated, HOD notified (FR-024, UC-009/10 step 15).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading summary: ${err.message}</div>`;
  }
}

async function confirmPanelRecommendation(interviewId) {
  const recRadio = document.querySelector('input[name="panel-rec"]:checked');
  const recommendation = recRadio ? recRadio.value : 'RECOMMENDED';
  const remarks = document.getElementById('panel-remarks').value;
  const memberId = currentUser.memberId || 'PNL-01';

  try {
    await apiRequest(`/panel/interviews/${interviewId}/recommendation`, {
      method: 'POST',
      body: JSON.stringify({ memberId, recommendation, remarks })
    });
    showToast("Recommendation confirmed and forwarded to HOD!");
    navigateTo('panel-interviews');
  } catch (err) {
    const banner = document.getElementById('summary-error-banner');
    if (banner) {
      banner.innerHTML = `<div class="alert-danger-box"><strong>${err.message}</strong></div>`;
    } else {
      alert(err.message);
    }
  }
}

// --- S-12: HOD REVIEW & APPROVAL (UC-012, FR-027, FR-028) ---
async function renderHODReviewScreen() {
  const container = document.getElementById('content-area');
  try {
    const apps = await apiRequest('/rc/vacancies/FAC-CS-2026-01/applications');
    const shortlistedApps = apps.filter(a => a.status === 'SHORTLISTED' || a.status === 'APPROVED_BY_HOD' || a.interviewId);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <h2 class="card-title">HOD Final Review & Approvals (UC-012)</h2>
            <p class="card-subtitle">Department of Computer Science & Engineering - LNMIIT Jaipur</p>
          </div>
        </div>

        <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom: 16px;">
          As Head of Department, review candidates recommended by the Interview Panel. Once approved, the Recruitment Cell generates the formal appointment letter (BR-008).
        </p>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Candidate Name</th>
                <th>Degree & Experience</th>
                <th>Panel Status</th>
                <th>HOD Action</th>
              </tr>
            </thead>
            <tbody>
              ${shortlistedApps.map(a => `
                <tr>
                  <td><strong>${a.applicationId}</strong></td>
                  <td>${a.applicantName}</td>
                  <td>${a.highestDegree} (${a.totalExperience} yrs)</td>
                  <td><span class="status-pill status-${a.status}">${a.status}</span></td>
                  <td>
                    ${a.status === 'APPROVED_BY_HOD' || a.status === 'APPOINTED' ?
                      `<span style="color:#276749; font-weight:bold;">Approved ✓</span>` :
                      `<button class="btn btn-primary btn-sm" onclick="openHODApprovalModal('${a.applicationId}', '${a.applicantName}')">Review & Approve</button>`
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading HOD screen: ${err.message}</div>`;
  }
}

function openHODApprovalModal(applicationId, candidateName) {
  const modalHtml = `
    <div class="modal-overlay" id="hod-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">HOD Decision: ${candidateName} (${applicationId})</h3>
          <button class="close-btn" onclick="closeModal('hod-modal')">&times;</button>
        </div>
        <p style="font-size:0.88rem; margin-bottom: 12px;">
          The candidate has scored <strong>8.0 / 10</strong> in panel evaluation and is recommended for appointment.
        </p>

        <div class="form-group">
          <label class="form-label required">Department Decision</label>
          <div style="display:flex; gap: 20px; font-size:0.9rem;">
            <label style="cursor:pointer;"><input type="radio" name="hod-decision" value="APPROVED" checked> Approve Appointment</label>
            <label style="cursor:pointer; color:#c53030;"><input type="radio" name="hod-decision" value="REJECTED"> Reject Candidate</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">HOD Comments / Justification</label>
          <textarea id="hod-comments" class="form-control" rows="3" placeholder="Department recommendations...">Approved based on outstanding research profile in 5G wireless networks and strong teaching demonstration.</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap: 10px; margin-top: 20px;">
          <button class="btn btn-secondary" onclick="closeModal('hod-modal')">Cancel</button>
          <button class="btn btn-success" onclick="executeHODDecision('${applicationId}')">Confirm Decision</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function executeHODDecision(applicationId) {
  const decRadio = document.querySelector('input[name="hod-decision"]:checked');
  const decision = decRadio ? decRadio.value : 'APPROVED';
  const comments = document.getElementById('hod-comments').value;
  closeModal('hod-modal');

  try {
    await apiRequest(`/hod/applications/${applicationId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ hodId: currentUser.hodId || 'HOD-CSE-01', decision, comments })
    });
    showToast(`HOD decision recorded: ${decision}!`);
    renderHODReviewScreen();
  } catch (err) {
    alert(err.message);
  }
}

// --- S-13: APPOINTMENT LETTER GENERATION (UC-013, FR-029) ---
async function renderAppointmentLetterScreen(applicationId) {
  const container = document.getElementById('content-area');
  try {
    // Generate or fetch appointment letter
    const letter = await apiRequest(`/rc/applications/${applicationId}/appointment-letter`, {
      method: 'POST',
      body: JSON.stringify({ rcUserId: currentUser.userId })
    });

    container.innerHTML = `
      <div>
        <p style="margin-bottom: 14px;">
          <a href="javascript:void(0)" onclick="navigateTo('my-applications')" style="text-decoration:none; color:var(--lnmiit-blue); font-weight:600;">
            ← Back to My Applications
          </a>
        </p>

        <div class="card" style="padding: 10px; display:flex; justify-content:flex-end; gap: 10px; margin-bottom: 16px;">
          <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <!-- Formal Letterhead -->
        <div class="letterhead-card">
          <div class="letterhead-header">
            <h2>THE LNM INSTITUTE OF INFORMATION TECHNOLOGY, JAIPUR</h2>
            <p style="font-size:0.85rem; color:#718096; margin-top: 4px;">Rupa ki Nangal, Post-Sumel, Via-Jamdoli, Jaipur-302031, Rajasthan, India</p>
            <p style="font-size:0.8rem; font-weight:bold; letter-spacing: 1px; color:#c05621; margin-top: 6px;">OFFICE OF RECRUITMENT & HUMAN RESOURCES</p>
          </div>

          <div style="display:flex; justify-content:space-between; margin-bottom: 24px; font-size: 0.9rem;">
            <div><strong>Ref:</strong> ${letter.referenceNo}</div>
            <div><strong>Date:</strong> ${letter.issueDate}</div>
          </div>

          <div style="margin-bottom: 24px; font-size: 0.95rem;">
            To,<br>
            <strong>${letter.candidateName}</strong><br>
            Subject: <strong>Offer of Appointment for the Post of ${letter.position}</strong>
          </div>

          <p style="margin-bottom: 16px;">
            Dear <strong>${letter.candidateName}</strong>,
          </p>

          <p style="margin-bottom: 16px; text-align:justify;">
            On the recommendation of the Selection Committee and subsequent approval of the Head of Department and Director, LNMIIT Jaipur,
            we are pleased to offer you the position of <strong>${letter.position}</strong> in the <strong>Department of ${letter.department}</strong>
            under <strong>Academic ${letter.academicLevel}</strong>.
          </p>

          <table class="data-table" style="margin: 20px 0; border: 1px solid #cbd5e0;">
            <tbody>
              <tr><th style="width:35%;">Designation</th><td>${letter.position}</td></tr>
              <tr><th>Department</th><td>${letter.department}</td></tr>
              <tr><th>Academic Pay Matrix</th><td>${letter.basicPay}</td></tr>
              <tr><th>Reporting Date</th><td>On or before <strong>${letter.reportingDate}</strong></td></tr>
            </tbody>
          </table>

          <p style="margin-bottom: 24px; text-align:justify;">
            You are requested to sign the duplicate copy of this letter as a token of your acceptance and submit all original certificates at the time of joining.
          </p>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top: 40px;">
            <div class="letterhead-seal">
              OFFICIAL<br>LNMIIT<br>SEAL
            </div>
            <div style="text-align:right;">
              <p><strong>Registrar / Dean of Faculty Affairs</strong></p>
              <p style="font-size:0.85rem; color:#718096;">LNMIIT Jaipur</p>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert-danger-box">Error loading appointment letter: ${err.message}</div>`;
  }
}

// --- AUDIT LOG MODAL (NFR-007, NFR-020) ---
async function openAuditModal() {
  try {
    const logs = await apiRequest('/audit-logs');
    const modalHtml = `
      <div class="modal-overlay" id="audit-modal">
        <div class="modal-content" style="max-width: 750px;">
          <div class="modal-header">
            <h3 class="modal-title">System Audit Log (NFR-007, NFR-020)</h3>
            <button class="close-btn" onclick="closeModal('audit-modal')">&times;</button>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom: 12px;">
            Immutable, insert-only audit entries recording state transitions, screenings, and evaluations.
          </p>

          <div class="table-responsive" style="max-height: 400px; overflow-y:auto;">
            <table class="data-table" style="font-size:0.82rem;">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Entity ID</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr>
                    <td>${new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td><strong>${l.userId}</strong></td>
                    <td><code>${l.action}</code></td>
                    <td>${l.entityType}</td>
                    <td>${l.entityId}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 16px; text-align:right;">
            <button class="btn btn-secondary" onclick="closeModal('audit-modal')">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } catch (err) {
    alert("Error fetching audit logs");
  }
}

// --- TRACEABILITY & UML SPECIFICATION MODAL ---
function openTraceabilityModal() {
  const modalHtml = `
    <div class="modal-overlay" id="trace-modal">
      <div class="modal-content" style="max-width: 850px;">
        <div class="modal-header">
          <h3 class="modal-title">📘 Requirements Traceability & Design Architecture (CS314)</h3>
          <button class="close-btn" onclick="closeModal('trace-modal')">&times;</button>
        </div>

        <div style="font-size:0.85rem; line-height: 1.6;">
          <p style="margin-bottom: 12px;">
            This prototype strictly reflects the software engineering models developed across <strong>CS314 Lab Assignments 1 to 7</strong>:
          </p>

          <table class="data-table" style="font-size:0.82rem; margin-bottom: 16px;">
            <thead>
              <tr>
                <th>Use Case</th>
                <th>Actor</th>
                <th>Screens</th>
                <th>Business Rules & Error Codes</th>
                <th>Components / Design</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>UC-006</strong><br>Apply for Vacancy</td>
                <td>Applicant</td>
                <td>S-02 to S-06</td>
                <td>BR-003 (Duplicate), BR-004 (Window), BR-005 (Lock), BR-006 (Docs), V-03..V-09</td>
                <td>ApplicationManagement, DocumentManagement, NotificationService</td>
              </tr>
              <tr>
                <td><strong>UC-007</strong><br>Screen Applications</td>
                <td>Recruitment Cell</td>
                <td>S-07, S-08</td>
                <td>BR-007 (Eligibility), V-10 (Window closed check), V-11 (Mandatory reason), V-12 (Doc issue)</td>
                <td>ScreeningManagement, EligibilityCriteria, ScreeningRecord</td>
              </tr>
              <tr>
                <td><strong>UC-009/10</strong><br>Evaluate Interview</td>
                <td>Interview Panel</td>
                <td>S-09 to S-11</td>
                <td>AC-17 (Score 0-10, V-14), V-15 (Comments), V-16 (Attendance), V-17 (Wait panel)</td>
                <td>InterviewManagement, EvaluationManagement, Aggregate mean</td>
              </tr>
              <tr>
                <td><strong>UC-012/13</strong><br>HOD & Appointment</td>
                <td>HOD & RC</td>
                <td>S-12, S-13</td>
                <td>BR-008 (HOD approval required), FR-029 (Appointment letter generation)</td>
                <td>HOD Review, Letter Generation Service</td>
              </tr>
            </tbody>
          </table>

          <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0;">
            <p><strong>Implemented Design Patterns & Constraints:</strong></p>
            <ul style="margin-left: 18px; margin-top: 4px; color: var(--text-muted);">
              <li><strong>Layered Client-Server Architecture (A6 §2)</strong>: Web UI → Controllers / Services → Domain Models → Repositories.</li>
              <li><strong>State Machines (A5 §2, A7 CS-6)</strong>: ApplicationStatus (9 states), InterviewStatus (9 states) with transition guards.</li>
              <li><strong>Encapsulated Domain Rules</strong>: Document validation (PDF/JPG/PNG &le; 2MB), aggregate score calculation, duplicate prevention.</li>
            </ul>
          </div>

          <div style="margin-top: 20px; text-align:right;">
            <button class="btn btn-primary" onclick="closeModal('trace-modal')">Close Specification</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// --- S-VAC: RECRUITMENT CELL - LIST NEW VACANCY ---
function renderCreateVacancyScreen() {
  const container = document.getElementById('content-area');
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  container.innerHTML = `
    <div class="card" style="max-width: 960px; margin: 0 auto;">
      <div class="card-header">
        <div>
          <h2 class="card-title">List New Faculty Vacancy</h2>
          <p class="card-subtitle">Recruitment Cell Administrative Portal — Create, Configure & Publish Faculty Opening</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('rc-dashboard')">← Back to Dashboard</button>
      </div>

      <!-- Quick Template Bar for Live Demonstration -->
      <div style="background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 8px;">
          <span style="font-size:0.85rem; font-weight:600; color:#2b6cb0;">⚡ Quick Demo Templates (1-Click Pre-fill):</span>
          <div style="display:flex; gap: 8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-sm" style="background:#fff; border:1px solid #90cdf4; color:#2b6cb0;" onclick="prefillVacancyTemplate('cse_ai')">🤖 CSE Asst. Prof (AI/ML)</button>
            <button type="button" class="btn btn-sm" style="background:#fff; border:1px solid #90cdf4; color:#2b6cb0;" onclick="prefillVacancyTemplate('ece_iot')">⚡ ECE Assoc. Prof (5G/IoT)</button>
            <button type="button" class="btn btn-sm" style="background:#fff; border:1px solid #90cdf4; color:#2b6cb0;" onclick="prefillVacancyTemplate('math_ds')">📊 Math Prof (Data Science)</button>
          </div>
        </div>
      </div>

      <div id="create-vac-error-banner"></div>

      <form id="create-vacancy-form" onsubmit="handleCreateVacancySubmit(event)">
        <!-- Section 1: Position & Department -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1rem; color: var(--lnmiit-navy); border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px;">
            1. Position & Academic Department
          </h3>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required" for="vac-new-dept">Department</label>
              <select id="vac-new-dept" class="form-control" required onchange="autoUpdateVacancyId()">
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Comm.">Electronics & Comm.</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required" for="vac-new-desig">Designation</label>
              <select id="vac-new-desig" class="form-control" required>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required" for="vac-new-level">Academic Pay Level</label>
              <select id="vac-new-level" class="form-control" required>
                <option value="Level 10">Level 10 (Rs. 57,700 - 98,200)</option>
                <option value="Level 11">Level 11 (Rs. 68,900 - 1,17,200)</option>
                <option value="Level 12">Level 12 (Rs. 1,01,500 - 1,67,400)</option>
                <option value="Level 13A2">Level 13A2 (Rs. 1,39,600 - 2,11,300)</option>
                <option value="Level 14">Level 14 (Rs. 1,44,200 - 2,18,200)</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required" for="vac-new-spec">Specialization / Domain</label>
              <input type="text" id="vac-new-spec" class="form-control" placeholder="e.g. Artificial Intelligence, Cloud Systems, Robotics" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="vac-new-id">Vacancy Reference ID (Optional - Auto Generated if blank)</label>
              <input type="text" id="vac-new-id" class="form-control" placeholder="e.g. FAC-CS-2026-02">
            </div>
          </div>
        </div>

        <!-- Section 2: Window & Position Terms -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1rem; color: var(--lnmiit-navy); border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px;">
            2. Application Window & Engagement Terms
          </h3>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required" for="vac-new-open-date">Opening Date</label>
              <input type="date" id="vac-new-open-date" class="form-control" value="${today}" required>
            </div>

            <div class="form-group">
              <label class="form-label required" for="vac-new-close-date">Closing Date (Application Deadline)</label>
              <input type="date" id="vac-new-close-date" class="form-control" value="${nextMonth}" required>
            </div>

            <div class="form-group">
              <label class="form-label required" for="vac-new-nature">Nature of Appointment</label>
              <select id="vac-new-nature" class="form-control">
                <option value="Full-time, Regular">Full-time, Regular</option>
                <option value="Contractual (3 Years)">Contractual (3 Years)</option>
                <option value="Visiting Faculty">Visiting Faculty</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="vac-new-location">Work Location</label>
              <input type="text" id="vac-new-location" class="form-control" value="LNMIIT Campus, Jaipur, Rajasthan">
            </div>

            <div class="form-group">
              <label class="form-label required" for="vac-new-status">Publication Status</label>
              <select id="vac-new-status" class="form-control">
                <option value="PUBLISHED">PUBLISHED (Open for Online Applications)</option>
                <option value="DRAFT">DRAFT (Saved internally)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 3: Eligibility & Screening Criteria -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1rem; color: var(--lnmiit-navy); border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px;">
            3. Eligibility & Automated Screening Rules
          </h3>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required" for="vac-new-edu">Minimum Education Qualification</label>
              <input type="text" id="vac-new-edu" class="form-control" value="PhD in relevant area" placeholder="e.g. PhD in relevant area" required>
            </div>

            <div class="form-group">
              <label class="form-label required" for="vac-new-exp">Minimum Experience Required (Years)</label>
              <input type="number" step="0.5" min="0" max="30" id="vac-new-exp" class="form-control" value="2.0" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="vac-new-criteria-other">Publication / Special Screening Requirements</label>
            <input type="text" id="vac-new-criteria-other" class="form-control" placeholder="e.g. Minimum 2 SCI/SCOPUS indexed journal papers" value="Minimum 2 peer-reviewed publications in reputed conferences/journals">
          </div>
        </div>

        <!-- Section 4: Compensation & Job Profile -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1rem; color: var(--lnmiit-navy); border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px;">
            4. Compensation, Benefits & Key Responsibilities
          </h3>
          <div class="form-group">
            <label class="form-label" for="vac-new-comp">Compensation & Pay Scale Details</label>
            <input type="text" id="vac-new-comp" class="form-control" value="Pay Level 10 (7th CPC), Basic Rs. 57,700 - 98,200 + DA + HRA">
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="vac-new-benefits">Benefits & Allowances</label>
              <textarea id="vac-new-benefits" class="form-control" rows="2">Comprehensive medical health insurance, campus residential quarters, initial research seed grant up to 5 Lakhs.</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="vac-new-incentives">Academic Incentives</label>
              <textarea id="vac-new-incentives" class="form-control" rows="2">Cumulative Professional Development Allowance (CPDA), national & international conference travel grants.</textarea>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="vac-new-resp">Teaching & Laboratory Responsibilities</label>
            <textarea id="vac-new-resp" class="form-control" rows="2">Teaching undergraduate & postgraduate courses, course curriculum development, laboratory session supervision, mentoring B.Tech/M.Tech capstone projects.</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="vac-new-notes">Special Instructions / Additional Notes</label>
            <textarea id="vac-new-notes" class="form-control" rows="2">Candidates with demonstrable teaching excellence and sponsored R&D project experience will be given priority consideration.</textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; justify-content:flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 18px;">
          <button type="button" class="btn btn-secondary" onclick="navigateTo('rc-dashboard')">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-vacancy">
            🚀 Publish & List Vacancy
          </button>
        </div>
      </form>
    </div>
  `;
}

function autoUpdateVacancyId() {
  const dept = document.getElementById('vac-new-dept').value;
  const deptCodeMap = {
    "Computer Science": "CS",
    "Electronics & Comm.": "EC",
    "Mechanical": "ME",
    "Mathematics": "MA",
    "Physics": "PH",
    "Humanities & Social Sciences": "HSS"
  };
  const code = deptCodeMap[dept] || dept.slice(0, 2).toUpperCase();
  const year = new Date().getFullYear();
  const idInput = document.getElementById('vac-new-id');
  if (idInput && !idInput.value) {
    idInput.placeholder = `e.g. FAC-${code}-${year}-02`;
  }
}

function prefillVacancyTemplate(type) {
  if (type === 'cse_ai') {
    document.getElementById('vac-new-dept').value = 'Computer Science';
    document.getElementById('vac-new-desig').value = 'Assistant Professor';
    document.getElementById('vac-new-level').value = 'Level 10';
    document.getElementById('vac-new-spec').value = 'Artificial Intelligence, Deep Learning & NLP';
    document.getElementById('vac-new-edu').value = 'PhD in Computer Science / Artificial Intelligence';
    document.getElementById('vac-new-exp').value = '2.0';
    document.getElementById('vac-new-comp').value = 'Pay Level 10 (7th CPC), Basic Rs. 57,700 - 98,200 + Allowances';
    document.getElementById('vac-new-criteria-other').value = 'Top-tier conference publications (NeurIPS, ICML, ACL, CVPR) preferred';
    document.getElementById('vac-new-notes').value = 'Strong programming skills in Python/PyTorch and prior teaching experience in Machine Learning preferred.';
  } else if (type === 'ece_iot') {
    document.getElementById('vac-new-dept').value = 'Electronics & Comm.';
    document.getElementById('vac-new-desig').value = 'Associate Professor';
    document.getElementById('vac-new-level').value = 'Level 13A2';
    document.getElementById('vac-new-spec').value = 'Wireless Communications, IoT & 5G/6G Networks';
    document.getElementById('vac-new-edu').value = 'PhD in Electronics / Telecommunications Engineering';
    document.getElementById('vac-new-exp').value = '6.0';
    document.getElementById('vac-new-comp').value = 'Pay Level 13A2 (7th CPC), Basic Rs. 1,39,600 + Allowances';
    document.getElementById('vac-new-criteria-other').value = 'Minimum 5 SCI journal papers and experience with sponsored R&D projects';
    document.getElementById('vac-new-notes').value = 'Experience in handling hardware testbeds, SDRs and industry consultancy is highly desirable.';
  } else if (type === 'math_ds') {
    document.getElementById('vac-new-dept').value = 'Mathematics';
    document.getElementById('vac-new-desig').value = 'Professor';
    document.getElementById('vac-new-level').value = 'Level 14';
    document.getElementById('vac-new-spec').value = 'Applied Statistics, Optimization & Foundations of Data Science';
    document.getElementById('vac-new-edu').value = 'PhD in Mathematics / Statistics';
    document.getElementById('vac-new-exp').value = '10.0';
    document.getElementById('vac-new-comp').value = 'Pay Level 14 (7th CPC), Basic Rs. 1,44,200 + Allowances';
    document.getElementById('vac-new-criteria-other').value = 'Significant track record of PhD student supervision and high-impact publications';
    document.getElementById('vac-new-notes').value = 'Leadership role in establishing advanced computational mathematics laboratory.';
  }
  showToast("Template loaded into form!");
}

async function handleCreateVacancySubmit(e) {
  e.preventDefault();
  const errorBanner = document.getElementById('create-vac-error-banner');
  errorBanner.innerHTML = '';

  const department = document.getElementById('vac-new-dept').value;
  const designation = document.getElementById('vac-new-desig').value;
  const academicLevel = document.getElementById('vac-new-level').value;
  const specialization = document.getElementById('vac-new-spec').value.trim();
  const vacancyId = document.getElementById('vac-new-id').value.trim();
  const openingDate = document.getElementById('vac-new-open-date').value;
  const closingDate = document.getElementById('vac-new-close-date').value;
  const natureOfPosition = document.getElementById('vac-new-nature').value;
  const location = document.getElementById('vac-new-location').value.trim();
  const status = document.getElementById('vac-new-status').value;
  const educationEligibility = document.getElementById('vac-new-edu').value.trim();
  const minExperienceYears = parseFloat(document.getElementById('vac-new-exp').value) || 0;
  const otherRequirements = document.getElementById('vac-new-criteria-other').value.trim();
  const compensation = document.getElementById('vac-new-comp').value.trim();
  const benefits = document.getElementById('vac-new-benefits').value.trim();
  const incentives = document.getElementById('vac-new-incentives').value.trim();
  const teachingResponsibilities = document.getElementById('vac-new-resp').value.trim();
  const notes = document.getElementById('vac-new-notes').value.trim();

  if (new Date(closingDate) <= new Date(openingDate)) {
    errorBanner.innerHTML = `
      <div class="alert-danger-box">
        <strong>Invalid Dates:</strong> The closing date (${closingDate}) must be strictly after the opening date (${openingDate}).
      </div>
    `;
    return;
  }

  const payload = {
    vacancyId: vacancyId || undefined,
    department,
    designation,
    academicLevel,
    specialization,
    openingDate,
    closingDate,
    natureOfPosition,
    location,
    status,
    educationEligibility,
    minExperienceYears,
    otherRequirements,
    compensation,
    benefits,
    incentives,
    teachingResponsibilities,
    notes
  };

  const submitBtn = document.getElementById('btn-submit-vacancy');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Publishing...';
  }

  try {
    const res = await apiRequest('/vacancies', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    showToast(`Vacancy ${res.vacancyId} listed successfully!`);
    navigateTo('rc-dashboard', { vacancyId: res.vacancyId });
  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = '🚀 Publish & List Vacancy';
    }
    errorBanner.innerHTML = `
      <div class="alert-danger-box">
        <strong>Failed to list vacancy:</strong> ${err.message || 'Server error'}
      </div>
    `;
  }
}

// Helpers
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.innerText = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = '#1a365d';
  toast.style.color = '#ffffff';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '6px';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.fontSize = '0.88rem';
  toast.style.zIndex = '9999';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function previewFakeDoc(fileName) {
  alert(`Document Viewer: Previewing "${fileName}" from secure document storage.`);
}

async function resetEntireDemo() {
  if (!confirm("Reset all prototype data to initial seed state?")) return;
  try {
    await apiRequest('/reset-demo', { method: 'POST' });
    showToast("Demo data reset successfully!");
    navigateTo(currentScreen);
  } catch (err) {
    alert("Reset failed");
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  updateUserPill();
  updatePersonaButtons();
  updateNavMenu();
  navigateTo('vacancies');
});
