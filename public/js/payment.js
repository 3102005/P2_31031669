// Payment Modal and Form Handling

// Modal Functions
function openPaymentModal(serviceName, servicePrice) {
  const modal = document.getElementById('paymentModal');
  const serviceNameSpan = document.getElementById('modalServiceName');
  const serviceAmountSpan = document.getElementById('modalServiceAmount');
  const serviceInput = document.getElementById('modalService');
  const amountInput = document.getElementById('modalAmount');
  
  if (!modal) return;
  
  // Get current language from HTML lang attribute
  const currentLang = document.documentElement.lang || 'es';
  
  // Format currency based on language
  let formattedAmount;
  if (currentLang === 'es') {
    // Spanish (Venezuela): VES 1.500,00 Bs
    formattedAmount = `VES ${servicePrice.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs`;
  } else {
    // English (US): USD $15.00
    formattedAmount = `USD $${servicePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Set service information
  if (serviceNameSpan) serviceNameSpan.textContent = serviceName;
  if (serviceAmountSpan) serviceAmountSpan.textContent = formattedAmount;
  if (serviceInput) serviceInput.value = serviceName;
  if (amountInput) amountInput.value = servicePrice;
  
  // Clear form
  const modalPaymentForm = document.getElementById('modalPaymentForm');
  if (modalPaymentForm) {
    modalPaymentForm.reset();
    if (serviceInput) serviceInput.value = serviceName;
    if (amountInput) amountInput.value = servicePrice;
  }
  
  // Clear any previous responses
  const responseDiv = document.getElementById('modalPaymentResponse');
  if (responseDiv) {
    responseDiv.style.display = 'none';
  }
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Focus on first input
  setTimeout(() => {
    const emailInput = document.getElementById('modalEmail');
    if (emailInput) emailInput.focus();
  }, 300);
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function showModalPaymentResponse(type, message) {
  if (type === 'success') {
    showAppleStyleSuccessAnimation(message);
  } else {
    showErrorResponse(message);
  }
}

function showAppleStyleSuccessAnimation(message) {
  // Create overlay for success animation
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  // Create success card
  const successCard = document.createElement('div');
  successCard.style.cssText = `
    background: white;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    max-width: 400px;
    transform: scale(0.8);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;
  
  // Create animated checkmark
  const checkmark = document.createElement('div');
  checkmark.style.cssText = `
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0);
    animation: checkmarkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards;
  `;
  
  checkmark.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" 
            style="stroke-dasharray: 20; stroke-dashoffset: 20; animation: checkmarkDraw 0.5s ease-out 0.5s forwards;"/>
    </svg>
  `;
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = window.translations?.modal?.paymentSuccess || '¡Pago Exitoso!';
  title.style.cssText = `
    margin: 0 0 10px;
    color: #333;
    font-size: 24px;
    font-weight: 600;
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 0.7s forwards;
  `;
  
  // Create message
  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  messageEl.style.cssText = `
    margin: 0;
    color: #666;
    font-size: 16px;
    opacity: 0;
    animation: fadeInUp 0.5s ease-out 0.9s forwards;
  `;
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes checkmarkPop {
      to { transform: scale(1); }
    }
    @keyframes checkmarkDraw {
      to { stroke-dashoffset: 0; }
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  
  document.head.appendChild(style);
  
  // Assemble the card
  successCard.appendChild(checkmark);
  successCard.appendChild(title);
  successCard.appendChild(messageEl);
  overlay.appendChild(successCard);
  document.body.appendChild(overlay);
  
  // Animate in
  setTimeout(() => {
    overlay.style.opacity = '1';
    successCard.style.transform = 'scale(1)';
  }, 10);
  
  // Auto close after 3 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    successCard.style.transform = 'scale(0.8)';
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    }, 300);
  }, 3000);
}

function showErrorResponse(message) {
  const responseDiv = document.getElementById('modalPaymentResponse');
  if (responseDiv) {
    responseDiv.className = 'p-4 rounded-lg bg-red-100 text-red-800';
    responseDiv.innerHTML = `<div class="flex items-center space-x-2"><i class="fas fa-exclamation-circle"></i><span>${message}</span></div>`;
    responseDiv.style.display = 'block';
    responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function showLoadingAnimation() {
  // Remove any existing loading overlay
  hideLoadingAnimation();
  
  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.id = 'paymentLoadingOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  // Create loading card
  const loadingCard = document.createElement('div');
  loadingCard.style.cssText = `
    background: white;
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    max-width: 300px;
    transform: scale(0.8);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  // Create message
  const message = document.createElement('p');
  message.textContent = window.translations?.modal?.processingPayment || 'Procesando pago...';
  message.style.cssText = `
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 500;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.id = 'loadingAnimationStyle';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  
  // Assemble the card
  loadingCard.appendChild(spinner);
  loadingCard.appendChild(message);
  overlay.appendChild(loadingCard);
  document.body.appendChild(overlay);
  
  // Animate in
  setTimeout(() => {
    overlay.style.opacity = '1';
    loadingCard.style.transform = 'scale(1)';
  }, 10);
}

function hideLoadingAnimation() {
  const overlay = document.getElementById('paymentLoadingOverlay');
  const style = document.getElementById('loadingAnimationStyle');
  
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }
  
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
}

// Input formatting and validation
function initPaymentInputs() {
  // Format card number input
  const cardNumberInput = document.getElementById('modalCardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      if (formattedValue !== e.target.value) {
        e.target.value = formattedValue;
      }
    });
  }
  
  // CVV validation
  const cvvInput = document.getElementById('modalCvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    });
  }
  
  // Populate expiration years
  const modalExpirationYear = document.getElementById('modalExpirationYear');
  if (modalExpirationYear) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      const option = document.createElement('option');
      option.value = currentYear + i;
      option.textContent = currentYear + i;
      modalExpirationYear.appendChild(option);
    }
  }
}

// Fill test data functionality
function initTestDataButton() {
  const fillTestDataBtn = document.getElementById('fillTestDataBtn');
  if (fillTestDataBtn) {
    fillTestDataBtn.addEventListener('click', function() {
      const testDataInfo = document.getElementById('testDataInfo');
      if (!testDataInfo) return;
      
      const isVisible = testDataInfo.style.display !== 'none';
      
      if (!isVisible) {
        // Show test data info
        testDataInfo.style.display = 'block';
        this.innerHTML = `<i class="fas fa-times"></i><span>${window.translations?.modal?.hideTestData || 'Ocultar Datos de Prueba'}</span>`;
        
        // Fill form with test data (using Visa card)
        const modalEmail = document.getElementById('modalEmail');
        const modalCardHolderName = document.getElementById('modalCardHolderName');
        const modalCardNumber = document.getElementById('modalCardNumber');
        const modalExpirationMonth = document.getElementById('modalExpirationMonth');
        const modalExpirationYear = document.getElementById('modalExpirationYear');
        const modalCvv = document.getElementById('modalCvv');
        const modalCurrency = document.getElementById('modalCurrency');
        
        if (modalEmail) modalEmail.value = 'test@patitasmoviles.com';
        if (modalCardHolderName) modalCardHolderName.value = 'APPROVED';
        if (modalCardNumber) modalCardNumber.value = '4111 1111 1111 1111';
        if (modalExpirationMonth) modalExpirationMonth.value = '12';
        if (modalExpirationYear) modalExpirationYear.value = '2025';
        if (modalCvv) modalCvv.value = '123';
        if (modalCurrency) modalCurrency.value = 'USD';
      } else {
        // Hide test data info
        testDataInfo.style.display = 'none';
        this.innerHTML = `<i class="fas fa-flask"></i><span>${window.translations?.modal?.fillTestData || 'Rellenar con Datos de Prueba'}</span>`;
      }
    });
  }
}

// Payment form submission
function initPaymentForm() {
  const modalPaymentForm = document.getElementById('modalPaymentForm');
  if (!modalPaymentForm) return;
  
  modalPaymentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const modalPaymentSubmitBtn = document.getElementById('modalPaymentSubmitBtn');
    if (!modalPaymentSubmitBtn) return;
    
    const btnContent = modalPaymentSubmitBtn.querySelector('.btn-content');
    const loadingSpinner = modalPaymentSubmitBtn.querySelector('.loading-spinner');
    
    // Show enhanced loading state
    showLoadingAnimation();
    if (btnContent) btnContent.style.display = 'none';
    if (loadingSpinner) {
      loadingSpinner.style.display = 'flex';
      loadingSpinner.classList.remove('hidden');
    }
    modalPaymentSubmitBtn.disabled = true;
    
    try {
      // Get form data
      const formData = new FormData(modalPaymentForm);
      
      // Convert FormData to JSON
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      // Send request
      const response = await fetch('/payment/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Track successful payment in Google Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'purchase', {
            'transaction_id': result.data?.transactionId || 'unknown',
            'value': parseFloat(data.amount) || 0,
            'currency': data.currency || 'USD',
            'event_category': 'Payment',
            'event_label': data.service || 'Unknown Service'
          });
        }
        
        showModalPaymentResponse('success', result.message || window.translations?.modal?.paymentProcessedSuccessfully || 'Pago procesado exitosamente');
        
        // Close modal after 3 seconds
        setTimeout(() => {
          closePaymentModal();
        }, 3000);
      } else {
        // Track payment error in Google Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'payment_error', {
            'event_category': 'Payment',
            'event_label': 'API Error'
          });
        }
        
        showModalPaymentResponse('error', result.message || window.translations?.modal?.paymentProcessingError || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Track payment error in Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'payment_error', {
          'event_category': 'Payment',
          'event_label': 'Network Error'
        });
      }
      
      showModalPaymentResponse('error', window.translations?.modal?.connectionError || 'Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      // Hide loading state
      hideLoadingAnimation();
      if (btnContent) btnContent.style.display = 'flex';
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
        loadingSpinner.classList.add('hidden');
      }
      modalPaymentSubmitBtn.disabled = false;
    }
  });
}

// Event listeners for modal
function initModalEventListeners() {
  // Close modal when clicking overlay
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      closePaymentModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closePaymentModal();
    }
  });
  
  // Close button
  const modalCloseBtn = document.querySelector('.modal-close');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closePaymentModal);
  }
}

// Initialize all payment functionality
function initPaymentModule() {
  initPaymentInputs();
  initTestDataButton();
  initPaymentForm();
  initModalEventListeners();
}

// Make functions globally available
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPaymentModule);
