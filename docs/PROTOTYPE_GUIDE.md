# LNMIIT Faculty Recruitment Workflow Management System
## CS314: Software Development Laboratory — Prototype Demonstration Guide
**Team ID:** T076  
**Team Members:** Rachit Poddar (24UCS176), Nivi Jain (24UCS177), Maheshwar Pratap Singh (24UCS182), Daivik Patodi (24UCS184)  
**Academic Year:** 2026-2027 | The LNM Institute of Information Technology, Jaipur  

---

## 🚀 How to Run the Prototype

To launch the prototype on your computer:

```bash
# In the project root directory:
node server.js
```

Then open your browser and navigate to:  
👉 **`http://localhost:3000`**

*(Requires standard Node.js. Zero external npm dependencies required — all pure standard Node.js & browser standards for instant, reliable execution.)*

---

## 🎯 Professor Demonstration Script (Step-by-Step Walkthrough)

The prototype includes a **1-Click Persona Demo Bar** at the top of the screen to smoothly demonstrate each actor's perspective without manual login/logout hassle.

### Stage 1: The Applicant Persona (Rahul Sharma) — UC-006: Apply for a Faculty Vacancy
1. **Click `👨‍🎓 Rahul Sharma (Applicant)`** in the top demo bar.
2. **Screen S-02 (Published Vacancies)**:
   - Point out search bar, department and designation filters.
   - Point out the **Window** status badges (`Open` vs `Closed`).
   - Click **View details** on `FAC-EC-2026-03` (Open) to demonstrate how an applicant views openings.
   - Click **View details** on `FAC-CS-2026-01` (Closed) to demonstrate **Rule BR-004 / Error V-03**: shows a red banner stating application window has closed and disables application submission.
   - Point out **Rule BR-003 / Error V-04 (Duplicate Application)**: Rahul Sharma already has an existing submission (`APP-0158`).
3. **Screen S-04 & S-05 (Multi-step Application Wizard)**:
   - Review personal details, education records, and experience records.
   - Note the **"Save Draft"** functionality available on every single step (NFR-010).
   - In Step 4 (Upload Documents), view document requirements. Click **"Choose file"** to test simulated uploads (PDF, JPG, PNG &le; 2MB). Demonstrates **Rule BR-006 / Error V-08** and **Error V-07** for oversized or invalid formats.
4. **Screen S-06 (Review & Final Submission)**:
   - Demonstrates **Rule BR-005**: applicant must check the legal declaration box confirming no changes can be made after submission.
   - Upon submission, a unique Application ID is generated, initial state is locked to `Submitted`, and an on-screen confirmation notice is shown (FR-017, FR-025).
5. **Screen S-14 / FR-018 (Applicant Progress Stepper)**:
   - Click **"My Applications"** in the top navigation menu.
   - Show the professor the visual **5-stage progress tracker** (`Submitted` &rarr; `Screening` &rarr; `Interview` &rarr; `HOD Approval` &rarr; `Appointment`).

---

### Stage 2: The Recruitment Cell (Anita Verma) — UC-007: Screen Applications
1. **Click `👩‍💼 Anita Verma (Recruitment Cell)`** in the top demo bar.
2. **Screen S-07 (Recruitment Cell Dashboard)**:
   - Notice the left sidebar showing summary counters: Total, Submitted, Eligible, Not eligible, Requires review.
   - Shows the precondition enforcement: Screening is enabled only when the application window is closed (UC-007 precondition, Error V-10).
3. **Screen S-08 (Screen Application)**:
   - Click **"Screen"** or **"View / Re-screen"** on Rahul Sharma (`APP-0158`).
   - Point out the **Side-by-side design**:
     - Left: Applicant degree, experience, and uploaded document verification checkboxes (`Verified` vs `Issue`).
     - Right: Eligibility Criteria comparison matrix (`ELIG-CS-01`), system suggestion badge, and decision radios (`Eligible`, `Not eligible`, `Requires review`).
   - **Test Rule BR-007 / Error V-12**: Click **"Issue"** on any document. The system immediately forces the screening decision to `Requires review`!
   - **Test Error V-11**: Try saving `Not eligible` or `Requires review` with empty comments. The system blocks submission and enforces mandatory reasons.
   - Click **"Save Screening Result"** to update application status and write an immutable audit log entry (NFR-007).

