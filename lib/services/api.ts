/**
 * Generic API Service
 *
 * Provides a client for making authenticated requests to AMPECO API
 * with automatic JWT impersonation support.
 */

import { getAmpecoConfig } from "@/lib/config/ampeco";
import { getJwtToken } from "@/lib/auth/get-jwt-context";

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  jwtToken?: string; // Optional override for JWT token
}

/**
 * Generic API Client
 */
export class ApiService {
  private apiToken: string;
  private apiBase: string;
  private tenantUrl: string;

  constructor() {
    const config = getAmpecoConfig();
    this.apiToken = config.apiToken;
    this.apiBase = config.urls.apiBase;
    this.tenantUrl = config.urls.tenant;
  }

  /**
   * Builds authorization header with JWT impersonation
   * @param jwtToken JWT token for impersonation (optional)
   * @returns Authorization header value
   */
  private buildAuthHeader(jwtToken?: string | null): string {
    if (jwtToken) {
      // Impersonation format: Bearer {api_token}:{jwt_token}
      return `Bearer ${this.apiToken}:${jwtToken}`;
    }
    // Standard format: Bearer {api_token}
    return `Bearer ${this.apiToken}`;
  }

  /**
   * Builds URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(`${this.apiBase}/${endpoint}`, this.tenantUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Makes an authenticated API request
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {}, params, jwtToken } = options;

    // Get JWT token if not provided (from context)
    const token = jwtToken || (await getJwtToken());

    // Build URL
    const url = this.buildUrl(endpoint, params);

    // Build headers
    const authHeader = this.buildAuthHeader(token);
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
      ...headers,
    };

    // Debug logging
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      console.log("[API Request]");
      console.log("  Method:", method);
      console.log("  URL:", url);
      console.log("  Endpoint:", endpoint);
      console.log("  Params:", params || "none");
      console.log("  JWT Token Present:", token ? "yes" : "no");
      console.log(
        "  Auth Header Format:",
        authHeader.startsWith(`Bearer ${this.apiToken}:`)
          ? "impersonation (api_token:jwt_token)"
          : "standard (api_token only)"
      );
      if (token) {
        // Log first/last few chars of tokens for debugging (mask middle)
        const apiTokenPreview =
          this.apiToken.substring(0, 8) +
          "..." +
          this.apiToken.substring(this.apiToken.length - 4);
        const jwtTokenPreview =
          token.substring(0, 20) + "..." + token.substring(token.length - 10);
        console.log("  API Token Preview:", apiTokenPreview);
        console.log("  JWT Token Preview:", jwtTokenPreview);
      } else {
        console.log("  ⚠️  WARNING: No JWT token found!");
      }
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== "GET") {
      requestOptions.body = JSON.stringify(body);
      if (isDevelopment) {
        console.log("  Request Body:", JSON.stringify(body, null, 2));
      }
    }

    try {
      const response = await fetch(url, requestOptions);

      if (isDevelopment) {
        console.log("[API Response]");
        console.log("  Status:", response.status, response.statusText);
        console.log("  OK:", response.ok);
      }

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          const errorText = await response.text();
          if (isDevelopment) {
            console.log("  Error Response (non-JSON):", errorText);
          }
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        if (isDevelopment) {
          console.log("  Error Response:", JSON.stringify(data, null, 2));
        }
        const error: ApiError = {
          message: data.message || `API request failed: ${response.status}`,
          errors: data.errors,
          status: response.status,
        };
        throw error;
      }

      if (isDevelopment) {
        console.log("  ✅ Success");
      }

      return data as T;
    } catch (error) {
      if (isDevelopment) {
        console.log("  ❌ Error:", error);
      }
      if (error instanceof Error && "status" in error) {
        throw error;
      }
      throw new Error(
        `API request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

/**
 * Singleton instance of API service
 */
let apiServiceInstance: ApiService | null = null;

/**
 * Gets the API service instance
 */
export function getApiService(): ApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService();
  }
  return apiServiceInstance;
}
