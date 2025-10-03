const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const HEALTH_CHECK_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5001";

class AdminService {
  async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(HEALTH_CHECK_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getUsers() {
    const response = await fetch(`${API_BASE}/debug/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  async toggleUserStatus(userId: string) {
    try {
      const response = await fetch(`${API_BASE}/debug/users/${userId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error || `HTTP error! status: ${response.status}`
          }
        };
      }
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async updateWalletBalance(userId: string, newBalance: number) {
    try {
      const response = await fetch(`${API_BASE}/debug/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletBalance: newBalance }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.error || `HTTP error! status: ${response.status}`
          }
        };
      }
      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async bulkActivateUsers(userIds: string[]) {
    let successCount = 0;
    let errorCount = 0;

    for (const userId of userIds) {
      try {
        const response = await fetch(`${API_BASE}/debug/users/${userId}/toggle`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }
    return { successCount, errorCount };
  }

  async bulkDeactivateUsers(userIds: string[]) {
    let successCount = 0;
    let errorCount = 0;

    for (const userId of userIds) {
      try {
        const response = await fetch(`${API_BASE}/debug/users/${userId}/toggle`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }
    return { successCount, errorCount };
  }
}

export const adminService = new AdminService();
