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
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
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
    const {
      method = "GET",
      body,
      headers = {},
      params,
      jwtToken,
    } = options;

    // Get JWT token if not provided (from context)
    const token = jwtToken || (await getJwtToken());

    // Build URL
    const url = this.buildUrl(endpoint, params);

    // Build headers
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: this.buildAuthHeader(token),
      ...headers,
    };

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== "GET") {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || `API request failed: ${response.status}`,
          errors: data.errors,
          status: response.status,
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error && "status" in error) {
        throw error;
      }
      throw new Error(
        `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Gets charge points
   */
  async getChargePoints(
    params?: {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
    }
  ): Promise<ApiResponse<ChargePoint[]>> {
    return this.request<ApiResponse<ChargePoint[]>>("charge-points/v2.0", {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Gets a single charge point by ID
   */
  async getChargePoint(id: string): Promise<ChargePoint> {
    return this.request<ChargePoint>(`charge-points/v2.0/${id}`);
  }

  /**
   * Creates a new charge point
   */
  async createChargePoint(data: Partial<ChargePoint>): Promise<ChargePoint> {
    return this.request<ChargePoint>("charge-points/v2.0", {
      method: "POST",
      body: data,
    });
  }

  /**
   * Updates a charge point
   */
  async updateChargePoint(
    id: string,
    data: Partial<ChargePoint>
  ): Promise<ChargePoint> {
    return this.request<ChargePoint>(`charge-points/v2.0/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  /**
   * Gets sessions
   */
  async getSessions(
    params?: {
      page?: number;
      per_page?: number;
      status?: string;
      charge_point_id?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<ApiResponse<Session[]>> {
    return this.request<ApiResponse<Session[]>>("sessions/v1.0", {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Gets a single session by ID
   */
  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`sessions/v1.0/${id}`);
  }

  /**
   * Gets EVSEs
   */
  async getEvses(
    params?: {
      page?: number;
      per_page?: number;
      charge_point_id?: string;
    }
  ): Promise<ApiResponse<Evse[]>> {
    return this.request<ApiResponse<Evse[]>>("evses/v2.1", {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Gets a single EVSE by ID
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

