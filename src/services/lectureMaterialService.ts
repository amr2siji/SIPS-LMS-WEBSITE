import { ApiService, ApiResponse } from './apiService';

export interface FileInfo {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export interface LectureMaterial {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  moduleName: string;
  week: number;
  files: string; // JSON string from backend
  uploadedBy: string;
  uploaderRole: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LectureMaterialRequest {
  title: string;
  description: string;
  moduleId: number;
  moduleName: string;
  week: number;
  files: FileInfo[];
}

export interface LectureMaterialStats {
  totalMaterials: number;
  materialsThisMonth: number;
  materialsThisWeek: number;
  totalModulesWithMaterials: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

class LectureMaterialServiceClass extends ApiService {
  // Admin Material Services
  async createMaterialAdmin(material: LectureMaterialRequest): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.post<LectureMaterial>('/api/admin/materials', material);
    return response;
  }

  async updateMaterialAdmin(id: number, material: LectureMaterialRequest): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.put<LectureMaterial>(`/api/admin/materials/${id}`, material);
    return response;
  }

  async deleteMaterialAdmin(id: number): Promise<ApiResponse<void>> {
    const response = await this.delete<void>(`/api/admin/materials/${id}`);
    return response;
  }

  async getMaterialByIdAdmin(id: number): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.get<LectureMaterial>(`/api/admin/materials/${id}`);
    return response;
  }

  async getAllMaterialsAdmin(
    page: number = 0,
    size: number = 9,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<ApiResponse<PagedResponse<LectureMaterial>>> {
    const response = await this.get<PagedResponse<LectureMaterial>>('/api/admin/materials', {
      page, size, sortBy, sortDir
    });
    return response;
  }

  async getMaterialsByModuleAdmin(
    moduleId: number,
    page: number = 0,
    size: number = 9
  ): Promise<ApiResponse<PagedResponse<LectureMaterial>>> {
    const response = await this.get<PagedResponse<LectureMaterial>>(
      `/api/admin/materials/module/${moduleId}`,
      { page, size }
    );
    return response;
  }

  async searchMaterialsAdmin(
    query: string,
    page: number = 0,
    size: number = 9
  ): Promise<ApiResponse<PagedResponse<LectureMaterial>>> {
    const response = await this.get<PagedResponse<LectureMaterial>>('/api/admin/materials/search', {
      query, page, size
    });
    return response;
  }

  async getStatsAdmin(): Promise<ApiResponse<LectureMaterialStats>> {
    const response = await this.get<LectureMaterialStats>('/api/admin/materials/stats');
    return response;
  }

  async togglePublishAdmin(id: number): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.patch<LectureMaterial>(`/api/admin/materials/${id}/publish`, {});
    return response;
  }

  // Lecturer Material Services
  async createMaterialLecturer(material: LectureMaterialRequest): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.post<LectureMaterial>('/api/lecturer/materials', material);
    return response;
  }

  async updateMaterialLecturer(id: number, material: LectureMaterialRequest): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.put<LectureMaterial>(`/api/lecturer/materials/${id}`, material);
    return response;
  }

  async deleteMaterialLecturer(id: number): Promise<ApiResponse<void>> {
    const response = await this.delete<void>(`/api/lecturer/materials/${id}`);
    return response;
  }

  async getMaterialByIdLecturer(id: number): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.get<LectureMaterial>(`/api/lecturer/materials/${id}`);
    return response;
  }

  async getMyMaterials(
    page: number = 0,
    size: number = 9
  ): Promise<ApiResponse<PagedResponse<LectureMaterial>>> {
    const response = await this.get<PagedResponse<LectureMaterial>>('/api/lecturer/materials', {
      page, size
    });
    return response;
  }

  async getMaterialsByModuleLecturer(
    moduleId: number,
    page: number = 0,
    size: number = 9
  ): Promise<ApiResponse<PagedResponse<LectureMaterial>>> {
    const response = await this.get<PagedResponse<LectureMaterial>>(
      `/api/lecturer/materials/module/${moduleId}`,
      { page, size }
    );
    return response;
  }

  async searchMaterialsLecturer(
    query: string,
    page: number = 0,
    size: number = 9
  ): Promise<ApiResponse<PagedResponse<LectureMaterial>>> {
    const response = await this.get<PagedResponse<LectureMaterial>>('/api/lecturer/materials/search', {
      query, page, size
    });
    return response;
  }

  async getStatsLecturer(): Promise<ApiResponse<LectureMaterialStats>> {
    const response = await this.get<LectureMaterialStats>('/api/lecturer/materials/stats');
    return response;
  }

  async togglePublishLecturer(id: number): Promise<ApiResponse<LectureMaterial>> {
    const response = await this.patch<LectureMaterial>(`/api/lecturer/materials/${id}/publish`, {});
    return response;
  }
}

export const lectureMaterialService = new LectureMaterialServiceClass();
