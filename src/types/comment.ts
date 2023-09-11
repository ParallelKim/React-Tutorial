export type NEW_COMMENT_TYPE = {
  uid?: string;
  author?: string;
  content: string;
  postId: string;
  parentId?: string | null;

  [key: string]: unknown;
};

export type EDIT_COMMENT_TYPE = {
  commentId: string;
  content: string;

  [key: string]: unknown;
};
