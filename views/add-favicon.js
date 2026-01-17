const fs = require('fs');
const path = require('path');

// List all EJS files
const ejsFiles = [
    'views/home.ejs',
    'views/job.ejs',
    'views/dashboard.ejs',
    'views/admin-login.ejs',
    'views/post-job.ejs',
    'views/resume-builder.ejs',
    'views/interview-prep.ejs',
    'views/companies.ejs',
    'views/career-guide.ejs',
    'views/blog.ejs',
    'views/ai-resources.ejs',
    'views/multilingual.ejs',
    'views/terms.ejs',
    'views/privacy.ejs'
];

// Favicon HTML to add
const faviconHTML = '\n    <!-- Favicon -->\n    <link rel="icon" href="/favicon.ico" type="image/x-icon">\n    ';

ejsFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if favicon already exists
        if (!content.includes('favicon')) {
            // Add favicon after <title> tag
            content = content.replace(
                /(<title>.*?<\/title>)/,
                `$1${faviconHTML}`
            );
            
            fs.writeFileSync(filePath, content);
            console.log(`✓ Updated: ${filePath}`);
        } else {
            console.log(`✓ Already has favicon: ${filePath}`);
        }
    }
});

console.log('\n✅ All EJS files updated with favicon!');