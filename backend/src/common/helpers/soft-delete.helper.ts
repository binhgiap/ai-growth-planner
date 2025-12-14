import { IsNull } from 'typeorm';

/**
 * Helper function để query các entity chưa bị soft delete
 */
export const notDeleted = () => IsNull();

/**
 * Helper function để xây dựng where clause cho soft delete
 */
export const buildNotDeletedWhere = (conditions: Record<string, any>) => ({
  ...conditions,
  deletedAt: IsNull(),
});
