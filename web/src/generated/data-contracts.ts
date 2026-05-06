/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Error {
  /** Error message */
  error?: string;
  /** Detailed error description */
  message?: string;
}

export interface Success {
  /** Success message */
  message?: string;
}

export interface Version {
  /** Current API version */
  version?: string;
  /** Build information */
  build?: string;
}

export interface User {
  /** User ID */
  id?: number;
  /**
   * User email address
   * @format email
   */
  email?: string;
  /**
   * Account creation timestamp
   * @format date-time
   */
  created_at?: string;
}

export interface NotionPage {
  /** Object type */
  object: "page";
  /** Page ID */
  id: string;
  /**
   * Page creation timestamp
   * @format date-time
   */
  created_time: string;
  /**
   * Last edited timestamp
   * @format date-time
   */
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  cover?: NotionFile | null;
  icon?: NotionIcon | null;
  parent: NotionParent;
  /** Whether the page is archived */
  archived: boolean;
  /** Page properties */
  properties: Record<string, any>;
  /**
   * Page URL
   * @format uri
   */
  url: string;
  /** Public page URL */
  public_url?: string | null;
}

export interface NotionDatabase {
  /** Object type */
  object: "database";
  /** Database ID */
  id: string;
  /**
   * Database creation timestamp
   * @format date-time
   */
  created_time: string;
  /**
   * Last edited timestamp
   * @format date-time
   */
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  /** Database title */
  title: NotionRichText[];
  /** Database description */
  description: NotionRichText[];
  icon?: NotionIcon | null;
  cover?: NotionFile | null;
  /** Database properties/schema */
  properties: Record<string, any>;
  parent: NotionParent;
  /**
   * Database URL
   * @format uri
   */
  url: string;
  /** Whether the database is archived */
  archived: boolean;
  /** Whether the database is inline */
  is_inline: boolean;
  /** Public database URL */
  public_url?: string | null;
}

export interface NotionUser {
  /** Object type */
  object: "user";
  /** User ID */
  id: string;
  /** User type */
  type?: "person" | "bot";
  /** User name */
  name?: string;
  /** User avatar URL */
  avatar_url?: string | null;
}

export type NotionIcon =
  | {
      type: "emoji";
      emoji: string;
    }
  | {
      type: "external";
      external: {
        /** @format uri */
        url: string;
      };
    }
  | {
      type: "file";
      file: {
        /** @format uri */
        url: string;
        /** @format date-time */
        expiry_time: string;
      };
    };

export type NotionFile =
  | {
      type: "external";
      external: {
        /** @format uri */
        url: string;
      };
    }
  | {
      type: "file";
      file: {
        /** @format uri */
        url: string;
        /** @format date-time */
        expiry_time: string;
      };
    };

export type NotionParent =
  | {
      type: "database_id";
      database_id: string;
    }
  | {
      type: "page_id";
      page_id: string;
    }
  | {
      type: "workspace";
      workspace: boolean;
    }
  | {
      type: "block_id";
      block_id: string;
    };

export interface NotionRichText {
  /** Rich text type */
  type: "text" | "mention" | "equation";
  text?: {
    content?: string;
    link?: {
      /** @format uri */
      url: string;
    } | null;
  };
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  /** Plain text content */
  plain_text: string;
  /** Link URL */
  href?: string | null;
}

export interface NotionSearchResults {
  /** Object type */
  object: "list";
  /** Search results */
  results: (NotionPage | NotionDatabase)[];
  /** Cursor for next page of results */
  next_cursor?: string | null;
  /** Whether there are more results */
  has_more: boolean;
  /** Type of search results */
  type: "page_or_database";
  /** Search metadata */
  page_or_database?: object;
}

/** Simplified Notion object for frontend consumption */
export interface NotionObject {
  /** Object type (page or database) */
  object: string;
  /** Object title */
  title: string;
  /**
   * Object URL
   * @format uri
   */
  url: string;
  /** Object icon (emoji or URL) */
  icon?: string;
  /** Object ID */
  id: string;
  /** Full object data */
  data?: NotionPage | NotionDatabase;
  /** Whether the object is favorited */
  isFavorite?: boolean;
}

export interface Upload {
  /** Upload ID */
  id?: number;
  /** Original filename */
  filename?: string;
  /** File size in bytes */
  size?: number;
  /**
   * Upload timestamp
   * @format date-time
   */
  created_at?: string;
}
