const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const app = express();

// Get port from environment variable (Railway provides this)
const PORT = process.env.PORT || 3000;

// For Railway's file system (persistent storage)
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'jobs.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Created data directory: ${dataDir}`);
}

// Admin credentials (for Railway, consider using env vars)
const ADMIN_USER = process.env.ADMIN_USER || "Ruhan@0312";
const ADMIN_PASS = process.env.ADMIN_PASS || "Ruhan@0312";

// Fixed experience levels and locations
const EXPERIENCE_LEVELS = ['Fresher', '0-1 years', '1-2 years', '2-4 years', '4-6 years', '6-8 years', '8-10 years', '10+ years'];
const LOCATIONS = ['Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi', 'Gurgaon', 'Noida'];

// SEO Meta descriptions
const SEO_DATA = {
  home: {
    title: "IT & Non-IT Jobs in Bangalore | Software Developer Jobs - Bangalore Connect",
    description: "Find latest IT jobs, Software Engineer positions, Non-IT careers in Bangalore. 1000+ job listings with salary details. Direct apply to companies.",
    keywords: "Bangalore jobs, IT jobs Bangalore, software developer jobs, fresher jobs Bangalore, experienced jobs, tech careers, job portal Bangalore",
    image: "/og-image.jpg"
  },
  job: {
    title: "Job in Bangalore | Bangalore Connect",
    description: "Find job opportunities in Bangalore with salary details and direct apply links.",
    keywords: "jobs, career, employment, Bangalore"
  },
  dashboard: {
    title: "Admin Dashboard - Bangalore Connect",
    description: "Manage job listings and monitor portal activity",
    keywords: "admin, dashboard, job management"
  },
  postJob: {
    title: "Post New Job - Bangalore Connect",
    description: "Post a new job listing on Bangalore Connect portal",
    keywords: "post job, hire, recruitment"
  },
  adminLogin: {
    title: "Admin Login - Bangalore Connect",
    description: "Admin login for Bangalore Connect job portal",
    keywords: "admin login, portal login"
  },
  resumeBuilder: {
    title: "Free Resume Builder | Create Professional Resume - Bangalore Connect",
    description: "Create professional resumes for IT and Non-IT jobs in Bangalore. Free resume templates and builder.",
    keywords: "resume builder, CV maker, resume template, professional resume"
  },
  interviewPrep: {
    title: "Interview Preparation Tips | Bangalore Jobs - Bangalore Connect",
    description: "Interview preparation tips, common questions, and guidance for job interviews in Bangalore.",
    keywords: "interview questions, interview tips, job interview, technical interview"
  },
  companies: {
    title: "Top Companies Hiring in Bangalore | Job Portal - Bangalore Connect",
    description: "List of top companies hiring in Bangalore with job opportunities and career information.",
    keywords: "companies in Bangalore, tech companies, MNC jobs, startup jobs, hiring companies"
  },
  careerGuide: {
    title: "Career Growth Guide | Bangalore Job Market - Bangalore Connect",
    description: "Career growth guide, salary trends, and job market insights for Bangalore professionals.",
    keywords: "career advice, career growth, Bangalore job market, salary guide"
  },
  blog: {
    title: "Bangalore Job Market Blog | Career Insights - Bangalore Connect",
    description: "Latest news, trends, and insights about Bangalore job market and career opportunities.",
    keywords: "Bangalore job blog, career blog, IT industry news, job trends"
  },
  aiResources: {
    title: "AI Career Resources | Bangalore Tech Jobs - Bangalore Connect",
    description: "AI and Machine Learning career resources, job opportunities, and skill development for Bangalore.",
    keywords: "AI jobs, machine learning careers, data science jobs Bangalore, artificial intelligence"
  },
  multilingual: {
    title: "Multilingual Job Support | Bangalore Connect",
    description: "Job support and resources in multiple languages for diverse job seekers in Bangalore.",
    keywords: "multilingual jobs, English jobs, Kannada jobs, Hindi jobs Bangalore"
  },
  terms: {
    title: "Terms & Conditions | Bangalore Connect",
    description: "Terms and conditions for using Bangalore Connect job portal.",
    keywords: "terms, conditions, legal"
  },
  privacy: {
    title: "Privacy Policy | Bangalore Connect",
    description: "Privacy policy for Bangalore Connect job portal.",
    keywords: "privacy, policy, data protection"
  }
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || "bangalore-connect-secret-key-" + Math.random().toString(36).substring(2),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Load jobs with Railway compatibility
let jobs = [];
function loadJobs() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      if (data.trim()) {
        jobs = JSON.parse(data);
        console.log(`✅ Loaded ${jobs.length} jobs from ${DATA_FILE}`);
      } else {
        console.log(`ℹ️ ${DATA_FILE} is empty, starting with empty jobs array`);
        jobs = [];
      }
    } else {
      console.log(`ℹ️ ${DATA_FILE} not found, creating new file`);
      jobs = [];
      saveJobs();
    }
  } catch (error) {
    console.error("❌ Error loading jobs:", error.message);
    console.error("Full error:", error);
    jobs = [];
    // Create fresh file if corrupted
    saveJobs();
  }
}

