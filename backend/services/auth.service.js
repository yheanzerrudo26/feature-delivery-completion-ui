const API_URL = "http://192.168.1.11:5000/api/auth";

export const registerUser = async (email, password, firstName, lastName) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      role: "user",
    }),
  });

  if (!response.ok) throw await response.json();

  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw await response.json();

  const data = await response.json();

  // ✅ IMPORTANT: return clean structure
  return {
    uid: data.uid,
    email: data.email,
    role: data.role,
  };
};

export const fetchUserRole = async (uid) => {
  const response = await fetch(`${API_URL}/role/${uid}`);

  if (!response.ok) throw await response.json();

  return response.json();
};