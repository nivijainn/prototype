# LNMIIT Faculty Recruitment Workflow Management System
**CS314 Software Development Laboratory Prototype**

**Team ID:** T076  
**Team Members:**
- Rachit Poddar (24UCS176)
- Nivi Jain (24UCS177)
- Maheshwar Pratap Singh (24UCS182)
- Daivik Patodi (24UCS184)

---

## ⚡ Quick Start

```bash
node server.js
```

Then visit: **`http://localhost:3000`** in any modern web browser.

---

## 📋 Features & Specifications Covered

This prototype implements the design models created across **Lab Assignments 1 to 7**:

| Scope / Lab | Implemented Components & Features |
|---|---|
| **Lab 1 & 2 (SRS & Use Cases)** | Role-based access (Applicant, Recruitment Cell, Interview Panel, HOD), Business Rules BR-001 to BR-010, FR-001 to FR-029. |
| **Lab 3 (Activity & Scenarios)** | Activity diagrams for UC-006 (Apply), UC-007 (Screen), UC-009/10 (Conduct & Evaluate interview with fork/join synchronization). |
| **Lab 4 (Analysis Classes)** | 16 Domain classes: `User`, `Applicant`, `RecruitmentCellUser`, `InterviewPanelMember`, `HOD`, `Vacancy`, `Application`, `ApplicantProfile`, `Education`, `Experience`, `Document`, `EligibilityCriteria`, `ScreeningRecord`, `Interview`, `Evaluation`, `Notification`. |
| **Lab 5 (Collaboration & State Models)** | Collaboration sequence flows, 9-state `ApplicationStatus` machine and 9-state `InterviewStatus` machine. |
| **Lab 6 (Architecture & Design Classes)** | Layered Client-Server Architecture, Encapsulated DTOs, In-memory/Relational persistence design, Repository pattern. |
| **Lab 7 (UI Wireframes & Component Specs)** | Pixel-perfect implementation of Screens **S-01 to S-11**, exact validation error codes **V-01 to V-19**, and component operations CS-1 to CS-6. |

For a complete step-by-step presentation script to show your professor, please consult **[PROTOTYPE_GUIDE.md](docs/PROTOTYPE_GUIDE.md)**.
