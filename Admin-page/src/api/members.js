import axios from 'axios';

// Use port 7000 for backend
const BASE_URL = 'http://localhost:7000';

// Helper to handle API errors
const handleApiError = (error) => {
  console.error("API Error:", error);
  if (error.response) {
    return { 
      error: error.response.data.error || 'Server error', 
      status: error.response.status 
    };
  } else if (error.request) {
    return { error: 'No response from server', status: 0 };
  } else {
    return { error: 'Request configuration error', status: 0 };
  }
};

// Add a new member
export async function addMember(memberData) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }
    const response = await axios.post(`${BASE_URL}/api/members/add`, memberData, {
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

// Get all members
export async function getAllMembers() {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }
    const response = await axios.get(`${BASE_URL}/api/members`, {
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

// Update a member
export async function updateMember(id, memberData) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }
    const response = await axios.put(`${BASE_URL}/api/members/${id}`, memberData, {
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

// Delete a member
export async function deleteMember(id) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }
    const response = await axios.delete(`${BASE_URL}/api/members/${id}`, {
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