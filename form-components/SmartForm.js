// Smart Form Component with Progressive Disclosure and Intelligent Defaults
class SmartForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoSave: true,
      progressiveDisclosure: true,
      smartDefaults: true,
      realTimeValidation: true,
      ...options
    };
    
    this.formData = {};
    this.validationRules = {};
    this.fieldGroups = [];
    this.currentStep = 0;
    
    this.init();
  }

  init() {
    this.createFormStructure();
    this.setupEventListeners();
    this.loadSmartDefaults();
    if (this.options.autoSave) {
      this.setupAutoSave();
    }
  }

  createFormStructure() {
    this.container.innerHTML = `
      <div class="smart-form">
        <div class="form-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span class="progress-text">Step 1 of 3</span>
        </div>
        
        <form class="form-content" novalidate>
          <!-- Essential Information (Always Visible) -->
          <fieldset class="form-group active" data-group="essential">
            <legend>Essential Information</legend>
            
            <div class="field-row">
              <div class="form-field">
                <label for="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  autocomplete="email"
                  data-validate="email"
                  placeholder="your@email.com"
                >
                <span class="field-hint">We'll use this to contact you</span>
                <div class="validation-message"></div>
              </div>
            </div>

            <div class="field-row">
              <div class="form-field half">
                <label for="firstName">First Name *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  required 
                  autocomplete="given-name"
                  data-validate="name"
                >
                <div class="validation-message"></div>
              </div>
              
              <div class="form-field half">
                <label for="lastName">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  required 
                  autocomplete="family-name"
                  data-validate="name"
                >
                <div class="validation-message"></div>
              </div>
            </div>

            <div class="field-row">
              <div class="form-field">
                <label for="company">Company</label>
                <input 
                  type="text" 
                  id="company" 
                  name="company" 
                  autocomplete="organization"
                  placeholder="Optional"
                >
                <div class="validation-message"></div>
              </div>
            </div>
          </fieldset>

          <!-- Trading Preferences (Progressive Disclosure) -->
          <fieldset class="form-group" data-group="preferences">
            <legend>Trading Preferences</legend>
            
            <div class="field-row">
              <div class="form-field">
                <label for="experience">Trading Experience *</label>
                <select id="experience" name="experience" required data-validate="required">
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-5 years)</option>
                  <option value="advanced">Advanced (5+ years)</option>
                  <option value="professional">Professional Trader</option>
                </select>
                <div class="validation-message"></div>
              </div>
            </div>

            <div class="conditional-field" data-show-when="experience:beginner,intermediate">
              <div class="field-row">
                <div class="form-field">
                  <label for="interests">Areas of Interest</label>
                  <div class="checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" name="interests" value="stocks">
                      <span class="checkmark"></span>
                      Stock Trading
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" name="interests" value="forex">
                      <span class="checkmark"></span>
                      Forex
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" name="interests" value="crypto">
                      <span class="checkmark"></span>
                      Cryptocurrency
                    </label>
                    <label class="checkbox-label">
                      <input type="checkbox" name="interests" value="options">
                      <span class="checkmark"></span>
                      Options Trading
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="conditional-field" data-show-when="experience:advanced,professional">
              <div class="field-row">
                <div class="form-field">
                  <label for="strategies">Preferred Strategies</label>
                  <textarea 
                    id="strategies" 
                    name="strategies" 
                    rows="3"
                    placeholder="Describe your preferred trading strategies..."
                  ></textarea>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Additional Details (Optional) -->
          <fieldset class="form-group" data-group="additional">
            <legend>Additional Information <span class="optional-badge">Optional</span></legend>
            
            <div class="field-row">
              <div class="form-field half">
                <label for="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  autocomplete="tel"
                  data-validate="phone"
                  placeholder="+1 (555) 123-4567"
                >
                <span class="field-hint">For important account updates only</span>
                <div class="validation-message"></div>
              </div>
              
              <div class="form-field half">
                <label for="timezone">Timezone</label>
                <select id="timezone" name="timezone">
                  <option value="">Auto-detect</option>
                  <!-- Timezone options will be populated by JavaScript -->
                </select>
              </div>
            </div>

            <div class="field-row">
              <div class="form-field">
                <label for="referral">How did you hear about us?</label>
                <select id="referral" name="referral">
                  <option value="">Select an option</option>
                  <option value="search">Search Engine</option>
                  <option value="social">Social Media</option>
                  <option value="friend">Friend/Colleague</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div class="conditional-field" data-show-when="referral:other">
              <div class="field-row">
                <div class="form-field">
                  <label for="referralOther">Please specify</label>
                  <input type="text" id="referralOther" name="referralOther">
                </div>
              </div>
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="prevStep" style="display: none;">
              Previous
            </button>
            <button type="button" class="btn btn-primary" id="nextStep">
              Next Step
            </button>
            <button type="submit" class="btn btn-primary" id="submitForm" style="display: none;">
              Complete Registration
            </button>
          </div>
        </form>

        <div class="form-help">
          <button type="button" class="help-toggle">
            <i class="ri-question-line"></i>
            Need Help?
          </button>
          <div class="help-content">
            <p>Having trouble? Here are some tips:</p>
            <ul>
              <li>All required fields are marked with *</li>
              <li>Your information is automatically saved as you type</li>
              <li>You can always go back to previous steps</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const form = this.container.querySelector('.form-content');
    const nextBtn = this.container.querySelector('#nextStep');
    const prevBtn = this.container.querySelector('#prevStep');
    const submitBtn = this.container.querySelector('#submitForm');
    const helpToggle = this.container.querySelector('.help-toggle');

    // Real-time validation
    form.addEventListener('input', this.handleInput.bind(this));
    form.addEventListener('blur', this.handleBlur.bind(this), true);
    form.addEventListener('change', this.handleChange.bind(this));

    // Navigation
    nextBtn.addEventListener('click', this.nextStep.bind(this));
    prevBtn.addEventListener('click', this.prevStep.bind(this));
    submitBtn.addEventListener('click', this.submitForm.bind(this));

    // Help toggle
    helpToggle.addEventListener('click', this.toggleHelp.bind(this));

    // Progressive disclosure
    this.setupConditionalFields();
  }

  loadSmartDefaults() {
    if (!this.options.smartDefaults) return;

    // Auto-detect timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneSelect = this.container.querySelector('#timezone');
    this.populateTimezones(timezoneSelect, timezone);

    // Load saved data from localStorage
    const savedData = localStorage.getItem('smartForm_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.populateForm(data);
      } catch (e) {
        console.warn('Could not load saved form data:', e);
      }
    }

    // Smart email suggestions based on common domains
    this.setupEmailSuggestions();
  }

  populateTimezones(select, defaultTimezone) {
    const commonTimezones = [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney'
    ];

    commonTimezones.forEach(tz => {
      const option = document.createElement('option');
      option.value = tz;
      option.textContent = tz.replace('_', ' ').replace('/', ' - ');
      if (tz === defaultTimezone) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  setupEmailSuggestions() {
    const emailInput = this.container.querySelector('#email');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'email-suggestions';
    emailInput.parentNode.appendChild(suggestionsContainer);

    emailInput.addEventListener('input', (e) => {
      const value = e.target.value;
      const atIndex = value.indexOf('@');
      
      if (atIndex > 0 && atIndex === value.length - 1) {
        // User just typed @, show domain suggestions
        this.showEmailSuggestions(value, suggestionsContainer);
      } else {
        suggestionsContainer.style.display = 'none';
      }
    });
  }

  showEmailSuggestions(emailPrefix, container) {
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    
    container.innerHTML = commonDomains.map(domain => 
      `<button type="button" class="email-suggestion" data-email="${emailPrefix}${domain}">
        ${emailPrefix}${domain}
      </button>`
    ).join('');
    
    container.style.display = 'block';
    
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('email-suggestion')) {
        const emailInput = this.container.querySelector('#email');
        emailInput.value = e.target.dataset.email;
        container.style.display = 'none';
        emailInput.focus();
      }
    });
  }

  setupConditionalFields() {
    const conditionalFields = this.container.querySelectorAll('.conditional-field');
    
    conditionalFields.forEach(field => {
      const condition = field.dataset.showWhen;
      const [fieldName, values] = condition.split(':');
      const triggerField = this.container.querySelector(`[name="${fieldName}"]`);
      
      if (triggerField) {
        triggerField.addEventListener('change', () => {
          const shouldShow = values.split(',').includes(triggerField.value);
          field.style.display = shouldShow ? 'block' : 'none';
          
          if (!shouldShow) {
            // Clear values in hidden fields
            const inputs = field.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
              if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
              } else {
                input.value = '';
              }
            });
          }
        });
      }
    });
  }

  handleInput(e) {
    const field = e.target;
    if (field.matches('input, select, textarea')) {
      this.updateFormData(field.name, field.value);
      
      if (this.options.realTimeValidation) {
        // Debounced validation for better UX
        clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(() => {
          this.validateField(field);
        }, 300);
      }
    }
  }

  handleBlur(e) {
    const field = e.target;
    if (field.matches('input, select, textarea')) {
      this.validateField(field);
    }
  }

  handleChange(e) {
    const field = e.target;
    if (field.matches('input[type="checkbox"], input[type="radio"], select')) {
      this.updateFormData(field.name, this.getFieldValue(field));
      this.validateField(field);
    }
  }

  getFieldValue(field) {
    if (field.type === 'checkbox') {
      const checkboxes = this.container.querySelectorAll(`[name="${field.name}"]:checked`);
      return Array.from(checkboxes).map(cb => cb.value);
    } else if (field.type === 'radio') {
      const checked = this.container.querySelector(`[name="${field.name}"]:checked`);
      return checked ? checked.value : '';
    }
    return field.value;
  }

  validateField(field) {
    const validationType = field.dataset.validate;
    const value = this.getFieldValue(field);
    const isRequired = field.hasAttribute('required');
    
    let isValid = true;
    let message = '';

    // Required field validation
    if (isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
      isValid = false;
      message = 'This field is required';
    }
    // Type-specific validation
    else if (value && validationType) {
      const validation = this.getValidationRule(validationType);
      if (!validation.test(value)) {
        isValid = false;
        message = validation.message;
      }
    }

    this.updateFieldValidation(field, isValid, message);
    return isValid;
  }

  getValidationRule(type) {
    const rules = {
      email: {
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
      },
      phone: {
        test: (value) => /^[\+]?[\d\s\-\(\)]{10,}$/.test(value),
        message: 'Please enter a valid phone number'
      },
      name: {
        test: (value) => value.length >= 2 && /^[a-zA-Z\s\-\'\.]+$/.test(value),
        message: 'Name must be at least 2 characters and contain only letters'
      },
      required: {
        test: (value) => value && value.length > 0,
        message: 'This field is required'
      }
    };
    
    return rules[type] || { test: () => true, message: '' };
  }

  updateFieldValidation(field, isValid, message) {
    const fieldContainer = field.closest('.form-field');
    const messageElement = fieldContainer.querySelector('.validation-message');
    
    fieldContainer.classList.toggle('field-error', !isValid);
    fieldContainer.classList.toggle('field-valid', isValid && field.value);
    
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = message ? 'block' : 'none';
    }
  }

  updateFormData(name, value) {
    this.formData[name] = value;
    
    if (this.options.autoSave) {
      localStorage.setItem('smartForm_data', JSON.stringify(this.formData));
    }
  }

  nextStep() {
    const currentGroup = this.container.querySelector('.form-group.active');
    const requiredFields = currentGroup.querySelectorAll('[required]');
    
    let allValid = true;
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        allValid = false;
      }
    });

    if (!allValid) {
      this.showValidationSummary(currentGroup);
      return;
    }

    const nextGroup = currentGroup.nextElementSibling;
    if (nextGroup && nextGroup.classList.contains('form-group')) {
      this.showStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  showStep(stepIndex) {
    const groups = this.container.querySelectorAll('.form-group');
    
    groups.forEach((group, index) => {
      group.classList.toggle('active', index === stepIndex);
    });

    this.currentStep = stepIndex;
    this.updateProgress();
    this.updateNavigation();
  }

  updateProgress() {
    const totalSteps = this.container.querySelectorAll('.form-group').length;
    const progress = ((this.currentStep + 1) / totalSteps) * 100;
    
    const progressFill = this.container.querySelector('.progress-fill');
    const progressText = this.container.querySelector('.progress-text');
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Step ${this.currentStep + 1} of ${totalSteps}`;
  }

  updateNavigation() {
    const prevBtn = this.container.querySelector('#prevStep');
    const nextBtn = this.container.querySelector('#nextStep');
    const submitBtn = this.container.querySelector('#submitForm');
    const totalSteps = this.container.querySelectorAll('.form-group').length;

    prevBtn.style.display = this.currentStep > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = this.currentStep < totalSteps - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = this.currentStep === totalSteps - 1 ? 'inline-block' : 'none';
  }

  showValidationSummary(group) {
    const errors = group.querySelectorAll('.field-error');
    if (errors.length > 0) {
      const firstError = errors[0].querySelector('input, select, textarea');
      firstError.focus();
      
      // Show a gentle notification
      this.showNotification('Please complete all required fields before continuing', 'warning');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button type="button" class="notification-close">&times;</button>
    `;
    
    this.container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove();
    });

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  toggleHelp() {
    const helpContent = this.container.querySelector('.help-content');
    helpContent.style.display = helpContent.style.display === 'block' ? 'none' : 'block';
  }

  populateForm(data) {
    Object.keys(data).forEach(key => {
      const field = this.container.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'checkbox') {
          const values = Array.isArray(data[key]) ? data[key] : [data[key]];
          const checkboxes = this.container.querySelectorAll(`[name="${key}"]`);
          checkboxes.forEach(cb => {
            cb.checked = values.includes(cb.value);
          });
        } else {
          field.value = data[key];
        }
      }
    });
  }

  async submitForm(e) {
    e.preventDefault();
    
    // Final validation
    const allFields = this.container.querySelectorAll('[required]');
    let allValid = true;
    
    allFields.forEach(field => {
      if (!this.validateField(field)) {
        allValid = false;
      }
    });

    if (!allValid) {
      this.showNotification('Please correct the errors before submitting', 'error');
      return;
    }

    // Show loading state
    const submitBtn = this.container.querySelector('#submitForm');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showNotification('Registration completed successfully!', 'success');
      
      // Clear saved data
      localStorage.removeItem('smartForm_data');
      
      // Redirect or show success state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      this.showNotification('Something went wrong. Please try again.', 'error');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
      if (Object.keys(this.formData).length > 0) {
        localStorage.setItem('smartForm_data', JSON.stringify(this.formData));
      }
    }, 30000);
  }
}

// Export for use
window.SmartForm = SmartForm;