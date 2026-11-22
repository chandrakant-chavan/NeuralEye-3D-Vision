/**
 * NeuralEye Security & Auth Service (Layers 1-6)
 */

const TOKEN_KEY = 'neuraleye_operator_token';
const DEFAULT_HARDWARE_KEY = 'NE-SEC-OP-2026-X99';

export const SecurityService = {
  // Retrieve current operator token
  getToken: () => {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
  },

  // Save authenticated operator session
  setToken: (token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  // Check if session is authenticated
  isAuthenticated: () => {
    const token = SecurityService.getToken();
    return Boolean(token && token.length > 20);
  },

  // Clear operator session
  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  // Build standard authenticated headers for backend requests
  getSecureHeaders: () => {
    const token = SecurityService.getToken();
    const headers = {
      'X-API-Key': DEFAULT_HARDWARE_KEY,
      'X-NeuralEye-Internal-Demo': 'true',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Layer 2 & 3: Client-side Pre-upload Sanitization & Size Guard
  validateImageFile: (file) => {
    if (!file) return { valid: false, error: 'No file provided.' };

    // 1. Max 5MB Check
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `Security Alert: File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds strict 5MB safety limit.`
      };
    }

    // 2. MIME type verification
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: 'Security Alert: Unsupported format. Only verified JPEG, PNG, and WebP images are permitted.'
      };
    }

    return { valid: true };
  }
};

export default SecurityService;
