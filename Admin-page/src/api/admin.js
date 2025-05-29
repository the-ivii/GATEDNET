import axios from 'axios';

// Use environment variable or fallback to deployed URL
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://gatednet-51tu.onrender.com';
//const BASE_URL = 'http://localhost:5000'; // Force port 5000 explicitly

// Helper to handle API errors
const handleApiError = (error) => {
  console.error("API Error:", error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return { 
      error: error.response.data.error || 'Server error', 
      status: error.response.status 
    };
  } else if (error.request) {
    // The request was made but no response was received
    return { error: 'No response from server', status: 0 };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { error: 'Request configuration error', status: 0 };
  }
};

export async function adminLogin(form) {
  try {
    console.log("Attempting admin login for:", form.email);
    const response = await axios.post(`${BASE_URL}/api/admin/login`, form, {
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
    
    console.log("Login response received:", {
      status: response.status,
      hasToken: !!response.data?.token,
      hasAdmin: !!response.data?.admin
    });
    
    if (!response.data?.token) {
      console.error("No token received in login response");
      return { error: "Authentication failed: No token received" };
    }
    
    return response.data;
  } catch (error) {
    console.error("Admin login error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      return { error: "Invalid email or password" };
    }
    
    return handleApiError(error);
  }
}

export async function adminSignup(form) {
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/signin`, form, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Get admin profile (protected endpoint)
export async function getAdminProfile() {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`${BASE_URL}/api/admin/profile`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Logout admin
export async function adminLogout() {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (token) {
      await axios.post(`${BASE_URL}/api/admin/logout`, {}, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
    }
    
    // Clear local storage regardless of server response
    localStorage.removeItem('admin_id_token');
    localStorage.removeItem('admin_user');
    
    return { success: true };
  } catch (error) {
    // Still clear local storage on error
    localStorage.removeItem('admin_id_token');
    localStorage.removeItem('admin_user');
    
    return { success: true, warning: 'Logged out locally but server logout failed' };
  }
}