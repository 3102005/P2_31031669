// Contact Form Handling

// Helper functions
function setLoadingState(loading) {
  const submitBtn = document.getElementById('submitBtn');
  if (!submitBtn) return;
  
  const spinner = submitBtn.querySelector('.loading-spinner');
  const text = submitBtn.querySelector('span');
  const icon = submitBtn.querySelector('i:not(.fa-spinner)');
  
  if (loading) {
    submitBtn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    if (text) text.textContent = 'Enviando...';
    if (icon) icon.style.display = 'none';
  } else {
    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (text) text.textContent = 'Enviar mensaje';
    if (icon) icon.style.display = 'inline-block';
  }
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  document.querySelectorAll('.form-group').forEach(el => {
    el.classList.remove('error');
  });
  const responseMessage = document.getElementById('responseMessage');
  if (responseMessage) {
    responseMessage.style.display = 'none';
  }
}

function showFieldError(fieldName, message) {
  const errorElement = document.getElementById(fieldName + '-error');
  const formGroup = document.querySelector(`[name="${fieldName}"]`)?.closest('.form-group');
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  
  if (formGroup) {
    formGroup.classList.add('error');
  }
}

function showSuccessMessage(message) {
  const responseMessage = document.getElementById('responseMessage');
  if (responseMessage) {
    responseMessage.className = 'response-message success';
    responseMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    responseMessage.style.display = 'block';
    responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function showErrorMessage(message) {
  const responseMessage = document.getElementById('responseMessage');
  if (responseMessage) {
    responseMessage.className = 'response-message error';
    responseMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    responseMessage.style.display = 'block';
    responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Initialize contact form
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Clear previous errors
      clearErrors();
      
      // Show loading state
      setLoadingState(true);
      
      try {
        // Get form data
        const formData = new FormData(contactForm);
        
        // Add reCAPTCHA token if available
        const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
        formData.append('recaptcha', recaptchaResponse);
        
        // Convert FormData to JSON
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });
        
        // Send request
        const response = await fetch('/contact/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
          showSuccessMessage(result.message);
          contactForm.reset();
          
          // Reset reCAPTCHA
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
          }
          
          // Google Analytics tracking
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
              'event_category': 'Contact',
              'event_label': 'Contact Form Success',
              'custom_parameter_1': result.data?.pais || 'Unknown'
            });
          }
        } else {
          showErrorMessage(result.message);
          
          // Show field-specific errors
          if (result.errors) {
            result.errors.forEach(error => {
              showFieldError(error.path || error.param, error.msg);
            });
          }
          
          // Google Analytics tracking
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_error', {
              'event_category': 'Contact',
              'event_label': 'Contact Form Error'
            });
          }
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        showErrorMessage('Error de conexión. Por favor, intenta nuevamente.');
        
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_error', {
            'event_category': 'Contact',
            'event_label': 'Network Error'
          });
        }
      } finally {
        setLoadingState(false);
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initContactForm);
