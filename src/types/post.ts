export type NEW_POST_TYPE = {
  uid?: string;
  author?: string;
  postId: string;
  address?: string;
  title: string;
  content: string;
  tags: string[];
  thumbnail: string;
  state: "published" | "draft" | "hidden";
  seriesId?: string | null;
  [key: string]: unknown;
};

export type EDIT_POST_TYPE = {
  postId: string;
  adress?: string;
  title?: string;
  content?: string;
  tags?: string[];
  thumbnail?: string;
  state?: "published" | "draft" | "hidden";
  originSeriesId?: string | null;
  newSeriesId?: string | null;

  [key: string]: unknown;
};

