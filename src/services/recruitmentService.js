// Core domain logic implementing Assignment 6 & Assignment 7 specifications
const { initialData } = require('../data/seedData');
const {
  isValidApplicationTransition,
  isValidInterviewTransition,
  MANDATORY_DOCUMENTS
} = require('../stateMachine');

class Store {
  constructor() {
    this.reset();
  }

  reset() {
    // Deep clone initialData so resetting gives fresh state
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  // --- Users & Auth (S-01, UC-001) ---
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(userId) {
    return this.data.users.find(u => u.userId === userId);
  }

  // --- Vacancies (S-02, S-03, UC-006) ---
  getVacancies(filters = {}) {
    let list = this.data.vacancies;
    if (filters.dept && filters.dept !== "All") {
      list = list.filter(v => v.department.toLowerCase() === filters.dept.toLowerCase());
    }
    if (filters.designation && filters.designation !== "All") {
      list = list.filter(v => v.designation.toLowerCase() === filters.designation.toLowerCase());
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(v =>
        v.vacancyId.toLowerCase().includes(q) ||
        v.specialization.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getVacancy(vacancyId) {
    return this.data.vacancies.find(v => v.vacancyId === vacancyId);
  }

  isApplicationOpen(vacancyId) {
    const vacancy = this.getVacancy(vacancyId);
    if (!vacancy) return false;
    if (vacancy.status !== "PUBLISHED") return false;
    const now = new Date();
    const close = new Date(vacancy.closingDate);
    return now <= close;
  }

  // --- Applications (S-04, S-05, S-06, CS-1a, CS-1) ---
  getApplicationsByApplicant(applicantId) {
    return this.data.applications.filter(a => a.applicantId === applicantId);
  }

  getApplication(applicationId) {
    return this.data.applications.find(a => a.applicationId === applicationId);
  }

  getApplicantProfile(applicantId) {
    return this.data.applicantProfiles[applicantId] || null;
  }

  startApplication(applicantId, vacancyId) {
    const vacancy = this.getVacancy(vacancyId);
    if (!vacancy) {
      const err = new Error("Vacancy not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    if (!this.isApplicationOpen(vacancyId)) {
      const err = new Error(`Applications for this vacancy are closed. The deadline was ${vacancy.closingDate}.`);
      err.status = 409; err.code = "WINDOW_CLOSED";
      throw err;
    }

    const existing = this.data.applications.find(
      a => a.applicantId === applicantId && a.vacancyId === vacancyId
    );

    if (existing) {
      if (existing.status === "DRAFT") {
        return { applicationId: existing.applicationId, status: "DRAFT", resumed: true };
      }
      const err = new Error(`You have already applied for this vacancy (Application ID ${existing.applicationId}).`);
      err.status = 409; err.code = "DUPLICATE_APPLICATION";
      throw err;
    }

    const nextNumber = this.data.applications.length + 100;
    const appId = `APP-0${nextNumber}`;
    const user = this.data.users.find(u => u.applicantId === applicantId);

    const newApp = {
      applicationId: appId,
      applicantId,
      applicantName: user ? user.name : "Applicant",
      applicantEmail: user ? user.email : "",
      vacancyId,
      applicationDate: new Date().toISOString().split('T')[0],
      submissionDate: null,
      status: "DRAFT",
      highestDegree: "M.Tech",
      totalExperience: 0,
      documents: [],
      screeningRecord: null,
      interviewId: null,
      hodReview: null,
      appointmentLetter: null
    };

    this.data.applications.push(newApp);
    return { applicationId: appId, status: "DRAFT", resumed: false };
  }

  saveDraft(applicationId, formData) {
    const app = this.getApplication(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }
    if (app.status !== "DRAFT") {
      const err = new Error("Application is already submitted and cannot be modified.");
      err.status = 409; err.code = "ALREADY_SUBMITTED";
      throw err;
    }

    // Save profile details into applicantProfiles
    if (formData.profile) {
      this.data.applicantProfiles[app.applicantId] = {
        ...this.data.applicantProfiles[app.applicantId],
        ...formData.profile
      };
      if (formData.profile.education && formData.profile.education.length > 0) {
        app.highestDegree = formData.profile.education[0].degree;
      }
      if (formData.profile.experience && formData.profile.experience.length > 0) {
        app.totalExperience = formData.profile.experience.reduce((sum, e) => sum + (parseFloat(e.totalExperience) || 0), 0);
      }
    }

    return { status: 200, message: "Draft saved successfully" };
  }

  uploadDocument(applicationId, documentType, fileMeta) {
    const app = this.getApplication(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }
    if (app.status !== "DRAFT") {
      const err = new Error("Application is already submitted. Document modification not allowed.");
      err.status = 409; err.code = "ALREADY_SUBMITTED";
      throw err;
    }

    // Validation (CS-4)
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = (fileMeta.fileName || '').split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      const err = new Error(`${fileMeta.fileName} could not be accepted. Allowed formats are PDF, JPG and PNG, up to 2 MB.`);
      err.status = 422; err.code = "INVALID_DOCUMENT";
      throw err;
    }

    if (fileMeta.fileSizeKB > 2048 || fileMeta.fileSizeKB <= 0) {
      const err = new Error(`File size ${fileMeta.fileSizeKB} KB exceeds permitted limit (max 2048 KB).`);
      err.status = 422; err.code = "INVALID_DOCUMENT";
      throw err;
    }

    // Replace if exists
    app.documents = app.documents.filter(d => d.documentType !== documentType);

    const docObj = {
      documentId: `DOC-${Date.now().toString().slice(-4)}`,
      documentType,
      fileName: fileMeta.fileName,
      fileSizeKB: fileMeta.fileSizeKB,
      mimeType: fileMeta.mimeType || 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      verificationStatus: "PENDING"
    };

    app.documents.push(docObj);
    return docObj;
  }

  submitApplication(applicantId, applicationId) {
    const app = this.getApplication(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }
    if (app.applicantId !== applicantId) {
      const err = new Error("Unauthorized: you do not own this application.");
      err.status = 403; err.code = "FORBIDDEN";
      throw err;
    }
    if (app.status !== "DRAFT") {
      const err = new Error("Application has already been submitted.");
      err.status = 409; err.code = "ALREADY_SUBMITTED";
      throw err;
    }

    const vacancy = this.getVacancy(app.vacancyId);
    if (!vacancy || !this.isApplicationOpen(vacancy.vacancyId)) {
      const err = new Error(`The application window for this vacancy is closed. Your draft has been saved but cannot be submitted.`);
      err.status = 409; err.code = "WINDOW_CLOSED";
      throw err;
    }

    // Mandatory document check (BR-006, AC-06)
    const profile = this.getApplicantProfile(applicantId) || {};
    const requiredDocs = [...MANDATORY_DOCUMENTS];
    if (profile.hasDisability) {
      requiredDocs.push("DISABILITY_CERTIFICATE");
    }

    const uploadedDocTypes = new Set(app.documents.map(d => d.documentType));
    const missingDocs = requiredDocs.filter(dt => !uploadedDocTypes.has(dt));

    if (missingDocs.length > 0) {
      const err = new Error(`Upload all mandatory documents to continue. Missing: ${missingDocs.join(', ')}`);
      err.status = 422; err.code = "MISSING_DOCUMENTS";
      err.missing = missingDocs;
      throw err;
    }

    // Update status to SUBMITTED
    app.status = "SUBMITTED";
    app.submissionDate = new Date().toISOString();

    // Audit log
    this.recordAuditLog(applicantId, "APPLICATION_SUBMITTED", "Application", applicationId);

    // Notification
    this.createNotification(
      app.applicantId,
      "APPLICATION_CONFIRMATION",
      `Application ${applicationId} submitted successfully for ${vacancy.designation} (${vacancy.department}).`
    );

    return {
      applicationId: app.applicationId,
      status: app.status,
      submittedAt: app.submissionDate,
      message: "Application submitted successfully."
    };
  }

  // --- Recruitment Cell Screening (S-07, S-08, UC-007, CS-2) ---
  getApplicationsForScreening(vacancyId) {
    const vacancy = this.getVacancy(vacancyId);
    if (!vacancy) {
      const err = new Error("Vacancy not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    return this.data.applications.filter(a => a.vacancyId === vacancyId);
  }

  suggestEligibility(applicationId) {
    const app = this.getApplication(applicationId);
    if (!app) return { suggested: "REVIEW_REQUIRED", reason: "Application not found" };

    const vacancy = this.getVacancy(app.vacancyId);
    const profile = this.getApplicantProfile(app.applicantId);

    if (!profile || !profile.education || profile.education.length === 0) {
      return { suggested: "REQUIRES_REVIEW", reason: "Education details incomplete" };
    }

    const hasMTechOrPhD = profile.education.some(e =>
      e.degree.toUpperCase().includes("M.TECH") ||
      e.degree.toUpperCase().includes("PHD") ||
      e.degree.toUpperCase().includes("PH.D")
    );

    const totalExp = profile.experience ?
      profile.experience.reduce((s, e) => s + (parseFloat(e.totalExperience) || 0), 0) : 0;

    const minExp = vacancy.criteria ? vacancy.criteria.minExperienceYears : 2.0;

    if (hasMTechOrPhD && totalExp >= minExp) {
      return {
        suggested: "ELIGIBLE",
        reason: `Meets education requirement (${profile.education[0].degree}) and required experience (${totalExp} yrs >= ${minExp} yrs)`
      };
    } else {
      return {
        suggested: "NOT_ELIGIBLE",
        reason: `Does not satisfy required criteria (Degree: ${profile.education[0].degree}, Experience: ${totalExp} yrs vs required ${minExp} yrs)`
      };
    }
  }

  updateDocumentVerification(applicationId, documentId, status) {
    const app = this.getApplication(applicationId);
    if (!app) return;
    const doc = app.documents.find(d => d.documentId === documentId);
    if (doc) {
      doc.verificationStatus = status;
    }
  }

  recordScreeningResult(rcUserId, applicationId, result, comments) {
    const rcUser = this.findUserById(rcUserId);
    if (!rcUser || rcUser.role !== "RECRUITMENT_CELL") {
      const err = new Error("You do not have permission to perform this action.");
      err.status = 403; err.code = "FORBIDDEN";
      throw err;
    }

    const app = this.getApplication(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    const vacancy = this.getVacancy(app.vacancyId);
    if (this.isApplicationOpen(app.vacancyId)) {
      const err = new Error(`Screening is available after the application window closes on ${vacancy.closingDate}.`);
      err.status = 409; err.code = "SCREENING_NOT_OPEN";
      throw err;
    }

    // Check if any document has issue
    const hasDocIssue = app.documents.some(d => d.verificationStatus === "REJECTED");
    if (hasDocIssue && result === "ELIGIBLE") {
      result = "REQUIRES_REVIEW"; // V-12: Document marked Issue forces Requires review
    }

    if ((result === "NOT_ELIGIBLE" || result === "REQUIRES_REVIEW") && (!comments || comments.trim() === "")) {
      const err = new Error("Please enter a reason when marking an application Not eligible or Requires review.");
      err.status = 422; err.code = "COMMENT_REQUIRED";
      throw err;
    }

    const screeningRecord = {
      screeningId: `SCR-${Date.now().toString().slice(-4)}`,
      screenedBy: `${rcUser.name} (${rcUser.employeeId || 'RC'})`,
      result,
      comments: comments || "Approved by Recruitment Cell",
      screeningDate: new Date().toISOString()
    };

    app.screeningRecord = screeningRecord;

    // Transition state
    let targetStatus = "ELIGIBLE";
    if (result === "NOT_ELIGIBLE") targetStatus = "NOT_ELIGIBLE";
    if (result === "REQUIRES_REVIEW") targetStatus = "REVIEW_REQUIRED";

    app.status = targetStatus;

    this.recordAuditLog(rcUserId, "SCREENING_RECORDED", "Application", applicationId);

    this.createNotification(
      app.applicantId,
      "SCREENING_RESULT",
      `Application ${applicationId} screening completed: Result - ${targetStatus}.`
    );

    return screeningRecord;
  }

  // --- Interview Panel (S-09, S-10, S-11, UC-009/10, CS-3, CS-5) ---
  getAssignedInterviews(memberId) {
    return this.data.interviews.filter(iv =>
      iv.panel.some(p => p.memberId === memberId)
    );
  }

  getInterview(interviewId) {
    return this.data.interviews.find(iv => iv.interviewId === interviewId);
  }

  markAttendance(interviewId, memberId, attended) {
    const iv = this.getInterview(interviewId);
    if (!iv) {
      const err = new Error("Interview not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    if (!iv.panel.some(p => p.memberId === memberId)) {
      const err = new Error("You are not assigned to this interview.");
      err.status = 403; err.code = "NOT_ASSIGNED";
      throw err;
    }

    iv.attendance[memberId] = attended;

    if (!attended) {
      // V-16, CS-5: candidate marked Not attended -> process ends
      iv.status = "NOT_ATTENDED";
      iv.recommendation = "NOT_RECOMMENDED";
      iv.panelRemarks = "Candidate marked as Not Attended by panel member.";
      iv.finalized = true;

      const app = this.getApplication(iv.applicationId);
      if (app) app.status = "REJECTED";

      this.recordAuditLog(memberId, "INTERVIEW_NOT_ATTENDED", "Interview", interviewId);
      return { status: "NOT_ATTENDED", message: "Candidate marked as Not Attended. Process terminated." };
    } else {
      if (iv.status === "SCHEDULED") {
        iv.status = "IN_PROGRESS";
      }
      return { status: iv.status, message: "Attendance confirmed." };
    }
  }

  submitEvaluation(memberId, interviewId, score, comments) {
    const iv = this.getInterview(interviewId);
    if (!iv) {
      const err = new Error("Interview not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    const panelMember = iv.panel.find(p => p.memberId === memberId);
    if (!panelMember) {
      const err = new Error("You are not assigned to this interview.");
      err.status = 403; err.code = "NOT_ASSIGNED";
      throw err;
    }

    if (iv.status === "NOT_ATTENDED") {
      const err = new Error("Candidate did not attend this interview.");
      err.status = 409; err.code = "INTERVIEW_NOT_CONDUCTED";
      throw err;
    }

    // Score validation (AC-17, V-14)
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      const err = new Error("Score must be between 0 and 10.");
      err.status = 422; err.code = "SCORE_OUT_OF_RANGE";
      throw err;
    }

    // Comments validation (V-15)
    if (!comments || comments.trim() === "") {
      const err = new Error("Comments are required to complete the evaluation.");
      err.status = 422; err.code = "INCOMPLETE_EVALUATION";
      throw err;
    }

    // Upsert evaluation
    let evalObj = iv.evaluations.find(e => e.memberId === memberId);
    if (!evalObj) {
      evalObj = {
        evaluationId: `EVL-${Date.now().toString().slice(-4)}`,
        memberId,
        memberName: panelMember.name,
        score: numScore,
        comments: comments.trim(),
        evaluationDate: new Date().toISOString()
      };
      iv.evaluations.push(evalObj);
    } else {
      evalObj.score = numScore;
      evalObj.comments = comments.trim();
      evalObj.evaluationDate = new Date().toISOString();
    }

    // Check how many evaluations received
    const panelSize = iv.panel.length;
    const submittedCount = iv.evaluations.length;

    if (submittedCount >= panelSize) {
      // All evaluations are in! Compute aggregate score (CS-3 step 12)
      const total = iv.evaluations.reduce((sum, e) => sum + e.score, 0);
      iv.aggregateScore = parseFloat((total / panelSize).toFixed(1));
      iv.status = "VALIDATED";
    } else {
      iv.status = "EVALUATION_PENDING";
    }

    this.recordAuditLog(memberId, "EVALUATION_SUBMITTED", "Interview", interviewId);

    return {
      evaluationId: evalObj.evaluationId,
      submitted: submittedCount,
      panelSize,
      aggregateScore: iv.aggregateScore,
      status: iv.status
    };
  }

  finalizeInterview(memberId, interviewId, recommendation, remarks) {
    const iv = this.getInterview(interviewId);
    if (!iv) {
      const err = new Error("Interview not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    if (iv.status !== "VALIDATED") {
      const remaining = iv.panel.length - iv.evaluations.length;
      const err = new Error(`Waiting for ${remaining} panel member(s). The result will be shown when all evaluations are submitted.`);
      err.status = 409; err.code = "EVALUATIONS_PENDING";
      throw err;
    }

    iv.recommendation = recommendation;
    iv.panelRemarks = remarks || "";
    iv.status = "COMPLETED";
    iv.finalized = true;

    // Update candidate application status
    const app = this.getApplication(iv.applicationId);
    if (app) {
      if (recommendation === "RECOMMENDED") {
        app.status = "SHORTLISTED";
        // Notify HOD (UC-009/10 step 15)
        this.createNotification(
          "U001",
          "EVALUATION_RESULT",
          `Candidate ${iv.candidateName} (${iv.applicationId}) has been RECOMMENDED by panel for HOD final review.`
        );
      } else {
        app.status = "REJECTED";
      }
    }

    this.recordAuditLog(memberId, "RECOMMENDATION_CONFIRMED", "Interview", interviewId);

    return {
      status: "COMPLETED",
      recommendation,
      aggregateScore: iv.aggregateScore,
      message: "Interview evaluation finalized and forwarded to HOD."
    };
  }

  // --- HOD Review (UC-012, FR-027, FR-028) ---
  hodDecision(hodId, applicationId, decision, remarks) {
    const app = this.getApplication(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    app.hodReview = {
      reviewed: true,
      approved: decision === "APPROVED",
      decision,
      comments: remarks || "",
      decisionDate: new Date().toISOString()
    };

    if (decision === "APPROVED") {
      app.status = "APPROVED_BY_HOD";
      // Notify Recruitment cell to generate appointment letter
      this.createNotification(
        "U007",
        "EVALUATION_RESULT",
        `HOD has approved appointment of ${app.applicantName} for vacancy ${app.vacancyId}. Ready for appointment letter generation.`
      );
    } else {
      app.status = "REJECTED_BY_HOD";
    }

    this.recordAuditLog(hodId, `HOD_${decision}`, "Application", applicationId);
    return app.hodReview;
  }

  // --- Appointment Letter Generation (UC-013, FR-029) ---
  generateAppointmentLetter(rcUserId, applicationId) {
    const app = this.getApplication(applicationId);
    if (!app) {
      const err = new Error("Application not found");
      err.status = 404; err.code = "NOT_FOUND";
      throw err;
    }

    const vacancy = this.getVacancy(app.vacancyId);

    const letter = {
      referenceNo: `LNMIIT/REC/2026/APPT-${Date.now().toString().slice(-4)}`,
      issueDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      candidateName: app.applicantName,
      position: vacancy ? vacancy.designation : "Assistant Professor",
      department: vacancy ? vacancy.department : "Computer Science",
      academicLevel: vacancy ? vacancy.academicLevel : "Level 10",
      basicPay: "₹ 57,700/- per month (Pay Matrix Level 10)",
      reportingDate: "1st January 2027",
      issuedBy: "Registrar / Recruitment Cell, LNMIIT Jaipur"
    };

    app.appointmentLetter = letter;
    app.status = "APPOINTED";

    this.recordAuditLog(rcUserId, "APPOINTMENT_LETTER_GENERATED", "Application", applicationId);

    this.createNotification(
      app.applicantId,
      "APPLICATION_CONFIRMATION",
      `Congratulations! Official appointment letter generated for your selection as ${letter.position}. Reference: ${letter.referenceNo}`
    );

    return letter;
  }

  // --- Notifications & Audit ---
  createNotification(recipientId, type, message) {
    const notif = {
      notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
      recipientId,
      type,
      message,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };
    this.data.notifications.unshift(notif);
    return notif;
  }

  getNotifications(userId) {
    return this.data.notifications.filter(n => n.recipientId === userId || n.recipientId === "ALL");
  }

  recordAuditLog(userId, action, entityType, entityId) {
    const log = {
      logId: `LOG-${Date.now().toString().slice(-4)}`,
      userId,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }
}

const store = new Store();

module.exports = { store };