// Save jobs function
function saveJobs() {
  try {
    const data = JSON.stringify(jobs, null, 2);
    fs.writeFileSync(DATA_FILE, data);
    console.log(`💾 Saved ${jobs.length} jobs to ${DATA_FILE}`);
    return true;
  } catch (error) {
    console.error("❌ Error saving jobs:", error.message);
    return false;
  }
}

// Initial load
loadJobs();

// Helper function to format job description with line breaks
function formatJobDescription(description) {
  if (!description) return '';
  return description.replace(/\n/g, '<br>');
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session.isAdmin && req.session.lastActivity && 
      (Date.now() - req.session.lastActivity) < 60 * 60 * 1000) {
    req.session.lastActivity = Date.now();
    return next();
  }
  req.session.destroy();
  res.redirect("/admin?redirect=" + encodeURIComponent(req.originalUrl));
}

// ==================== ROUTES ====================

// HEALTH CHECK (Important for Railway)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    jobsCount: jobs.length,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// HOME PAGE
app.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  
  let filteredJobs = [...jobs];
  const { search, type, experience, location } = req.query;
  
  if (search) {
    filteredJobs = filteredJobs.filter(job => 
      job.role.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  if (type && type !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.type === type);
  }
  
  if (experience && experience !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.experience === experience);
  }
  
  if (location && location !== 'all') {
    filteredJobs = filteredJobs.filter(job => job.location.includes(location));
  }
  
  const totalPages = Math.ceil(filteredJobs.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const jobsToShow = filteredJobs.slice(start, end);
  
  const formattedJobs = jobsToShow.map(job => ({
    ...job,
    description: formatJobDescription(job.description)
  }));
  
  const jobTypes = [...new Set(jobs.map(job => job.type))];
  
  // Generate sitemap URL for SEO
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  res.render("home", {
    jobs: formattedJobs,
    page,
    totalPages,
    jobTypes,
    experiences: EXPERIENCE_LEVELS,
    locations: LOCATIONS,
    query: req.query,
    totalJobs: filteredJobs.length,
    showAdminButton: true,
    contactEmail: "bangalore.connect1@gmail.com",
    // SEO Data
    title: SEO_DATA.home.title,
    description: SEO_DATA.home.description,
    keywords: SEO_DATA.home.keywords,
    canonicalUrl: `${baseUrl}/`,
    image: `${baseUrl}${SEO_DATA.home.image}`,
    baseUrl: baseUrl,
    // Structured Data for Jobs
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": jobsToShow.map((job, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "JobPosting",
          "title": job.role,
          "description": job.description?.substring(0, 200) || "Job opportunity in Bangalore",
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.company
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location,
              "addressRegion": "Karnataka",
              "addressCountry": "IN"
            }
          },
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "INR",
            "value": {
              "@type": "QuantitativeValue",
              "minValue": job.salary,
              "maxValue": job.salary,
              "unitText": "MONTH"
            }
          },
          "employmentType": "FULL_TIME",
          "experienceRequirements": job.experience,
          "datePosted": new Date(job.timestamp || job.postedDate).toISOString()
        }
      }))
    })
  });
});

