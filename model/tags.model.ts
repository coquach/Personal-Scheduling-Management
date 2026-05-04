export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export type CreateTagInput = {
  name: string;
  color?: string;
};

export type UpdateTagInput = {
  name?: string;
  color?: string;
};
