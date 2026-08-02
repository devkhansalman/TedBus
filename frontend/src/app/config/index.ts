const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    // Direct local Angular dev server without proxy
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '4200') {
      return 'http://localhost:8000/';
    }
  }
  return '/api/';
};

export const url: string = getApiUrl();