// JOB DETAILS PAGE
app.get("/job/:id", (req, res) => {
  const job = jobs.find(j => j.id == req.params.id);
  if (!job) {
    return res.status(404).render('404', { 
      title: 'Job Not Found - Bangalore Connect',
      description: 'This job posting is no longer available on Bangalore Connect.',
      canonicalUrl: `https://bangalorconnect.online/job/${req.params.id}`,
      contactEmail: "bangalore.connect1@gmail.com"
    });
  }
  
  const formattedJob = {
    ...job,
    description: formatJobDescription(job.description)
  };
  
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  // Generate job-specific title and description
  const jobTitle = `${job.role} at ${job.company} in ${job.location} | Bangalore Connect`;
  const jobDescription = `Apply for ${job.role} position at ${job.company} in ${job.location}. ${job.experience} experience required. Salary: ₹${job.salary}. ${job.type} job opportunity in Bangalore.`;
  const jobKeywords = `${job.role}, ${job.company} jobs, ${job.location} jobs, ${job.type} jobs Bangalore, ${job.experience} jobs`;
  
  res.render("job", { 
    job: formattedJob,
    showAdminButton: false,
    contactEmail: "bangalore.connect1@gmail.com",
    // SEO Data
    title: jobTitle,
    description: jobDescription,
    keywords: jobKeywords,
    canonicalUrl: `${baseUrl}/job/${job.id}`,
    image: `${baseUrl}/og-job.jpg`,
    baseUrl: baseUrl,
    // Structured Data for Single Job
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.role,
      "description": job.description?.substring(0, 500) || "Job opportunity in Bangalore",
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
        "sameAs": job.applyLink
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location,
          "addressRegion": "Karnataka",
          "addressCountry": "IN"
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary,
          "maxValue": job.salary,
          "unitText": "MONTH"
        }
      },
      "employmentType": "FULL_TIME",
      "experienceRequirements": job.experience,
      "datePosted": new Date(job.timestamp || job.postedDate).toISOString(),
      "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      "directApply": true
    })
  });
});

// ==================== ADMIN ROUTES ====================

// ADMIN LOGIN
app.get("/admin", (req, res) => {
  req.session.destroy();
  const error = req.query.error || null;
  const redirect = req.query.redirect || '/dashboard';
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  res.render("admin-login", { 
    error, 
    redirect,
    contactEmail: "bangalore.connect1@gmail.com",
    title: SEO_DATA.adminLogin.title,
    description: SEO_DATA.adminLogin.description,
    canonicalUrl: `${baseUrl}/admin`
  });
});

app.post("/admin", (req, res) => {
  const { username, password, redirect } = req.body;
  
  req.session.regenerate((err) => {
    if (err) {
      console.error("Session regeneration error:", err);
      return res.render("admin-login", { 
        error: "Session error. Please try again.",
        redirect: redirect || '/dashboard',
        contactEmail: "bangalore.connect1@gmail.com",
        title: SEO_DATA.adminLogin.title
      });
    }
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      req.session.isAdmin = true;
      req.session.lastActivity = Date.now();
      req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000);
      
      return res.redirect(redirect || "/dashboard");
    } else {
      res.render("admin-login", { 
        error: "Invalid username or password",
        redirect: redirect || '/dashboard',
        contactEmail: "bangalore.connect1@gmail.com",
        title: SEO_DATA.adminLogin.title
      });
    }
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destruction error:', err);
    res.clearCookie('connect.sid');
    res.redirect("/");
  });
});

