const API_BASE_URL = 'http://localhost:3001';

export const patternAPI = {
  async getPattern(filename: string) {
    const response = await fetch(`${API_BASE_URL}/patterns/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pattern: ${response.statusText}`);
    }
    return response.json();
  },

  async listPatterns() {
    const response = await fetch(`${API_BASE_URL}/patterns`);
    if (!response.ok) {
      throw new Error(`Failed to list patterns: ${response.statusText}`);
    }
    return response.json();
  },

  async calculatePattern(data: {
    patternFile: string;
    tensionX: number;
    tensionY: number;
    width: number;
    height: number;
    motifWidth?: number;
    motifHeight?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/pattern/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    // If 400 status, return the error response (with errors array) instead of throwing
    if (response.status === 400 && result.errors) {
      return result;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to calculate pattern: ${response.statusText}`);
    }
    
    return result;
  }
};

