
const API_BASE = "/api";

class ApiClient {
  private getToken(): string | null {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("session_token");
    }
    return null;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    const token = this.getToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      // Optionally trigger a logout event or redirect
      // For now, we just let the caller handle the error, 
      // but we might want to clear the token if it's definitely invalid
    }

    return response;
  }

  async get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint: string, data: any, options: RequestInit = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  async put(endpoint: string, data: any, options: RequestInit = {}) {
     const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  async delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