---

### Stage 3: The Interview Panel (Dr. K. Iyer & Dr. S. Bansal) — UC-009/10: Conduct & Evaluate Interview
1. **Click `👨‍🏫 Dr. K. Iyer (Panel 1)`** in the top demo bar.
2. **Screen S-09 (Assigned Interviews)**:
   - Shows list of scheduled interviews assigned to Dr. Iyer (`INT-031` for Rahul Sharma).
   - Shows member count (3 panel members) and current status.
3. **Screen S-10 (Conduct & Evaluate Interview)**:
   - Click **"Open"** on `INT-031`.
   - **Test Candidate Attendance (UC-009/10 A1, Error V-16)**: Radio button allows marking "Candidate attended" or "Not attended". Selecting "Not attended" asks for confirmation and terminates the candidacy.
   - **Test Score Validation (AC-17, Error V-14)**: Score must be between 0 and 10.
   - **Test Comments Validation (Error V-15)**: Comments are mandatory.
   - Show the panel progress indicator: e.g. *"2 of 3 panel evaluations submitted"*.
4. **Screen S-11 (Evaluation Result & Panel Recommendation)**:
   - When all panel members submit, the system calculates the **aggregate mean score** automatically (CS-3 step 12).
   - Shows the consolidated summary table with scores from Dr. K. Iyer (8.0), Dr. S. Bansal (7.5), and Dr. M. Rao (8.5) &rarr; Aggregate: **8.0 / 10**.
   - Select **"Recommend for HOD approval"** and click **"Confirm Recommendation & Forward to HOD"**.
   - Interview transitions to `COMPLETED` and candidate moves to `SHORTLISTED`.

---

### Stage 4: Head of Department (Prof. P. K. Biswas) — UC-012: Final Department Approval
1. **Click `🏛️ Prof. Biswas (HOD)`** in the top demo bar.
2. **Screen S-12 (HOD Shortlisted Approvals)**:
   - HOD views candidate Rahul Sharma with aggregate panel score (8.0 / 10).
   - Click **"Review & Approve"**.
   - Select **"Approve Appointment"**, enter department comments, and confirm.
   - Application status updates to `APPROVED_BY_HOD` (Rule BR-008).

---

### Stage 5: Formal Appointment Letter Generation — UC-013: Offer of Appointment
1. **Click `👨‍🎓 Rahul Sharma (Applicant)`** (or switch to Recruitment Cell).
2. Go to **"My Applications"** &rarr; Notice status has progressed to `APPROVED_BY_HOD`.
3. Click **"📄 View Appointment Letter"**:
   - Renders a formal, high-fidelity **LNMIIT Offer of Appointment Letter** with:
     - Official Institute Header & Seal
     - Reference number (`LNMIIT/REC/2026/APPT-XXXX`)
     - Candidate designation, department, and 7th CPC Pay Matrix scale
     - Reporting date and signature of Registrar / Dean of Faculty Affairs
     - One-click "Print / Save as PDF" button.

---

### Stage 6: System Traceability & Audit Logs
- Click **"📘 Traceability & UML"** in the top nav to show the professor the comprehensive requirements traceability matrix (RTM) linking assignments 1 through 7.
- Click **"📜 Audit Log"** to inspect the real-time insert-only audit log recording every single action (`APPLICATION_SUBMITTED`, `SCREENING_RECORDED`, `EVALUATION_SUBMITTED`, `HOD_APPROVED`).
- Click **"🔄 Reset Demo Data"** at any time to restore the entire database back to its clean initial state for the next run.
