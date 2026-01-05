/**
 * AMPECO API Service
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
 * Charge Point resource
 */
export interface ChargePoint {
  id: string;
  name: string;
  status: "online" | "offline" | "charging" | "available" | "faulted";
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  connectors?: Connector[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Connector resource
 */
export interface Connector {
  id: string;
  connector_type: string;
  max_power?: number;
  status?: string;
}

/**
 * EVSE resource
 */
export interface Evse {
  id: string;
  charge_point_id: string;
  evse_id: string;
  status: string;
  connectors?: Connector[];
}

/**
 * Session resource
 */
export interface Session {
  id: string;
  charge_point_id: string;
  connector_id: string;
  status: "active" | "completed" | "stopped" | "pending";
  start_time?: string;
  end_time?: string;
  energy_delivered?: number;
  cost?: number;
  user_id?: string;
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
 * AMPECO API Client
 */
export class AmpecoApiService {
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
  private async request<T>(
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
      console.log("[AMPECO API Request]");
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
        console.log("[AMPECO API Response]");
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

  /**
   * Gets charge points
   * Endpoint: GET https://{AMPECO_BASE_DOMAIN}/public-api/resources/charge-points/v1.0
   */
  async getChargePoints(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<ChargePoint[]>> {
    return this.request<ApiResponse<ChargePoint[]>>("charge-points/v1.0", {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Gets a single charge point by ID
   * Endpoint: GET https://{AMPECO_BASE_DOMAIN}/public-api/resources/charge-points/v1.0/{id}
   */
  async getChargePoint(id: string): Promise<ChargePoint> {
    return this.request<ChargePoint>(`charge-points/v1.0/${id}`);
  }

  /**
   * Creates a new charge point
   * Endpoint: POST https://{AMPECO_BASE_DOMAIN}/public-api/resources/charge-points/v1.0
   */
  async createChargePoint(data: Partial<ChargePoint>): Promise<ChargePoint> {
    return this.request<ChargePoint>("charge-points/v1.0", {
      method: "POST",
      body: data,
    });
  }

  /**
   * Updates a charge point
   * Endpoint: PATCH https://{AMPECO_BASE_DOMAIN}/public-api/resources/charge-points/v1.0/{id}
   */
  async updateChargePoint(
    id: string,
    data: Partial<ChargePoint>
  ): Promise<ChargePoint> {
    return this.request<ChargePoint>(`charge-points/v1.0/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  /**
   * Deletes a charge point
   * Endpoint: DELETE https://{AMPECO_BASE_DOMAIN}/public-api/resources/charge-points/v1.0/{id}
   */
  async deleteChargePoint(id: string): Promise<void> {
    await this.request<void>(`charge-points/v1.0/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Gets sessions
   * Endpoint: GET https://{AMPECO_BASE_DOMAIN}/public-api/resources/sessions/v1.0
   */
  async getSessions(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    charge_point_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Session[]>> {
    return this.request<ApiResponse<Session[]>>("sessions/v1.0", {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Gets a single session by ID
   * Endpoint: GET https://{AMPECO_BASE_DOMAIN}/public-api/resources/sessions/v1.0/{id}
   */
  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`sessions/v1.0/${id}`);
  }

  /**
   * Gets EVSEs
   * Endpoint: GET https://{AMPECO_BASE_DOMAIN}/public-api/resources/evses/v2.1
   */
  async getEvses(params?: {
    page?: number;
    per_page?: number;
    charge_point_id?: string;
  }): Promise<ApiResponse<Evse[]>> {
    return this.request<ApiResponse<Evse[]>>("evses/v2.1", {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Gets a single EVSE by ID
   * Endpoint: GET https://{AMPECO_BASE_DOMAIN}/public-api/resources/evses/v2.1/{id}
   */
  async getEvse(id: string): Promise<Evse> {
    return this.request<Evse>(`evses/v2.1/${id}`);
  }

  /**
   * Generic API request method for custom endpoints
   */
  async customRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, options);
  }
}

/**
 * Singleton instance of AMPECO API service
 */
let apiServiceInstance: AmpecoApiService | null = null;

/**
 * Gets the AMPECO API service instance
 */
export function getAmpecoApiService(): AmpecoApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new AmpecoApiService();
  }
  return apiServiceInstance;
}
