// Enhanced JavaScript for Bangalore Connect

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = e.target.getAttribute('data-tooltip');
    if (!tooltip) return;
    
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    tooltipEl.textContent = tooltip;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.background = '#1e293b';
    tooltipEl.style.color = 'white';
    tooltipEl.style.padding = '6px 12px';
    tooltipEl.style.borderRadius = '4px';
    tooltipEl.style.fontSize = '12px';
    tooltipEl.style.zIndex = '1000';
    tooltipEl.style.whiteSpace = 'nowrap';
    
    const rect = e.target.getBoundingClientRect();
    tooltipEl.style.left = rect.left + rect.width / 2 + 'px';
    tooltipEl.style.top = rect.top - 10 + 'px';
    tooltipEl.style.transform = 'translate(-50%, -100%)';
    
    document.body.appendChild(tooltipEl);
    e.target._tooltip = tooltipEl;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        delete e.target._tooltip;
    }
}

// Copy job link to clipboard
function copyJobLink(jobId) {
    const url = `${window.location.origin}/job/${jobId}`;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('✓ Job link copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy link', 'error');
        console.error('Copy failed:', err);
    });
}

// Share job on WhatsApp
function shareOnWhatsApp(jobTitle, company, salary, location) {
    const text = `Check this job: ${jobTitle} at ${company}\nSalary: ₹${salary}/month\nLocation: ${location}\n\nView details: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Form validation
function validateJobForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Auto-resize textareas
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initTooltips();
    
    // Auto-resize textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        autoResizeTextarea(textarea);
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateJobForm(this)) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Add active class to current page link
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Initialize job card hover effects
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize filter form
    const filterForm = document.querySelector('form[action="/"]');
    if (filterForm) {
        const filterSelects = filterForm.querySelectorAll('select');
        filterSelects.forEach(select => {
            select.addEventListener('change', function() {
                filterForm.submit();
            });
        });
    }
    
    // Add loading animation to buttons on click
    const buttons = document.querySelectorAll('.btn[type="submit"], .filter-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.querySelector('.fa-spinner')) {
                const originalHTML = this.innerHTML;
                this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${originalHTML}`;
                this.disabled = true;
                
                // Revert after 3 seconds if still disabled
                setTimeout(() => {
                    if (this.disabled) {
                        this.innerHTML = originalHTML;
                        this.disabled = false;
                    }
                }, 3000);
            }
        });
    });
});

// Export data function
function exportJobs() {
    const data = {
        exportDate: new Date().toISOString(),
        jobCount: document.querySelectorAll('.job-card').length,
        pageInfo: {
            url: window.location.href,
            title: document.title
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add this CSS for better mobile experience
if (!document.querySelector('#mobile-styles')) {
    const mobileStyle = document.createElement('style');
    mobileStyle.id = 'mobile-styles';
    mobileStyle.textContent = `
        @media (max-width: 768px) {
            .job-card {
                margin: 0 10px;
            }
            
            .search-box {
                flex-direction: column;
            }
            
            .search-btn {
                width: 100%;
                margin-top: 10px;
            }
            
            .header-actions {
                flex-wrap: wrap;
                justify-content: center;
            }
        }
        
        @media (max-width: 480px) {
            .job-title {
                font-size: 16px;
            }
            
            .job-meta {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .meta-tag {
                width: 100%;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(mobileStyle);
}

// Add scroll to top button
function addScrollToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.id = 'scrollToTopBtn';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 18px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        display: none;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });
}

// Initialize scroll to top button
if (window.innerHeight < document.body.scrollHeight) {
    addScrollToTopButton();
}