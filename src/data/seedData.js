// Seed data derived directly from Assignment 1 to 7 specifications, Object Diagrams, and Scenarios
const initialData = {
  users: [
    {
      userId: "U102",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      passwordHash: "hash_applicant_123",
      role: "APPLICANT",
      active: true,
      applicantId: "A102",
      phone: "9876543210"
    },
    {
      userId: "U103",
      name: "Priya Mehta",
      email: "priya.mehta@example.com",
      passwordHash: "hash_applicant_123",
      role: "APPLICANT",
      active: true,
      applicantId: "A103",
      phone: "9811223344"
    },
    {
      userId: "U104",
      name: "Arjun Rao",
      email: "arjun.rao@example.com",
      passwordHash: "hash_applicant_123",
      role: "APPLICANT",
      active: true,
      applicantId: "A104",
      phone: "9899887766"
    },
    {
      userId: "U007",
      name: "Anita Verma",
      email: "anita.verma@lnmiit.ac.in",
      passwordHash: "hash_rc_123",
      role: "RECRUITMENT_CELL",
      active: true,
      employeeId: "RC-07",
      department: "Recruitment Cell"
    },
    {
      userId: "U008",
      name: "Dr. K. Iyer",
      email: "k.iyer@lnmiit.ac.in",
      passwordHash: "hash_panel_123",
      role: "INTERVIEW_PANEL",
      active: true,
      memberId: "PNL-01",
      designation: "Associate Professor",
      department: "Computer Science"
    },
    {
      userId: "U009",
      name: "Dr. S. Bansal",
      email: "s.bansal@lnmiit.ac.in",
      passwordHash: "hash_panel_123",
      role: "INTERVIEW_PANEL",
      active: true,
      memberId: "PNL-02",
      designation: "Professor",
      department: "Computer Science"
    },
    {
      userId: "U010",
      name: "Dr. M. Rao",
      email: "m.rao@lnmiit.ac.in",
      passwordHash: "hash_panel_123",
      role: "INTERVIEW_PANEL",
      active: true,
      memberId: "PNL-03",
      designation: "Associate Professor",
      department: "Computer Science"
    },
    {
      userId: "U001",
      name: "Prof. P. K. Biswas",
      email: "hod.cse@lnmiit.ac.in",
      passwordHash: "hash_hod_123",
      role: "HOD",
      active: true,
      hodId: "HOD-CSE-01",
      department: "Computer Science"
    },
    {
      userId: "U000",
      name: "System Administrator",
      email: "admin@lnmiit.ac.in",
      passwordHash: "hash_admin_123",
      role: "ADMINISTRATOR",
      active: true
    }
  ],

  applicantProfiles: {
    "A102": {
      profileId: "P102",
      applicantId: "A102",
      userId: "U102",
      dateOfBirth: "1995-04-12",
      currentAddress: {
        plotBuilding: "Plot 12",
        locality: "Malviya Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302017"
      },
      permanentAddress: {
        plotBuilding: "Plot 12",
        locality: "Malviya Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302017"
      },
      addressSame: true,
      willingnessToRelocate: true,
      hasDisability: false,
      disabilityType: "",
      researchPapers: [
        {
          title: "Optimized Routing Protocols in Dense 5G Wireless Mesh Networks",
          year: 2023,
          journal: "IEEE Transactions on Wireless Communications"
        },
        {
          title: "Congestion Avoidance Framework for Edge Computing Nodes",
          year: 2024,
          journal: "Elsevier Computer Networks"
        }
      ],
      education: [
        {
          educationId: "EDU102-1",
          degree: "M.Tech",
          fieldOfStudy: "Computer Science",
          institute: "ABC Institute of Technology",
          grade: "8.7 CGPA",
          startYear: 2017,
          endYear: 2019
        },
        {
          educationId: "EDU102-2",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science & Engineering",
          institute: "Rajasthan Technical University",
          grade: "8.4 CGPA",
          startYear: 2013,
          endYear: 2017
        }
      ],
      experience: [
        {
          experienceId: "EXP102",
          organization: "XYZ University",
          position: "Assistant Professor",
          startYear: 2022,
          endYear: 2025,
          totalExperience: 3.0
        }
      ]
    },
    "A103": {
      profileId: "P103",
      applicantId: "A103",
      userId: "U103",
      dateOfBirth: "1990-08-19",
      currentAddress: {
        plotBuilding: "Flat 402, Sunshine Apts",
        locality: "C-Scheme",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001"
      },
      permanentAddress: {
        plotBuilding: "Flat 402, Sunshine Apts",
        locality: "C-Scheme",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001"
      },
      addressSame: true,
      willingnessToRelocate: true,
      hasDisability: false,
      education: [
        {
          educationId: "EDU103-1",
          degree: "PhD",
          fieldOfStudy: "Distributed Systems & Cloud Computing",
          institute: "IIT Delhi",
          grade: "9.2 CGPA",
          startYear: 2017,
          endYear: 2021
        }
      ],
      experience: [
        {
          experienceId: "EXP103",
          organization: "NIT Jaipur",
          position: "Assistant Professor Grade-I",
          startYear: 2021,
          endYear: 2026,
          totalExperience: 5.5
        }
      ]
    },
    "A104": {
      profileId: "P104",
      applicantId: "A104",
      userId: "U104",
      dateOfBirth: "1998-02-10",
      currentAddress: {
        plotBuilding: "B-22",
        locality: "Vaishali Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302021"
      },
      permanentAddress: {
        plotBuilding: "B-22",
        locality: "Vaishali Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302021"
      },
      addressSame: true,
      willingnessToRelocate: true,
      hasDisability: false,
      education: [
        {
          educationId: "EDU104-1",
          degree: "M.Sc",
          fieldOfStudy: "Information Technology",
          institute: "State University",
          grade: "7.2 CGPA",
          startYear: 2021,
          endYear: 2023
        }
      ],
      experience: [
        {
          experienceId: "EXP104",
          organization: "Tech Corp",
          position: "Lecturer / Trainer",
          startYear: 2023,
          endYear: 2024,
          totalExperience: 1.0
        }
      ]
    }
  },

  vacancies: [
    {
      vacancyId: "FAC-CS-2026-01",
      department: "Computer Science",
      specialization: "Computer Networks",
      designation: "Assistant Professor",
      academicLevel: "Level 10",
      notes: "Candidates with research publications in top-tier conferences (SIGCOMM, INFOCOM) preferred.",
      educationEligibility: "M.Tech / PhD in relevant area",
      experienceEligibility: "2+ years teaching / research",
      compensation: "Pay Level 10 (7th CPC), Basic Rs. 57,700 - 98,200 + Allowances",
      benefits: "Medical insurance, campus accommodation, research seed grant up to 5 Lakhs",
      incentives: "Conference travel grant, cumulative professional development allowance (CPDA)",
      natureOfPosition: "Full-time, Regular",
      location: "Jaipur",
      teachingResponsibilities: "UG/PG networking courses, Distributed Systems lab, Capstone supervision",
      openingDate: "2026-08-20",
      closingDate: "2026-09-11", // Closed as per UC-007 scenario snapshot
      status: "CLOSED",
      criteria: {
        criteriaId: "ELIG-CS-01",
        vacancyId: "FAC-CS-2026-01",
        educationRequirement: "M.Tech/PhD",
        minExperienceYears: 2.0,
        otherRequirements: "As per institute rules"
      }
    },
    {
      vacancyId: "FAC-EC-2026-03",
      department: "Electronics & Comm.",
      specialization: "VLSI Design",
      designation: "Associate Professor",
      academicLevel: "Level 13A2",
      notes: "Significant industrial or research lab experience in chip tape-out is highly desirable.",
      educationEligibility: "PhD in VLSI / Microelectronics",
      experienceEligibility: "6+ years post-PhD teaching / research",
      compensation: "Pay Level 13A2 (7th CPC), Basic Rs. 1,39,600 + Allowances",
      benefits: "Family healthcare, subsidized housing, lab development fund",
      incentives: "Industry consultancy revenue sharing, international travel grant",
      natureOfPosition: "Full-time, Regular",
      location: "Jaipur",
      teachingResponsibilities: "Digital VLSI Design, Analog IC Design, VLSI CAD algorithms",
      openingDate: "2026-09-01",
      closingDate: "2026-11-30", // Currently Open
      status: "PUBLISHED",
      criteria: {
        criteriaId: "ELIG-EC-03",
        vacancyId: "FAC-EC-2026-03",
        educationRequirement: "PhD",
        minExperienceYears: 6.0,
        otherRequirements: "At least 5 SCI journal publications"
      }
    },
    {
      vacancyId: "FAC-ME-2026-02",
      department: "Mechanical",
      specialization: "Thermal Engg.",
      designation: "Assistant Professor",
      academicLevel: "Level 10",
      notes: "Expertise in CFD and experimental heat transfer.",
      educationEligibility: "PhD in Thermal / Fluid Sciences",
      experienceEligibility: "1+ years postdoctoral or teaching",
      compensation: "Pay Level 10 (7th CPC) + DA + HRA",
      benefits: "Campus quarters, medical cover",
      incentives: "Seed grant of 3 Lakhs",
      natureOfPosition: "Full-time, Regular",
      location: "Jaipur",
      teachingResponsibilities: "Thermodynamics, Heat & Mass Transfer, CFD Lab",
      openingDate: "2026-08-01",
      closingDate: "2026-09-01",
      status: "CLOSED",
      criteria: {
        criteriaId: "ELIG-ME-02",
        vacancyId: "FAC-ME-2026-02",
        educationRequirement: "PhD",
        minExperienceYears: 1.0,
        otherRequirements: "Experimental test bench setup experience"
      }
    },
    {
      vacancyId: "FAC-MA-2026-01",
      department: "Mathematics",
      specialization: "Applied Statistics",
      designation: "Assistant Professor",
      academicLevel: "Level 10",
      notes: "Strong foundation in Stochastic Processes and Bayesian Inference.",
      educationEligibility: "PhD in Mathematics / Statistics",
      experienceEligibility: "Fresh PhDs with high-quality publications may apply",
      compensation: "Pay Level 10 (7th CPC)",
      benefits: "Standard institute perks",
      incentives: "CPDA allowances",
      natureOfPosition: "Full-time, Regular",
      location: "Jaipur",
      teachingResponsibilities: "Probability & Statistics, Discrete Mathematics, Linear Algebra",
      openingDate: "2026-09-15",
      closingDate: "2026-11-15",
      status: "PUBLISHED",
      criteria: {
        criteriaId: "ELIG-MA-01",
        vacancyId: "FAC-MA-2026-01",
        educationRequirement: "PhD",
        minExperienceYears: 0.0,
        otherRequirements: "NET / GATE qualified"
      }
    }
  ],

  applications: [
    {
      applicationId: "APP-0158",
      applicantId: "A102",
      applicantName: "Rahul Sharma",
      applicantEmail: "rahul.sharma@example.com",
      vacancyId: "FAC-CS-2026-01",
      applicationDate: "2026-09-10",
      submissionDate: "2026-09-10T14:31:55+05:30",
      status: "ELIGIBLE", // Screened as Eligible in UC-007 Object Diagram snapshot
      highestDegree: "M.Tech",
      totalExperience: 3.0,
      documents: [
        {
          documentId: "DOC-101",
          documentType: "AADHAR_CARD",
          fileName: "aadhar_card.pdf",
          fileSizeKB: 310,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-102",
          documentType: "MASTERS_DEGREE",
          fileName: "mtech_degree.pdf",
          fileSizeKB: 640,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-103",
          documentType: "EXPERIENCE_CERTIFICATE",
          fileName: "experience_certificate.pdf",
          fileSizeKB: 450,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-104",
          documentType: "MARKSHEET_10",
          fileName: "marksheets.pdf",
          fileSizeKB: 1120,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-105",
          documentType: "BIRTH_CERTIFICATE",
          fileName: "birth_certificate.pdf",
          fileSizeKB: 290,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        }
      ],
      screeningRecord: {
        screeningId: "SCR-025",
        screenedBy: "Anita Verma (RC-07)",
        result: "ELIGIBLE",
        comments: "Required qualifications and experience satisfied. Top journal publications noted.",
        screeningDate: "2026-09-12T11:20:00+05:30"
      },
      interviewId: "INT-031",
      hodReview: {
        reviewed: false,
        approved: null,
        comments: ""
      },
      appointmentLetter: null
    },
    {
      applicationId: "APP-0161",
      applicantId: "A103",
      applicantName: "Priya Mehta",
      applicantEmail: "priya.mehta@example.com",
      vacancyId: "FAC-CS-2026-01",
      applicationDate: "2026-09-10",
      submissionDate: "2026-09-10T16:05:10+05:30",
      status: "ELIGIBLE",
      highestDegree: "PhD",
      totalExperience: 5.5,
      documents: [
        {
          documentId: "DOC-201",
          documentType: "AADHAR_CARD",
          fileName: "priya_aadhar.pdf",
          fileSizeKB: 280,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-202",
          documentType: "MASTERS_DEGREE",
          fileName: "phd_degree.pdf",
          fileSizeKB: 890,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-203",
          documentType: "EXPERIENCE_CERTIFICATE",
          fileName: "nit_exp.pdf",
          fileSizeKB: 512,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-204",
          documentType: "MARKSHEET_10",
          fileName: "marksheets.pdf",
          fileSizeKB: 980,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-205",
          documentType: "BIRTH_CERTIFICATE",
          fileName: "birth_cert.pdf",
          fileSizeKB: 320,
          mimeType: "application/pdf",
          uploadDate: "2026-09-10",
          verificationStatus: "VERIFIED"
        }
      ],
      screeningRecord: {
        screeningId: "SCR-026",
        screenedBy: "Anita Verma (RC-07)",
        result: "ELIGIBLE",
        comments: "Exceeds criteria. PhD from IIT Delhi with 5.5 yrs experience.",
        screeningDate: "2026-09-12T12:00:00+05:30"
      },
      interviewId: "INT-032",
      hodReview: {
        reviewed: false,
        approved: null,
        comments: ""
      },
      appointmentLetter: null
    },
    {
      applicationId: "APP-0170",
      applicantId: "A104",
      applicantName: "Arjun Rao",
      applicantEmail: "arjun.rao@example.com",
      vacancyId: "FAC-CS-2026-01",
      applicationDate: "2026-09-11",
      submissionDate: "2026-09-11T10:15:00+05:30",
      status: "NOT_ELIGIBLE",
      highestDegree: "M.Sc",
      totalExperience: 1.0,
      documents: [
        {
          documentId: "DOC-301",
          documentType: "AADHAR_CARD",
          fileName: "arjun_aadhar.pdf",
          fileSizeKB: 210,
          mimeType: "application/pdf",
          uploadDate: "2026-09-11",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-302",
          documentType: "MASTERS_DEGREE",
          fileName: "msc_degree.pdf",
          fileSizeKB: 410,
          mimeType: "application/pdf",
          uploadDate: "2026-09-11",
          verificationStatus: "VERIFIED"
        }
      ],
      screeningRecord: {
        screeningId: "SCR-027",
        screenedBy: "Anita Verma (RC-07)",
        result: "NOT_ELIGIBLE",
        comments: "Candidate holds M.Sc instead of mandatory M.Tech/PhD and has only 1 yr experience.",
        screeningDate: "2026-09-12T12:30:00+05:30"
      },
      interviewId: null,
      hodReview: null,
      appointmentLetter: null
    },
    {
      applicationId: "APP-0172",
      applicantId: "A105",
      applicantName: "Neha Gupta",
      applicantEmail: "neha.gupta@example.com",
      vacancyId: "FAC-CS-2026-01",
      applicationDate: "2026-09-11",
      submissionDate: "2026-09-11T11:45:00+05:30",
      status: "REVIEW_REQUIRED",
      highestDegree: "PhD",
      totalExperience: 2.0,
      documents: [
        {
          documentId: "DOC-401",
          documentType: "AADHAR_CARD",
          fileName: "aadhar_copy.pdf",
          fileSizeKB: 250,
          mimeType: "application/pdf",
          uploadDate: "2026-09-11",
          verificationStatus: "VERIFIED"
        },
        {
          documentId: "DOC-402",
          documentType: "MASTERS_DEGREE",
          fileName: "phd_provisional.pdf",
          fileSizeKB: 550,
          mimeType: "application/pdf",
          uploadDate: "2026-09-11",
          verificationStatus: "REJECTED" // Cause for REVIEW_REQUIRED as in wireframe S-08
        }
      ],
      screeningRecord: {
        screeningId: "SCR-028",
        screenedBy: "Anita Verma (RC-07)",
        result: "REQUIRES_REVIEW",
        comments: "Provisional degree certificate unverified / seal missing. Verification issue.",
        screeningDate: "2026-09-12T13:10:00+05:30"
      },
      interviewId: null,
      hodReview: null,
      appointmentLetter: null
    }
  ],

  interviews: [
    {
      interviewId: "INT-031",
      applicationId: "APP-0158",
      candidateName: "Rahul Sharma",
      vacancyId: "FAC-CS-2026-01",
      department: "Computer Science",
      designation: "Assistant Professor",
      interviewDate: "2026-09-25",
      interviewTime: "10:00",
      status: "VALIDATED", // 3 panel evaluations are in, ready for recommendation/HOD as per wireframe S-11
      panel: [
        { memberId: "PNL-01", name: "Dr. K. Iyer", designation: "Associate Professor" },
        { memberId: "PNL-02", name: "Dr. S. Bansal", designation: "Professor" },
        { memberId: "PNL-03", name: "Dr. M. Rao", designation: "Associate Professor" }
      ],
      attendance: {
        "PNL-01": true,
        "PNL-02": true,
        "PNL-03": true
      },
      evaluations: [
        {
          evaluationId: "EVL-031-1",
          memberId: "PNL-01",
          memberName: "Dr. K. Iyer",
          score: 8.0,
          comments: "Strong networking fundamentals, clear research vision in 5G wireless mesh networks.",
          evaluationDate: "2026-09-25T10:52:00+05:30"
        },
        {
          evaluationId: "EVL-031-2",
          memberId: "PNL-02",
          memberName: "Dr. S. Bansal",
          score: 7.5,
          comments: "Good teaching demo on TCP Congestion Control. Clear board work and student engagement.",
          evaluationDate: "2026-09-25T10:55:00+05:30"
        },
        {
          evaluationId: "EVL-031-3",
          memberId: "PNL-03",
          memberName: "Dr. M. Rao",
          score: 8.5,
          comments: "Clear research plan and sound answers on distributed routing protocols.",
          evaluationDate: "2026-09-25T11:01:00+05:30"
        }
      ],
      aggregateScore: 8.0,
      recommendation: "RECOMMENDED",
      panelRemarks: "Recommended unanimously by the CSE interview panel for Assistant Professor position.",
      finalized: false
    },
    {
      interviewId: "INT-032",
      applicationId: "APP-0161",
      candidateName: "Priya Mehta",
      vacancyId: "FAC-CS-2026-01",
      department: "Computer Science",
      designation: "Assistant Professor",
      interviewDate: "2026-09-25",
      interviewTime: "11:30",
      status: "EVALUATION_PENDING",
      panel: [
        { memberId: "PNL-01", name: "Dr. K. Iyer", designation: "Associate Professor" },
        { memberId: "PNL-02", name: "Dr. S. Bansal", designation: "Professor" },
        { memberId: "PNL-03", name: "Dr. M. Rao", designation: "Associate Professor" }
      ],
      attendance: {
        "PNL-01": true
      },
      evaluations: [
        {
          evaluationId: "EVL-032-1",
          memberId: "PNL-01",
          memberName: "Dr. K. Iyer",
          score: 8.0,
          comments: "Excellent command over cloud computing and microservices architecture.",
          evaluationDate: "2026-09-25T11:50:00+05:30"
        }
      ],
      aggregateScore: null,
      recommendation: "PENDING",
      panelRemarks: "",
      finalized: false
    },
    {
      interviewId: "INT-029",
      applicationId: "APP-0150",
      candidateName: "Karan Joshi",
      vacancyId: "FAC-CS-2026-01",
      department: "Computer Science",
      designation: "Assistant Professor",
      interviewDate: "2026-09-24",
      interviewTime: "15:00",
      status: "NOT_ATTENDED",
      panel: [
        { memberId: "PNL-01", name: "Dr. K. Iyer", designation: "Associate Professor" },
        { memberId: "PNL-02", name: "Dr. S. Bansal", designation: "Professor" }
      ],
      attendance: {
        "PNL-01": false
      },
      evaluations: [],
      aggregateScore: null,
      recommendation: "NOT_RECOMMENDED",
      panelRemarks: "Candidate did not appear for scheduled interview.",
      finalized: true
    },
    {
      interviewId: "INT-027",
      applicationId: "APP-0148",
      candidateName: "Sana Khan",
      vacancyId: "FAC-CS-2026-01",
      department: "Computer Science",
      designation: "Assistant Professor",
      interviewDate: "2026-09-24",
      interviewTime: "12:00",
      status: "RESCHEDULED",
      panel: [
        { memberId: "PNL-01", name: "Dr. K. Iyer", designation: "Associate Professor" },
        { memberId: "PNL-03", name: "Dr. M. Rao", designation: "Associate Professor" }
      ],
      attendance: {},
      evaluations: [],
      aggregateScore: null,
      recommendation: "PENDING",
      panelRemarks: "Rescheduled due to department symposium.",
      finalized: false
    }
  ],

  notifications: [
    {
      notificationId: "NOTIF-001",
      recipientId: "U102",
      type: "APPLICATION_CONFIRMATION",
      message: "Your application APP-0158 for Assistant Professor (Computer Science) has been successfully submitted.",
      timestamp: "2026-09-10T14:32:00+05:30",
      status: "SENT"
    },
    {
      notificationId: "NOTIF-002",
      recipientId: "U102",
      type: "SCREENING_RESULT",
      message: "Application APP-0158 screening completed: Result - ELIGIBLE.",
      timestamp: "2026-09-12T11:21:00+05:30",
      status: "SENT"
    },
    {
      notificationId: "NOTIF-003",
      recipientId: "U102",
      type: "INTERVIEW_SCHEDULE",
      message: "Interview INT-031 scheduled on 2026-09-25 at 10:00 AM for Assistant Professor.",
      timestamp: "2026-09-15T09:00:00+05:30",
      status: "SENT"
    },
    {
      notificationId: "NOTIF-004",
      recipientId: "U001",
      type: "EVALUATION_RESULT",
      message: "Candidate Rahul Sharma (APP-0158) has been RECOMMENDED by panel for HOD approval.",
      timestamp: "2026-09-25T11:05:00+05:30",
      status: "SENT"
    }
  ],

  auditLogs: [
    {
      logId: "LOG-001",
      userId: "U102",
      action: "APPLICATION_SUBMITTED",
      entityType: "Application",
      entityId: "APP-0158",
      timestamp: "2026-09-10T14:31:55+05:30"
    },
    {
      logId: "LOG-002",
      userId: "U007",
      action: "SCREENING_RECORDED",
      entityType: "Application",
      entityId: "APP-0158",
      timestamp: "2026-09-12T11:20:00+05:30"
    },
    {
      logId: "LOG-003",
      userId: "U008",
      action: "EVALUATION_SUBMITTED",
      entityType: "Interview",
      entityId: "INT-031",
      timestamp: "2026-09-25T10:52:00+05:30"
    },
    {
      logId: "LOG-004",
      userId: "U008",
      action: "RECOMMENDATION_CONFIRMED",
      entityType: "Interview",
      entityId: "INT-031",
      timestamp: "2026-09-25T11:02:00+05:30"
    }
  ]
};

module.exports = { initialData };
