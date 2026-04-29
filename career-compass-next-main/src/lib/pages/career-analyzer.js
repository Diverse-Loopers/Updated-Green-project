import { supabase } from '../supabase';

// Career Details Data
export const CAREER_DETAILS = {
  backend: {
    id: "backend",
    title: "Backend Developer",
    icon: "fa-terminal",
    description: "You build the logic, databases, and APIs that power applications. You prefer efficiency and logic over visual design.",
    roadmap: [
      { month: "1-2", topic: "Core Language", desc: "Master Python, Java, or Node.js logic and syntax." },
      { month: "3-4", topic: "Databases", desc: "Learn SQL (PostgreSQL) and NoSQL (MongoDB) basics." },
      { month: "5-6", topic: "APIs & Servers", desc: "Build RESTful APIs using Express or Django." },
      { month: "7+", topic: "Deployment", desc: "Learn Docker, AWS basics, and CI/CD pipelines." },
    ],
  },
  fullstack: {
    id: "fullstack",
    title: "Full Stack Developer",
    icon: "fa-globe",
    description: "The jack-of-all-trades. You enjoy building the entire product, from the user interface to the server logic.",
    roadmap: [
      { month: "1-2", topic: "Frontend Basics", desc: "HTML, CSS, JavaScript, and React." },
      { month: "3-4", topic: "Backend Basics", desc: "Node.js, Express, and connecting to databases." },
      { month: "5-6", topic: "Integration", desc: "Building full CRUD apps and handling state management." },
      { month: "7+", topic: "Advanced", desc: "Next.js, Authentication, and scalable architecture." },
    ],
  },
  data: {
    id: "data",
    title: "Data Analyst",
    icon: "fa-chart-line",
    description: "You find stories in numbers. You prefer patterns, statistics, and insights over writing software code.",
    roadmap: [
      { month: "1-2", topic: "Excel & SQL", desc: "Master advanced Excel and SQL querying." },
      { month: "3-4", topic: "Visualization", desc: "Learn PowerBI or Tableau to tell stories with data." },
      { month: "5-6", topic: "Python for Data", desc: "Pandas, NumPy, and basic data cleaning." },
      { month: "7+", topic: "Statistics", desc: "Basic statistical modeling and A/B testing." },
    ],
  },
  cybersecurity: {
    id: "cybersecurity",
    title: "Cybersecurity Analyst",
    icon: "fa-shield-halved",
    description: "The digital guardian. You enjoy finding vulnerabilities, protecting systems, and understanding how networks work.",
    roadmap: [
      { month: "1-2", topic: "Networking", desc: "CompTIA Network+ concepts, OSI model, TCP/IP." },
      { month: "3-4", topic: "OS & Linux", desc: "Master Linux command line and Windows administration." },
      { month: "5-6", topic: "Security Basics", desc: "CompTIA Security+, threat analysis, firewalls." },
      { month: "7+", topic: "Tools", desc: "Wireshark, Nmap, and basic penetration testing tools." },
    ],
  },
  qa: {
    id: "qa",
    title: "QA Automation Engineer",
    icon: "fa-check-circle",
    description: "The quality gatekeeper. You love breaking things to ensure they are fixed before reaching the user.",
    roadmap: [
      { month: "1-2", topic: "Testing Basics", desc: "Manual testing, writing test cases, Jira." },
      { month: "3-4", topic: "Coding for QA", desc: "Java or Python basics specifically for scripting." },
      { month: "5-6", topic: "Automation", desc: "Selenium, Cypress, or Playwright." },
      { month: "7+", topic: "CI Integration", desc: "Running tests in Jenkins or GitHub Actions." },
    ],
  },
};