// DASHBOARD
app.get("/dashboard", requireAuth, (req, res) => {
  const totalJobs = jobs.length;
  const itJobs = jobs.filter(j => j.type === 'IT').length;
  const nonItJobs = jobs.filter(j => j.type === 'Non-IT').length;
  const featuredJobs = jobs.filter(j => j.featured).length;
  
  const success = req.query.success || null;
  const error = req.query.error || null;
  
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  res.render("dashboard", { 
    jobs, 
    totalJobs, 
    itJobs, 
    nonItJobs, 
    featuredJobs,
    experienceLevels: EXPERIENCE_LEVELS,
    locations: LOCATIONS,
    contactEmail: "bangalore.connect1@gmail.com",
    success: success,
    error: error,
    title: SEO_DATA.dashboard.title,
    description: SEO_DATA.dashboard.description,
    canonicalUrl: `${baseUrl}/dashboard`
  });
});

// POST JOB
app.get("/post-job", requireAuth, (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  res.render("post-job", {
    experienceLevels: EXPERIENCE_LEVELS,
    locations: LOCATIONS,
    contactEmail: "bangalore.connect1@gmail.com",
    title: SEO_DATA.postJob.title,
    description: SEO_DATA.postJob.description,
    canonicalUrl: `${baseUrl}/post-job`
  });
});

app.post("/post-job", requireAuth, (req, res) => {
  try {
    const description = req.body.description
      ?.replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim() || '';
    
    const newJob = {
      id: Date.now(),
      role: req.body.role?.trim() || '',
      company: req.body.company?.trim() || '',
      salary: req.body.salary || 'Not disclosed',
      type: req.body.type || 'IT',
      experience: req.body.experience || 'Fresher',
      location: req.body.location || 'Bangalore',
      description: description,
      applyLink: req.body.applyLink?.trim() || '#',
      featured: req.body.featured === 'on',
      postedDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      timestamp: Date.now()
    };
    
    jobs.unshift(newJob);
    
    if (saveJobs()) {
      res.redirect("/dashboard?success=Job posted successfully!");
    } else {
      res.redirect("/dashboard?error=Failed to save job to database");
    }
  } catch (error) {
    console.error("Error posting job:", error);
    res.redirect("/dashboard?error=Error posting job: " + error.message);
  }
});

// DELETE JOB - ROBUST VERSION
app.get("/delete-job/:id", requireAuth, (req, res) => {
  try {
    const jobId = req.params.id;
    console.log(`=== DELETE REQUEST ===`);
    console.log(`Job ID from URL: ${jobId} (Type: ${typeof jobId})`);
    console.log(`Total jobs in memory: ${jobs.length}`);
    
    // Find job index using multiple comparison methods
    let jobIndex = -1;
    
    // Try different comparison methods
    jobIndex = jobs.findIndex(job => 
      job.id == jobId || 
      job.id.toString() === jobId.toString() ||
      Number(job.id) === Number(jobId)
    );
    
    if (jobIndex !== -1) {
      const jobTitle = jobs[jobIndex].role;
      console.log(`Found job: "${jobTitle}" at index ${jobIndex}`);
      
      // Remove job from array
      const deletedJob = jobs.splice(jobIndex, 1)[0];
      
      // Save to file
      if (saveJobs()) {
        console.log(`✓ Job deleted: "${jobTitle}"`);
        console.log(`Remaining jobs: ${jobs.length}`);
        
        const successMessage = encodeURIComponent(`Job "${jobTitle}" deleted successfully`);
        res.redirect(`/dashboard?success=${successMessage}`);
      } else {
        // Restore job if save failed
        jobs.splice(jobIndex, 0, deletedJob);
        throw new Error("Failed to save changes to database");
      }
    } else {
      console.log(`✗ Job not found with ID: ${jobId}`);
      
      // Log all available IDs for debugging
      console.log("Available job IDs:", jobs.map(j => j.id));
      
      res.redirect("/dashboard?error=" + encodeURIComponent(`Job not found with ID: ${jobId}`));
    }
  } catch (error) {
    console.error("Error deleting job:", error);
    res.redirect("/dashboard?error=" + encodeURIComponent(`Error deleting job: ${error.message}`));
  }
});

// ==================== RESOURCE PAGES ====================

