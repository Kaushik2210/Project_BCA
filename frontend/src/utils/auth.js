export const getToken = () => {
  return localStorage.getItem('admin_token');
};

export const setToken = (token) => {
  localStorage.setItem('admin_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('admin_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