// Questions Data
export const QUESTIONS = [
  {
    id: "interest",
    text: "What part of technology excites you the most?",
    options: [
      { text: "Building visual interfaces users interact with", scores: { fullstack: 5, backend: 1, qa: 1, data: 0, cybersecurity: 0 } },
      { text: "Designing the hidden logic and data flow", scores: { backend: 5, fullstack: 3, data: 2, cybersecurity: 1, qa: 0 } },
      { text: "Finding patterns and predicting trends", scores: { data: 5, backend: 1, fullstack: 0, cybersecurity: 1, qa: 1 } },
      { text: "Breaking systems to make them stronger", scores: { cybersecurity: 4, qa: 5, backend: 1, data: 0, fullstack: 0 } },
    ],
  },
  {
    id: "activity",
    text: "If you were working on a team project, which task would you volunteer for?",
    options: [
      { text: "Creating the dashboard and buttons", scores: { fullstack: 5, backend: 0, qa: 1, data: 1, cybersecurity: 0 } },
      { text: "Setting up the database and API", scores: { backend: 5, fullstack: 3, data: 2, cybersecurity: 1, qa: 0 } },
      { text: "Analyzing user behavior data", scores: { data: 5, backend: 1, fullstack: 0, cybersecurity: 0, qa: 1 } },
      { text: "Checking for bugs and security holes", scores: { qa: 5, cybersecurity: 5, backend: 1, data: 0, fullstack: 0 } },
    ],
  },
  {
    id: "mindset",
    text: "How do you approach a difficult problem?",
    options: [
      { text: "I construct a solution step-by-step from scratch", scores: { backend: 4, fullstack: 4, data: 1, cybersecurity: 1, qa: 1 } },
      { text: "I look for anomalies and potential points of failure", scores: { cybersecurity: 5, qa: 5, data: 2, backend: 1, fullstack: 0 } },
      { text: "I gather data to see what worked before", scores: { data: 5, backend: 2, fullstack: 1, cybersecurity: 1, qa: 1 } },
    ],
  },
  {
    id: "environment",
    text: "Which work environment sounds best?",
    options: [
      { text: "Fast-paced, building new features daily", scores: { fullstack: 5, backend: 4, data: 1, cybersecurity: 0, qa: 1 } },
      { text: "Stable, ensuring reliability and security", scores: { cybersecurity: 5, qa: 5, backend: 3, data: 2, fullstack: 1 } },
      { text: "Research-heavy, creating reports and insights", scores: { data: 5, backend: 1, cybersecurity: 2, fullstack: 0, qa: 1 } },
    ],
  },
];

// State Management
export let state = {
  view: "landing",
  step: 0,
  formData: {
    name: "",
    email: "",
    branch: "",
    year: "1st",
    skillLevel: "Beginner",
    answers: {},
  },
  results: null,
};

// Calculate Results
export async function calculateResults() {
  state.view = "calculating";
  
  let finalScores = {
    backend: 0,
    fullstack: 0,
    data: 0,
    cybersecurity: 0,
    qa: 0,
  };

  Object.values(state.formData.answers).forEach((scoreSet) => {
    Object.keys(scoreSet).forEach((career) => {
      finalScores[career] += scoreSet[career];
    });
  });

  if (state.formData.branch === "CSE" || state.formData.branch === "IT") {
    finalScores.backend += 2;
    finalScores.fullstack += 2;
  }
  if (state.formData.skillLevel === "Beginner") {
    finalScores.qa += 3;
    finalScores.data += 1;
  }
  if (state.formData.skillLevel === "Advanced") {
    finalScores.backend += 3;
    finalScores.cybersecurity += 3;
  }

  const maxPossible = 30;
  const sortedCareers = Object.entries(finalScores)
    .map(([key, value]) => ({
      key,
      score: Math.min(Math.round((value / maxPossible) * 100), 98),
      ...CAREER_DETAILS[key],
    }))
    .sort((a, b) => b.score - a.score);

  // Save to Supabase
  try {
    const { error } = await supabase
      .from("career_analysis")
      .insert([
        {
          student_info: {
            name: state.formData.name,
            branch: state.formData.branch,
            year: state.formData.year,
          },
          answers: state.formData.answers,
          scores: finalScores,
          created_at: new Date().toISOString(),
        },
      ]);
    if (error) throw error;
    console.log("Data saved to Supabase");
  } catch (error) {
    console.error("Error saving data:", error);
  }

  state.results = {
    top: sortedCareers[0],
    secondary: sortedCareers[1],
    low: sortedCareers[sortedCareers.length - 1],
  };

  state.view = "results";
}

// Reset State
export function resetState() {
  state.step = 0;
  state.view = "landing";
  state.results = null;
  state.formData.answers = {};
}