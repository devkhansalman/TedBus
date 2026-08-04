const LOCAL_BACKEND_URL = 'http://localhost:8000/';
const RENDER_BACKEND_URL = 'https://tedbus-45ol.onrender.com/';

const determineApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // If running locally (localhost or 127.0.0.1), use http://localhost:8000/
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_BACKEND_URL;
    }
  }
  // For Netlify deployment or remote environments, default to Render backend
  return RENDER_BACKEND_URL;
};

export const getApiUrl = determineApiUrl;
export const url: string = determineApiUrl();



