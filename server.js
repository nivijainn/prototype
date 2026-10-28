// Node.js HTTP Server implementing Assignment 6 & 7 REST Endpoints
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { store } = require('./src/services/recruitmentService');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendError(res, err, reqPath) {
  const status = err.status || 500;
  const errorPayload = {
    status: status,
    code: err.code || "SYSTEM_ERROR",
    message: err.message || "An unexpected error occurred",
    fields: err.fields || [],
    path: reqPath,
    timestamp: new Date().toISOString()
  };
  sendJson(res, status, errorPayload);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- REST API ENDPOINTS (Assignment 7, §3.2.3) ---
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Auth: Login (S-01)
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { email, password, userType } = body;
        const user = store.findUserByEmail(email);
        if (!user) {
          const err = new Error("Invalid email or password. Please try again.");
          err.status = 401; err.code = "AUTH_FAILED";
          return sendError(res, err, pathname);
        }
        if (!user.active) {
          const err = new Error("Account is currently inactive. Please contact recruitment administrator.");
          err.status = 401; err.code = "ACCOUNT_INACTIVE";
          return sendError(res, err, pathname);
        }
        // Return session token and user info
        return sendJson(res, 200, {
          token: `TOKEN_${user.userId}_${Date.now()}`,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          applicantId: user.applicantId,
          employeeId: user.employeeId,
          memberId: user.memberId,
          hodId: user.hodId,
          department: user.department
        });
      }

      // 1b. Demo users list (convenience for live demo switcher)
      if (pathname === '/api/demo-users' && method === 'GET') {
        return sendJson(res, 200, store.data.users);
      }

      // 1c. Reset demo data
      if (pathname === '/api/reset-demo' && method === 'POST') {
        store.reset();
        return sendJson(res, 200, { message: "Prototype data reset successfully to initial state." });
      }

      // 2. Vacancies: List (S-02)
      if (pathname === '/api/vacancies' && method === 'GET') {
        const vacancies = store.getVacancies(parsedUrl.query);
        return sendJson(res, 200, vacancies);
      }

      // 2b. Vacancy: Create / List New (Recruitment Cell)
      if (pathname === '/api/vacancies' && method === 'POST') {
        const body = await parseJsonBody(req);
        const authHeader = req.headers['authorization'] || '';
        let userId = 'U007'; // Anita Verma (Recruitment Cell)
        if (authHeader.startsWith('Bearer ')) {
          userId = authHeader.replace('Bearer ', '').trim();
        }
        const user = store.findUserById(userId);
        if (user && user.role !== 'RECRUITMENT_CELL' && user.role !== 'ADMINISTRATOR') {
          const err = new Error("Access denied. Only Recruitment Cell staff can list new vacancies.");
          err.status = 403; err.code = "FORBIDDEN";
          return sendError(res, err, pathname);
        }
        const created = store.createVacancy(body, userId);
        return sendJson(res, 201, created);
      }

      // 3. Vacancy Details (S-03)
      const vacancyMatch = pathname.match(/^\/api\/vacancies\/([A-Za-z0-9-]+)$/);
      if (vacancyMatch && method === 'GET') {
        const v = store.getVacancy(vacancyMatch[1]);
        if (!v) {
          const err = new Error("Vacancy not found");
          err.status = 404; err.code = "NOT_FOUND";
          return sendError(res, err, pathname);
        }
        return sendJson(res, 200, v);
      }

      // 4. Start Application (S-03)
      const startAppMatch = pathname.match(/^\/api\/vacancies\/([A-Za-z0-9-]+)\/applications$/);
      if (startAppMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const result = store.startApplication(body.applicantId || "A102", startAppMatch[1]);
        return sendJson(res, 201, result);
      }

      // 5. Save Draft Application (S-04)
      const saveDraftMatch = pathname.match(/^\/api\/applications\/([A-Za-z0-9-]+)$/);
      if (saveDraftMatch && method === 'PUT') {
        const body = await parseJsonBody(req);
        const result = store.saveDraft(saveDraftMatch[1], body);
        return sendJson(res, 200, result);
      }

      // 6. Upload Document (S-05)
      const docUploadMatch = pathname.match(/^\/api\/applications\/([A-Za-z0-9-]+)\/documents$/);
      if (docUploadMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const doc = store.uploadDocument(docUploadMatch[1], body.documentType, {
          fileName: body.fileName,
          fileSizeKB: body.fileSizeKB || 500,
          mimeType: body.mimeType
        });
        return sendJson(res, 201, doc);
      }

      // 7. Submit Application (S-06)
      const submitAppMatch = pathname.match(/^\/api\/applications\/([A-Za-z0-9-]+)\/submit$/);
      if (submitAppMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const result = store.submitApplication(body.applicantId || "A102", submitAppMatch[1]);
        return sendJson(res, 200, result);
      }

      // 8. Application Status & My Applications
      if (pathname === '/api/applications/my' && method === 'GET') {
        const applicantId = parsedUrl.query.applicantId || "A102";
        const apps = store.getApplicationsByApplicant(applicantId);
        return sendJson(res, 200, apps);
      }

      const appStatusMatch = pathname.match(/^\/api\/applications\/([A-Za-z0-9-]+)\/status$/);
      if (appStatusMatch && method === 'GET') {
        const app = store.getApplication(appStatusMatch[1]);
        if (!app) {
          const err = new Error("Application not found");
          err.status = 404; err.code = "NOT_FOUND";
          return sendError(res, err, pathname);
        }
        return sendJson(res, 200, {
          applicationId: app.applicationId,
          status: app.status,
          submissionDate: app.submissionDate,
          screeningRecord: app.screeningRecord,
          interviewId: app.interviewId
        });
      }

      // 9. Recruitment Cell: List Applications for Vacancy (S-07)
      const rcAppsMatch = pathname.match(/^\/api\/rc\/vacancies\/([A-Za-z0-9-]+)\/applications$/);
      if (rcAppsMatch && method === 'GET') {
        const apps = store.getApplicationsForScreening(rcAppsMatch[1]);
        return sendJson(res, 200, apps);
      }

      // 10. Recruitment Cell: Get Application Details (S-08)
      const rcAppDetailsMatch = pathname.match(/^\/api\/rc\/applications\/([A-Za-z0-9-]+)$/);
      if (rcAppDetailsMatch && method === 'GET') {
        const app = store.getApplication(rcAppDetailsMatch[1]);
        if (!app) {
          const err = new Error("Application not found");
          err.status = 404; err.code = "NOT_FOUND";
          return sendError(res, err, pathname);
        }
        const profile = store.getApplicantProfile(app.applicantId);
        const vacancy = store.getVacancy(app.vacancyId);
        const suggestion = store.suggestEligibility(app.applicationId);
        return sendJson(res, 200, {
          application: app,
          profile,
          vacancy,
          suggestion
        });
      }

      // 10b. RC Document Verification toggle
      const rcDocVerifyMatch = pathname.match(/^\/api\/rc\/applications\/([A-Za-z0-9-]+)\/verify-doc$/);
      if (rcDocVerifyMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        store.updateDocumentVerification(rcDocVerifyMatch[1], body.documentId, body.status);
        return sendJson(res, 200, { success: true });
      }

      // 11. Recruitment Cell: Record Screening Result (S-08)
      const rcScreeningMatch = pathname.match(/^\/api\/rc\/applications\/([A-Za-z0-9-]+)\/screening$/);
      if (rcScreeningMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const record = store.recordScreeningResult(
          body.rcUserId || "U007",
          rcScreeningMatch[1],
          body.result,
          body.comments
        );
        return sendJson(res, 201, record);
      }

      // 12. Interview Panel: List Assigned Interviews (S-09)
      if (pathname === '/api/panel/interviews' && method === 'GET') {
        const memberId = parsedUrl.query.memberId || "PNL-01";
        const list = store.getAssignedInterviews(memberId);
        return sendJson(res, 200, list);
      }

      // 13. Interview Details (S-10)
      const interviewMatch = pathname.match(/^\/api\/panel\/interviews\/([A-Za-z0-9-]+)$/);
      if (interviewMatch && method === 'GET') {
        const iv = store.getInterview(interviewMatch[1]);
        if (!iv) {
          const err = new Error("Interview not found");
          err.status = 404; err.code = "NOT_FOUND";
          return sendError(res, err, pathname);
        }
        const app = store.getApplication(iv.applicationId);
        const profile = app ? store.getApplicantProfile(app.applicantId) : null;
        return sendJson(res, 200, {
          interview: iv,
          application: app,
          profile
        });
      }

      // 14. Mark Attendance (S-10)
      const attendanceMatch = pathname.match(/^\/api\/panel\/interviews\/([A-Za-z0-9-]+)\/attendance$/);
      if (attendanceMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const result = store.markAttendance(
          attendanceMatch[1],
          body.memberId || "PNL-01",
          body.attended !== false
        );
        return sendJson(res, 200, result);
      }

      // 15. Submit Evaluation (S-10)
      const evalSubmitMatch = pathname.match(/^\/api\/panel\/interviews\/([A-Za-z0-9-]+)\/evaluations$/);
      if (evalSubmitMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const result = store.submitEvaluation(
          body.memberId || "PNL-01",
          evalSubmitMatch[1],
          body.score,
          body.comments
        );
        return sendJson(res, 201, result);
      }

      // 16. Evaluation Summary (S-11)
      const summaryMatch = pathname.match(/^\/api\/panel\/interviews\/([A-Za-z0-9-]+)\/summary$/);
      if (summaryMatch && method === 'GET') {
        const iv = store.getInterview(summaryMatch[1]);
        if (!iv) {
          const err = new Error("Interview not found");
          err.status = 404; err.code = "NOT_FOUND";
          return sendError(res, err, pathname);
        }
        return sendJson(res, 200, {
          interviewId: iv.interviewId,
          candidateName: iv.candidateName,
          status: iv.status,
          evaluations: iv.evaluations,
          aggregateScore: iv.aggregateScore,
          panelSize: iv.panel.length,
          recommendation: iv.recommendation,
          panelRemarks: iv.panelRemarks,
          finalized: iv.finalized
        });
      }

      // 17. Finalize Interview & Panel Recommendation (S-11)
      const recMatch = pathname.match(/^\/api\/panel\/interviews\/([A-Za-z0-9-]+)\/recommendation$/);
      if (recMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const result = store.finalizeInterview(
          body.memberId || "PNL-01",
          recMatch[1],
          body.recommendation,
          body.remarks
        );
        return sendJson(res, 200, result);
      }

      // 18. HOD Decision (UC-012)
      const hodMatch = pathname.match(/^\/api\/hod\/applications\/([A-Za-z0-9-]+)\/decision$/);
      if (hodMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const result = store.hodDecision(
          body.hodId || "HOD-CSE-01",
          hodMatch[1],
          body.decision,
          body.comments
        );
        return sendJson(res, 200, result);
      }

      // 19. Recruitment Cell: Appointment Letter Generation (UC-013)
      const apptLetterMatch = pathname.match(/^\/api\/rc\/applications\/([A-Za-z0-9-]+)\/appointment-letter$/);
      if (apptLetterMatch && method === 'POST') {
        const body = await parseJsonBody(req);
        const letter = store.generateAppointmentLetter(
          body.rcUserId || "U007",
          apptLetterMatch[1]
        );
        return sendJson(res, 201, letter);
      }

      // 20. Notifications
      if (pathname === '/api/notifications' && method === 'GET') {
        const userId = parsedUrl.query.userId || "U102";
        const notifs = store.getNotifications(userId);
        return sendJson(res, 200, notifs);
      }

      // 21. Audit Logs (NFR-007, NFR-020)
      if (pathname === '/api/audit-logs' && method === 'GET') {
        const logs = store.getAuditLogs();
        return sendJson(res, 200, logs);
      }

      // Endpoint not found
      const err = new Error("Endpoint not found");
      err.status = 404; err.code = "NOT_FOUND";
      return sendError(res, err, pathname);

    } catch (err) {
      console.error(`API Error on ${method} ${pathname}:`, err);
      return sendError(res, err, pathname);
    }
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Security check to avoid directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log("LNMIIT Faculty Recruitment Workflow Management System Prototype");
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = server;
