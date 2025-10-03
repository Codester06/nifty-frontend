const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export interface LoginRequest {
  mobile?: string;
  email?: string;
  password: string;
}

export interface SignupRequest {
  mobile: string;
  email: string;
  password: string;
  pan: string;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export class AuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  async loginMobile(data: { mobile: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Login failed', response.status);
    }

    return response.json();
  },

  async loginEmail(data: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Login failed', response.status);
    }

    return response.json();
  },

  async verifyMobileOtp(data: { mobile: string; otp: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login/mobile/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('OTP verification failed', response.status);
    }

    return response.json();
  },

  async refreshToken(data: RefreshTokenRequest) {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Token refresh failed', response.status);
    }

    return response.json();
  },

  async superAdminLogin(data: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/superadmin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Super admin login failed', response.status);
    }

    return response.json();
  },

  async logoutAll() {
    const token = localStorage.getItem('nifty-bulk-token');
    const response = await fetch(`${API_BASE_URL}/auth/logout-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new AuthError('Logout failed', response.status);
    }

    return response.json();
  },

  async checkSignupStatus(mobile: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/status?mobile=${mobile}`);

    if (!response.ok) {
      throw new AuthError('Failed to check signup status', response.status);
    }

    return response.json();
  },

  async sendSignupOtp(data: { mobile: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/mobile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Failed to send OTP', response.status);
    }

    return response.json();
  },

  async verifySignupOtp(data: { mobile: string; otp: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/mobile/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('OTP verification failed', response.status);
    }

    return response.json();
  },

  async signupEmail(data: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Email signup failed', response.status);
    }

    return response.json();
  },

  async verifyEmailOtp(data: { email: string; otp: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Email verification failed', response.status);
    }

    return response.json();
  },

  async signupPan(data: { pan: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/pan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('PAN verification failed', response.status);
    }

    return response.json();
  },

  async signupCredentials(data: { email: string; password: string }) {
    const token = localStorage.getItem('nifty-bulk-token');
    const response = await fetch(`${API_BASE_URL}/auth/signup/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new AuthError('Credentials signup failed', response.status);
    }

    return response.json();
  },
};