const resourcePages = [
  { path: "resume-builder", data: SEO_DATA.resumeBuilder },
  { path: "interview-prep", data: SEO_DATA.interviewPrep },
  { path: "companies", data: SEO_DATA.companies },
  { path: "career-guide", data: SEO_DATA.careerGuide },
  { path: "blog", data: SEO_DATA.blog },
  { path: "ai-resources", data: SEO_DATA.aiResources },
  { path: "multilingual", data: SEO_DATA.multilingual },
  { path: "terms", data: SEO_DATA.terms },
  { path: "privacy", data: SEO_DATA.privacy }
];

resourcePages.forEach(page => {
  app.get(`/${page.path}`, (req, res) => {
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
    
    res.render(page.path, { 
      showAdminButton: false,
      title: page.data.title,
      description: page.data.description,
      keywords: page.data.keywords,
      contactEmail: "bangalore.connect1@gmail.com",
      canonicalUrl: `${baseUrl}/${page.path}`
    });
  });
});

// ==================== SEO PAGES ====================

// SITEMAP.XML (For SEO)
app.get("/sitemap.xml", (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  // Home page
  sitemap += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  // Job pages
  jobs.forEach(job => {
    sitemap += `
  <url>
    <loc>${baseUrl}/job/${job.id}</loc>
    <lastmod>${new Date(job.timestamp || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });
  
  // Resource pages
  resourcePages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}/${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });
  
  sitemap += `
</urlset>`;
  
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// ROBOTS.TXT (For SEO)
app.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /post-job
Disallow: /delete-job/

Sitemap: ${baseUrl}/sitemap.xml

# Bangalore Connect Job Portal
# Contact: bangalore.connect1@gmail.com`;
  
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ==================== ERROR HANDLERS ====================

// 404 handler
app.use((req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  res.status(404).render('404', { 
    title: 'Page Not Found - Bangalore Connect',
    description: 'The page you are looking for does not exist. Find job opportunities in Bangalore on our homepage.',
    canonicalUrl: baseUrl + req.originalUrl,
    contactEmail: "bangalore.connect1@gmail.com"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bangalorconnect.online' : `http://localhost:${PORT}`;
  
  res.status(500).render('error', { 
    title: 'Server Error - Bangalore Connect',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong! Please try again later.' : err.message,
    contactEmail: "bangalore.connect1@gmail.com",
    error: process.env.NODE_ENV === 'production' ? null : err,
    canonicalUrl: baseUrl
  });
});

// ==================== CREATE REQUIRED SEO FILES ====================

// Create required files for SEO
function createSEOFiles() {
  const publicDir = path.join(__dirname, 'public');
  
  // Create robots.txt if doesn't exist
  const robotsPath = path.join(publicDir, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    const robotsContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /post-job
Disallow: /delete-job/

Sitemap: https://bangalorconnect.online/sitemap.xml`;
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('📝 Created robots.txt');
  }
  
  // Create favicon placeholder
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    // Create a simple favicon (you should replace with real one)
    fs.writeFileSync(faviconPath, '');
    console.log('🎨 Created favicon.ico placeholder');
  }
}

// ==================== SERVER START ====================

// Create SEO files on startup
createSEOFiles();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🗺️  Sitemap: http://localhost:${PORT}/sitemap.xml`);
  console.log(`🤖 Robots: http://localhost:${PORT}/robots.txt`);
  console.log(`📊 Total jobs loaded: ${jobs.length}`);
  console.log(`💾 Data file: ${DATA_FILE}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log admin credentials in development only
  if (process.env.NODE_ENV !== 'production') {
    console.log(`👤 Admin username: ${ADMIN_USER}`);
    console.log(`🔑 Admin password: ${ADMIN_PASS}`);
  }
  
  // SEO Status
  console.log(`🔍 SEO Status: Enabled`);
  console.log(`🌍 Sitemap: Ready (${jobs.length} job URLs)`);
  console.log(`📈 Structured Data: Enabled for all jobs`);
});