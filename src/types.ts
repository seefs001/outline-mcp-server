// Define types for Outline API
export type Collection = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  permission?: string;
  private?: boolean;
};

export type Document = {
  id: string;
  title: string;
  text: string;
  emoji?: string;
  collectionId: string;
  parentDocumentId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  url: string;
};

export type Team = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isSuspended: boolean;
  lastActiveAt: string;
  createdAt: string;
};

// Define argument types for tools
export type ListDocumentsArgs = {
  collectionId?: string;
  query?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  template?: boolean;
  userId?: string;
  parentDocumentId?: string;
  backlinkDocumentId?: string;
};

export type GetDocumentArgs = {
  id?: string; // Made optional
  shareId?: string; // Added optional shareId
};

export type CreateDocumentArgs = {
  title: string;
  text?: string; // Made optional
  collectionId: string;
  parentDocumentId?: string;
  publish?: boolean;
  template?: boolean;
  templateId?: string; // Kept optional as per existing type, spec doesn't explicitly require it
};

export type UpdateDocumentArgs = {
  id: string; // Renamed from documentId
  title?: string;
  content?: string; // Renamed from text
  append?: boolean; // Added append property
  publish?: boolean;
  done?: boolean;
};

export type DeleteDocumentArgs = {
  id: string;
  permanent?: boolean;
};

export type ListCollectionsArgs = {
  limit?: number;
  offset?: number; // Added
  sort?: string; // Added
  direction?: 'ASC' | 'DESC'; // Added
  query?: string; // Added
  statusFilter?: ('archived')[]; // Added
};

export type GetCollectionArgs = {
  id: string;
};

export type ListTeamsArgs = {
  limit?: number;
};

export type SearchDocumentsArgs = {
  query: string;
  collectionId?: string;
  limit?: number;
};

export type CreateCollectionArgs = {
  name: string;
  description?: string;
  permission?: 'read' | 'read_write';
  color?: string;
  private?: boolean;
};

export type UpdateCollectionArgs = {
  id: string;
  name?: string;
  description?: string;
  permission?: 'read' | 'read_write';
  color?: string;
};

export type CreateCommentArgs = {
  documentId: string;
  content: Record<string, any>; // Renamed from text, changed type from string
  parentCommentId?: string;
  data?: Record<string, any>; // Note: 'data' might be redundant now if 'content' holds the editor data. Consider removing if appropriate.
};

export type UpdateCommentArgs = {
  id: string;
  data: Record<string, any>; // Data is required according to the spec
};

export type DeleteCommentArgs = {
  id: string;
};

export type GetCommentArgs = {
  id: string;
  includeAnchorText?: boolean;
};

export type ListUsersArgs = {
  offset?: number;
  limit?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  query?: string;
  emails?: string[];
  filter?: 'all' | 'invited' | 'active' | 'suspended';
  role?: 'admin' | 'member' | 'viewer' | 'guest';
};

export type MoveDocumentArgs = {
  id: string;
  collectionId?: string;
  parentDocumentId?: string;
};

export type ArchiveDocumentArgs = {
  id: string;
};

export type AskDocumentsArgs = {
  query: string;
  userId?: string;
  collectionId?: string;
  documentId?: string;
  statusFilter?: 'draft' | 'archived' | 'published';
  dateFilter?: 'day' | 'week' | 'month' | 'year';
};

export type CreateTemplateFromDocumentArgs = {
  id: string;
};
