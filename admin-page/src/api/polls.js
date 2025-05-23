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

// Add a new poll
export async function createPoll(pollData) {
  try {
    // Validate required fields
    if (!pollData.question || !pollData.options || !pollData.endDate) {
      return { 
        error: 'Missing required fields: question, options, and endDate are required',
        status: 400
      };
    }

    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const response = await axios.post(`${BASE_URL}/api/polls`, pollData, {
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

// Get all polls
export async function getAllPolls(status) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const url = status ? `${BASE_URL}/api/polls?status=${status}` : `${BASE_URL}/api/polls`;
    
    const response = await axios.get(url, {
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

// Get poll by ID
export async function getPollById(id) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const response = await axios.get(`${BASE_URL}/api/polls/${id}`, {
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

// Update a poll
export async function updatePoll(id, pollData) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const response = await axios.put(`${BASE_URL}/api/polls/${id}`, pollData, {
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

// Delete a poll
export async function deletePoll(id) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const response = await axios.delete(`${BASE_URL}/api/polls/${id}`, {
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

// Vote on a poll
export async function voteOnPoll(id, optionId) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const response = await axios.post(`${BASE_URL}/api/polls/${id}/vote`, { optionId }, {
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

// Close a poll
export async function closePoll(id) {
  try {
    const token = localStorage.getItem('admin_id_token');
    if (!token) {
      return { error: 'Authentication required', status: 401 };
    }

    const response = await axios.put(`${BASE_URL}/api/polls/${id}`, { isActive: false }, {
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