// Advanced Form Validation with Smart Error Handling
class FormValidator {
  constructor() {
    this.rules = new Map();
    this.customMessages = new Map();
    this.setupDefaultRules();
  }

  setupDefaultRules() {
    // Email validation with smart suggestions
    this.addRule('email', {
      test: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Please enter a valid email address',
      suggestions: (value) => {
        const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const atIndex = value.indexOf('@');
        
        if (atIndex > 0) {
          const username = value.substring(0, atIndex);
          const domain = value.substring(atIndex + 1);
          
          // Suggest corrections for common typos
          const domainSuggestions = commonDomains.filter(d => 
            d.includes(domain) || this.levenshteinDistance(domain, d) <= 2
          );
          
          if (domainSuggestions.length > 0) {
            return `Did you mean ${username}@${domainSuggestions[0]}?`;
          }
        }
        return null;
      }
    });

    // Phone validation with formatting
    this.addRule('phone', {
      test: (value) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length >= 10;
      },
      message: 'Please enter a valid phone number',
      format: (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 10) {
          return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
          return `+1 (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
        }
        return value;
      }
    });

    // Name validation
    this.addRule('name', {
      test: (value) => {
        return value.length >= 2 && /^[a-zA-Z\s\-\'\.]+$/.test(value);
      },
      message: 'Name must be at least 2 characters and contain only letters',
      format: (value) => {
        // Capitalize first letter of each word
        return value.replace(/\b\w/g, l => l.toUpperCase());
      }
    });

    // Password strength validation
    this.addRule('password', {
      test: (value) => {
        const hasLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        return hasLength && hasUpper && hasLower && hasNumber;
      },
      message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
      strength: (value) => {
        let score = 0;
        const checks = [
          value.length >= 8,
          /[A-Z]/.test(value),
          /[a-z]/.test(value),
          /\d/.test(value),
          /[!@#$%^&*(),.?":{}|<>]/.test(value),
          value.length >= 12
        ];
        
        score = checks.filter(Boolean).length;
        
        if (score <= 2) return { level: 'weak', color: '#ef4444' };
        if (score <= 4) return { level: 'medium', color: '#f59e0b' };
        return { level: 'strong', color: '#10b981' };
      }
    });

    // Required field validation
    this.addRule('required', {
      test: (value) => {
        if (Array.isArray(value)) return value.length > 0;
        return value && value.toString().trim().length > 0;
      },
      message: 'This field is required'
    });
  }

  addRule(name, rule) {
    this.rules.set(name, rule);
  }

  addCustomMessage(fieldName, message) {
    this.customMessages.set(fieldName, message);
  }

  validate(field, value = null) {
    const fieldValue = value !== null ? value : this.getFieldValue(field);
    const validationType = field.dataset.validate;
    const isRequired = field.hasAttribute('required');
    const fieldName = field.name;

    const result = {
      isValid: true,
      message: '',
      suggestion: null,
      formatted: fieldValue
    };

    // Check required first
    if (isRequired && this.rules.has('required')) {
      const requiredRule = this.rules.get('required');
      if (!requiredRule.test(fieldValue)) {
        result.isValid = false;
        result.message = this.customMessages.get(fieldName) || requiredRule.message;
        return result;
      }
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
      return result;
    }

    // Apply specific validation rule
    if (validationType && this.rules.has(validationType)) {
      const rule = this.rules.get(validationType);
      
      if (!rule.test(fieldValue)) {
        result.isValid = false;
        result.message = this.customMessages.get(fieldName) || rule.message;
        
        // Add suggestion if available
        if (rule.suggestions) {
          result.suggestion = rule.suggestions(fieldValue);
        }
      } else {
        // Format the value if formatter is available
        if (rule.format) {
          result.formatted = rule.format(fieldValue);
        }
      }
    }

    return result;
  }

  getFieldValue(field) {
    if (field.type === 'checkbox') {
      const form = field.closest('form');
      const checkboxes = form.querySelectorAll(`[name="${field.name}"]:checked`);
      return Array.from(checkboxes).map(cb => cb.value);
    } else if (field.type === 'radio') {
      const form = field.closest('form');
      const checked = form.querySelector(`[name="${field.name}"]:checked`);
      return checked ? checked.value : '';
    }
    return field.value;
  }

  // Utility function for email suggestions
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Validate entire form
  validateForm(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    const results = [];
    let isFormValid = true;

    fields.forEach(field => {
      const result = this.validate(field);
      results.push({ field, result });
      
      if (!result.isValid) {
        isFormValid = false;
      }
    });

    return {
      isValid: isFormValid,
      results: results,
      firstError: results.find(r => !r.result.isValid)
    };
  }
}

// Export for use
window.FormValidator = FormValidator;