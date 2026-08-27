// src/types/index.ts
// Re-export types from Prisma 7 schema

export type {
	organization,
	devisi,
	member,
	member_memberType,
	proker
} from '../lib/server/generated/prisma/client.js';

// ============================================
// Custom Types (tambahan)
// ============================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
	page: number;
	limit: number;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
	isValid: boolean;
	errors: Record<string, string[]>;
}
