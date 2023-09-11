export type USER_INFO_TYPE = {
  profileImage?: string | null;
  uid?: string | null;
  email?: string | null;
  name?: string | null;
  customId?: string | null;
  introduction?: string | null;
  velogTitle?: string | null;
  github?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  homepage?: string | null;
  emailNotification?: {
    comment: boolean;
    serviceUpdate: boolean;
  };
};
