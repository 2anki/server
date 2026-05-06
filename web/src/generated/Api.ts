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

import {
  Error,
  NotionDatabase,
  NotionPage,
  NotionSearchResults,
  Success,
  Upload,
  User,
  Version,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Api<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Check the health and status of the API server
   *
   * @tags System
   * @name ChecksList
   * @summary Health check
   * @request GET:/api/checks
   * @secure
   */
  checksList = (params: RequestParams = {}) =>
    this.request<
      {
        /** Server status */
        status?: "ok" | "healthy";
        /**
         * Check timestamp
         * @format date-time
         */
        timestamp?: string;
        /** Server uptime in seconds */
        uptime?: number;
        /** API version */
        version?: string;
      },
      Error
    >({
      path: `/api/checks`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Submit a contact form with optional file attachments
   *
   * @tags Support
   * @name ContactUsCreate
   * @summary Contact us form
   * @request POST:/api/contact-us
   * @secure
   */
  contactUsCreate = (
    data: {
      /** Sender's name */
      name: string;
      /**
       * Sender's email address
       * @format email
       */
      email: string;
      /** Contact message */
      message: string;
      /** Message subject */
      subject?: string;
      /** Optional file attachments (max 25MB per file) */
      attachments?: File[];
    },
    params: RequestParams = {},
  ) =>
    this.request<Success, Error>({
      path: `/api/contact-us`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });
  /**
   * @description Download a file uploaded by the authenticated user using the file key
   *
   * @tags Download
   * @name DownloadUDetail
   * @summary Download user file
   * @request GET:/api/download/u/{key}
   * @secure
   */
  downloadUDetail = (key: string, params: RequestParams = {}) =>
    this.request<File, Error>({
      path: `/api/download/u/${key}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description Add a new item to the user's favorites list
   *
   * @tags Favorites
   * @name FavoriteCreateCreate
   * @summary Create favorite
   * @request POST:/api/favorite/create
   * @secure
   */
  favoriteCreateCreate = (
    data: {
      /** Type of item to favorite */
      type: "upload" | "template" | "notion_page";
      /** Data about the favorite item */
      data: object;
      /** Display title for the favorite */
      title?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Favorite ID */
        id?: number;
        /** Success message */
        message?: string;
      },
      Error
    >({
      path: `/api/favorite/create`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Remove an item from the user's favorites list
   *
   * @tags Favorites
   * @name FavoriteRemoveCreate
   * @summary Remove favorite
   * @request POST:/api/favorite/remove
   * @secure
   */
  favoriteRemoveCreate = (
    data: {
      /** Favorite ID to remove */
      id: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<Success, Error>({
      path: `/api/favorite/remove`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve all favorite items for the authenticated user
   *
   * @tags Favorites
   * @name FavoriteList
   * @summary Get user favorites
   * @request GET:/api/favorite
   * @secure
   */
  favoriteList = (params: RequestParams = {}) =>
    this.request<
      {
        /** Favorite ID */
        id?: number;
        /** Type of favorite item */
        type?: "upload" | "template" | "notion_page";
        /** Display title */
        title?: string;
        /** Item data */
        data?: object;
        /**
         * When the favorite was created
         * @format date-time
         */
        created_at?: string;
      }[],
      Error
    >({
      path: `/api/favorite`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Establish a connection to Notion using OAuth. Redirects to Notion authorization page.
   *
   * @tags Notion
   * @name NotionConnectList
   * @summary Connect to Notion
   * @request GET:/api/notion/connect
   * @secure
   */
  notionConnectList = (params: RequestParams = {}) =>
    this.request<any, void | Error>({
      path: `/api/notion/connect`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description Search for pages in the user's connected Notion workspace
   *
   * @tags Notion
   * @name NotionPagesCreate
   * @summary Search Notion pages
   * @request POST:/api/notion/pages
   * @secure
   */
  notionPagesCreate = (
    data: {
      /** Search query for pages */
      query?: string;
      /** Filter criteria for pages */
      filter?: object;
    },
    params: RequestParams = {},
  ) =>
    this.request<NotionSearchResults, Error>({
      path: `/api/notion/pages`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Get the OAuth link to connect to Notion
   *
   * @tags Notion
   * @name NotionGetNotionLinkList
   * @summary Get Notion connection link
   * @request GET:/api/notion/get-notion-link
   * @secure
   */
  notionGetNotionLinkList = (params: RequestParams = {}) =>
    this.request<
      {
        /**
         * Notion OAuth authorization URL
         * @format uri
         */
        link?: string;
        /** Whether user is connected to Notion */
        isConnected?: boolean;
        /** Connected workspace name */
        workspace?: string | null;
      },
      Error
    >({
      path: `/api/notion/get-notion-link`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Convert a Notion page to Anki flashcards
   *
   * @tags Notion
   * @name NotionConvertCreate
   * @summary Convert Notion page to Anki
   * @request POST:/api/notion/convert/
   * @secure
   */
  notionConvertCreate = (
    data: {
      /** Notion page ID to convert */
      pageId: string;
      /** Conversion options */
      options?: {
        /** Name for the Anki deck */
        deckName?: string;
        /** Create reversed cards */
        basicReversed?: boolean;
        /** Tags to add to cards */
        tags?: string[];
      };
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Conversion job ID */
        jobId?: string;
        /** Success message */
        message?: string;
      },
      Error
    >({
      path: `/api/notion/convert/`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve a specific Notion page by ID
   *
   * @tags Notion
   * @name NotionPageDetail
   * @summary Get Notion page
   * @request GET:/api/notion/page/{id}
   * @secure
   */
  notionPageDetail = (id: string, params: RequestParams = {}) =>
    this.request<NotionPage, Error>({
      path: `/api/notion/page/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve all blocks from a Notion page
   *
   * @tags Notion
   * @name NotionBlocksDetail
   * @summary Get page blocks
   * @request GET:/api/notion/blocks/{id}
   * @secure
   */
  notionBlocksDetail = (id: string, params: RequestParams = {}) =>
    this.request<
      {
        results?: {
          /** Block ID */
          id?: string;
          /** Block type (paragraph, heading_1, etc.) */
          type?: string;
          /** Block content */
          content?: object;
        }[];
      },
      Error
    >({
      path: `/api/notion/blocks/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve a specific block by ID
   *
   * @tags Notion
   * @name NotionBlockDetail
   * @summary Get specific block
   * @request GET:/api/notion/block/{id}
   * @secure
   */
  notionBlockDetail = (id: string, params: RequestParams = {}) =>
    this.request<
      {
        /** Block ID */
        id?: string;
        /** Block type */
        type?: string;
        /** Block content */
        content?: object;
      },
      Error
    >({
      path: `/api/notion/block/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Create or update a Notion block with new content
   *
   * @tags Notion
   * @name NotionBlockCreate
   * @summary Create or update block
   * @request POST:/api/notion/block/{id}
   * @secure
   */
  notionBlockCreate = (
    id: string,
    data: {
      /** Block content data */
      content?: object;
      /** Block type (paragraph, heading, etc.) */
      type?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Block ID */
        id?: string;
        /** Success message */
        message?: string;
      },
      Error
    >({
      path: `/api/notion/block/${id}`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a Notion block (requires paid subscription)
   *
   * @tags Notion
   * @name NotionBlockDelete
   * @summary Delete block
   * @request DELETE:/api/notion/block/{id}
   * @secure
   */
  notionBlockDelete = (id: string, params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/notion/block/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Render a Notion block as HTML (requires paid subscription)
   *
   * @tags Notion
   * @name NotionRenderBlockDetail
   * @summary Render block as HTML
   * @request GET:/api/notion/render-block/{id}
   * @secure
   */
  notionRenderBlockDetail = (id: string, params: RequestParams = {}) =>
    this.request<string, Error>({
      path: `/api/notion/render-block/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description Retrieve information about a Notion database
   *
   * @tags Notion
   * @name NotionDatabaseDetail
   * @summary Get Notion database
   * @request GET:/api/notion/database/{id}
   * @secure
   */
  notionDatabaseDetail = (id: string, params: RequestParams = {}) =>
    this.request<NotionDatabase, Error>({
      path: `/api/notion/database/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Query a Notion database to retrieve pages/entries
   *
   * @tags Notion
   * @name NotionDatabaseQueryDetail
   * @summary Query Notion database
   * @request GET:/api/notion/database/query/{id}
   * @secure
   */
  notionDatabaseQueryDetail = (
    id: string,
    query?: {
      /** Filter criteria (JSON string) */
      filter?: string;
      /** Sort criteria (JSON string) */
      sorts?: string;
      /**
       * Number of results per page
       * @min 1
       * @max 100
       * @default 50
       */
      page_size?: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        results?: {
          /** Page ID */
          id?: string;
          /** Page properties */
          properties?: object;
        }[];
        /** Whether there are more results */
        has_more?: boolean;
        /** Cursor for next page */
        next_cursor?: string;
      },
      Error
    >({
      path: `/api/notion/database/query/${id}`,
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Disconnect the user's Notion integration and remove stored tokens
   *
   * @tags Notion
   * @name NotionDisconnectCreate
   * @summary Disconnect from Notion
   * @request POST:/api/notion/disconnect
   * @secure
   */
  notionDisconnectCreate = (params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/notion/disconnect`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve a specific parser rule by ID for the authenticated user
   *
   * @tags Parser Rules
   * @name RulesFindDetail
   * @summary Find parser rule
   * @request GET:/api/rules/find/{id}
   * @secure
   */
  rulesFindDetail = (id: string, params: RequestParams = {}) =>
    this.request<
      {
        /** Rule ID */
        id?: string;
        /** Rule name */
        name?: string;
        /** Regular expression pattern */
        pattern?: string;
        /** Replacement text */
        replacement?: string;
        /** Whether rule is enabled */
        enabled?: boolean;
      },
      Error
    >({
      path: `/api/rules/find/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Create a new parser rule for text processing and card generation
   *
   * @tags Parser Rules
   * @name RulesCreateCreate
   * @summary Create parser rule
   * @request POST:/api/rules/create/{id}
   * @secure
   */
  rulesCreateCreate = (
    id: string,
    data: {
      /** Rule name */
      name: string;
      /** Regular expression pattern to match */
      pattern: string;
      /** Replacement text or pattern */
      replacement: string;
      /**
       * Whether rule is enabled
       * @default true
       */
      enabled?: boolean;
      /** Rule execution priority */
      priority?: number;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Created rule ID */
        id?: string;
        /** Success message */
        message?: string;
      },
      Error
    >({
      path: `/api/rules/create/${id}`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Create a new setting configuration for the authenticated user
   *
   * @tags Settings
   * @name SettingsCreateCreate
   * @summary Create user setting
   * @request POST:/api/settings/create/{id}
   * @secure
   */
  settingsCreateCreate = (
    id: string,
    data: {
      /** Card formatting and generation options */
      cardOptions?: object;
      /** Content conversion preferences */
      conversionOptions?: object;
      /** Template-specific settings */
      templateSettings?: object;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Setting ID */
        id?: string;
        /** Success message */
        message?: string;
      },
      Error
    >({
      path: `/api/settings/create/${id}`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a specific setting configuration for the authenticated user
   *
   * @tags Settings
   * @name SettingsDeleteCreate
   * @summary Delete user setting
   * @request POST:/api/settings/delete/{id}
   * @secure
   */
  settingsDeleteCreate = (id: string, params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/settings/delete/${id}`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve a specific setting configuration for the authenticated user
   *
   * @tags Settings
   * @name SettingsFindDetail
   * @summary Find user setting
   * @request GET:/api/settings/find/{id}
   * @secure
   */
  settingsFindDetail = (id: string, params: RequestParams = {}) =>
    this.request<
      {
        /** Setting ID */
        id?: string;
        /** Card formatting options */
        cardOptions?: object;
        /** Content conversion preferences */
        conversionOptions?: object;
      },
      Error
    >({
      path: `/api/settings/find/${id}`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve the default card options and conversion settings
   *
   * @tags Settings
   * @name SettingsDefaultList
   * @summary Get default settings
   * @request GET:/api/settings/default
   * @secure
   */
  settingsDefaultList = (params: RequestParams = {}) =>
    this.request<
      {
        /** Default card formatting options */
        cardOptions?: object;
        /** Default conversion settings */
        conversionOptions?: object;
      },
      any
    >({
      path: `/api/settings/default`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve detailed information about available card options and their configurations
   *
   * @tags Settings
   * @name SettingsCardOptionsList
   * @summary Get card option details
   * @request GET:/api/settings/card-options
   * @secure
   */
  settingsCardOptionsList = (params: RequestParams = {}) =>
    this.request<
      {
        options?: {
          /** Option name */
          name?: string;
          /** Option data type */
          type?: string;
          /** Option description */
          description?: string;
          /** Default value for the option */
          defaultValue?: any;
        }[];
      },
      any
    >({
      path: `/api/settings/card-options`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Create a new Anki card template for the authenticated user
   *
   * @tags Templates
   * @name TemplatesCreateCreate
   * @summary Create template
   * @request POST:/api/templates/create
   * @secure
   */
  templatesCreateCreate = (
    data: {
      /** Template name */
      name: string;
      /** HTML template for the front of the card */
      frontTemplate: string;
      /** HTML template for the back of the card */
      backTemplate: string;
      /** CSS styling for the template */
      css?: string;
      /** Template description */
      description?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** Template ID */
        id?: string;
        /** Success message */
        message?: string;
      },
      Error
    >({
      path: `/api/templates/create`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a template created by the authenticated user
   *
   * @tags Templates
   * @name TemplatesDeleteCreate
   * @summary Delete template
   * @request POST:/api/templates/delete
   * @secure
   */
  templatesDeleteCreate = (
    data: {
      /** Template ID to delete */
      id: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<Success, Error>({
      path: `/api/templates/delete`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Upload a file to be converted to Anki flashcards. This endpoint is public but has origin restrictions.
   *
   * @tags Upload
   * @name UploadFileCreate
   * @summary Upload a file
   * @request POST:/api/upload/file
   * @secure
   */
  uploadFileCreate = (
    data: {
      /**
       * The file to upload (PDF, DOCX, etc.)
       * @format binary
       */
      file?: File;
      /** JSON string with conversion options */
      options?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<Upload, Error>({
      path: `/api/upload/file`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });
  /**
   * @description Import a file from Dropbox to be converted to Anki flashcards
   *
   * @tags Upload
   * @name UploadDropboxCreate
   * @summary Upload from Dropbox
   * @request POST:/api/upload/dropbox
   * @secure
   */
  uploadDropboxCreate = (
    data: {
      /**
       * Dropbox share link to the file
       * @format uri
       */
      link: string;
      /** Original filename */
      filename?: string;
      /** Upload and conversion options */
      options?: object;
    },
    params: RequestParams = {},
  ) =>
    this.request<Upload, Error>({
      path: `/api/upload/dropbox`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Import a file from Google Drive to be converted to Anki flashcards
   *
   * @tags Upload
   * @name UploadGoogleDriveCreate
   * @summary Upload from Google Drive
   * @request POST:/api/upload/google_drive
   * @secure
   */
  uploadGoogleDriveCreate = (
    data: {
      /** Google Drive file ID */
      fileId?: string;
      /** Original filename */
      filename?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<Upload, Error>({
      path: `/api/upload/google_drive`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve all uploads belonging to the authenticated user
   *
   * @tags Upload
   * @name UploadMineList
   * @summary Get user's uploads
   * @request GET:/api/upload/mine
   * @secure
   */
  uploadMineList = (params: RequestParams = {}) =>
    this.request<Upload[], Error>({
      path: `/api/upload/mine`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Retrieve all conversion jobs belonging to the authenticated user
   *
   * @tags Jobs
   * @name UploadJobsList
   * @summary Get user's conversion jobs
   * @request GET:/api/upload/jobs
   * @secure
   */
  uploadJobsList = (params: RequestParams = {}) =>
    this.request<
      {
        id?: number;
        status?: "pending" | "processing" | "completed" | "failed";
        title?: string;
        /** @format date-time */
        created_at?: string;
      }[],
      Error
    >({
      path: `/api/upload/jobs`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a specific conversion job belonging to the authenticated user
   *
   * @tags Jobs
   * @name UploadJobsDelete
   * @summary Delete a conversion job
   * @request DELETE:/api/upload/jobs/{id}
   * @secure
   */
  uploadJobsDelete = (id: number, params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/upload/jobs/${id}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Delete a specific upload belonging to the authenticated user
   *
   * @tags Upload
   * @name UploadMineDelete
   * @summary Delete an upload
   * @request DELETE:/api/upload/mine/{key}
   * @secure
   */
  uploadMineDelete = (key: string, params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/upload/mine/${key}`,
      method: "DELETE",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Set a new password using a reset token received via email
   *
   * @tags Authentication
   * @name UsersNewPasswordCreate
   * @summary Set new password
   * @request POST:/api/users/new-password
   * @secure
   */
  usersNewPasswordCreate = (
    data: {
      /** Reset token from email */
      token: string;
      /**
       * New password (minimum 8 characters)
       * @minLength 8
       */
      password: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<Success, Error>({
      path: `/api/users/new-password`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Send a password reset email to the user
   *
   * @tags Authentication
   * @name UsersForgotPasswordCreate
   * @summary Request password reset
   * @request POST:/api/users/forgot-password
   * @secure
   */
  usersForgotPasswordCreate = (
    data: {
      /**
       * User email address
       * @format email
       */
      email: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<Success, Error>({
      path: `/api/users/forgot-password`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Logout the authenticated user and invalidate session
   *
   * @tags Authentication
   * @name UsersLogoutCreate
   * @summary Logout user
   * @request POST:/api/users/logout
   * @secure
   */
  usersLogoutCreate = (params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/users/logout`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Authenticate user with email and password
   *
   * @tags Authentication
   * @name UsersLoginCreate
   * @summary Login user
   * @request POST:/api/users/login
   * @secure
   */
  usersLoginCreate = (
    data: {
      /**
       * User email address
       * @format email
       */
      email: string;
      /** User password */
      password: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** JWT authentication token */
        token?: string;
        user?: User;
      },
      Error
    >({
      path: `/api/users/login`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Create a new user account
   *
   * @tags Authentication
   * @name UsersRegisterCreate
   * @summary Register new user
   * @request POST:/api/users/register
   * @secure
   */
  usersRegisterCreate = (
    data: {
      /**
       * User email address
       * @format email
       */
      email: string;
      /**
       * User password (minimum 8 characters)
       * @minLength 8
       */
      password: string;
      /** User's full name */
      name?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<
      {
        /** JWT authentication token */
        token?: string;
        user?: User;
      },
      Error
    >({
      path: `/api/users/register`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Handle password reset token and redirect to reset page
   *
   * @tags Authentication
   * @name UsersRDetail
   * @summary Password reset redirect
   * @request GET:/api/users/r/{id}
   * @secure
   */
  usersRDetail = (id: string, params: RequestParams = {}) =>
    this.request<any, void | string>({
      path: `/api/users/r/${id}`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description Permanently delete the authenticated user's account and all associated data
   *
   * @tags Users
   * @name UsersDeleteAccountCreate
   * @summary Delete user account
   * @request POST:/api/users/delete-account
   * @secure
   */
  usersDeleteAccountCreate = (params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/users/delete-account`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Cancel the authenticated user's active subscription without deleting the account
   *
   * @tags Users
   * @name UsersCancelSubscriptionCreate
   * @summary Cancel user subscription
   * @request POST:/api/users/cancel-subscription
   * @secure
   */
  usersCancelSubscriptionCreate = (params: RequestParams = {}) =>
    this.request<Success, Error>({
      path: `/api/users/cancel-subscription`,
      method: "POST",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Get debugging information about the current user session (development only)
   *
   * @tags Debug
   * @name UsersDebugLocalsList
   * @summary Get debug information
   * @request GET:/api/users/debug/locals
   * @secure
   */
  usersDebugLocalsList = (params: RequestParams = {}) =>
    this.request<Record<string, any>, Error>({
      path: `/api/users/debug/locals`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Link an email address to the authenticated user's account
   *
   * @tags Users
   * @name UsersLinkEmailCreate
   * @summary Link email to account
   * @request POST:/api/users/link_email
   * @secure
   */
  usersLinkEmailCreate = (
    data: {
      /**
       * Email address to link
       * @format email
       */
      email: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<Success, Error>({
      path: `/api/users/link_email`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      format: "json",
      ...params,
    });
  /**
   * @description Initiate Google OAuth authentication flow
   *
   * @tags Authentication
   * @name UsersAuthGoogleList
   * @summary Google OAuth authentication
   * @request GET:/api/users/auth/google
   * @secure
   */
  usersAuthGoogleList = (params: RequestParams = {}) =>
    this.request<any, void>({
      path: `/api/users/auth/google`,
      method: "GET",
      secure: true,
      ...params,
    });
  /**
   * @description Get the authenticated user's avatar/profile picture
   *
   * @tags Users
   * @name UsersAvatarList
   * @summary Get user avatar
   * @request GET:/api/users/avatar
   * @secure
   */
  usersAvatarList = (params: RequestParams = {}) =>
    this.request<
      {
        /**
         * Avatar image URL
         * @format uri
         */
        avatar?: string;
      },
      Error
    >({
      path: `/api/users/avatar`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Returns the current version and build information of the API
   *
   * @tags System
   * @name VersionList
   * @summary Get API version information
   * @request GET:/api/version
   * @secure
   */
  versionList = (params: RequestParams = {}) =>
    this.request<Version, Error>({
      path: `/api/version`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
  /**
   * @description Check if the authenticated user has an active subscription
   *
   * @tags Payments
   * @name StripeSubscriptionStatusList
   * @summary Check user subscription status
   * @request GET:/api/stripe/subscription-status
   * @secure
   */
  stripeSubscriptionStatusList = (params: RequestParams = {}) =>
    this.request<
      {
        authenticated?: boolean;
        hasActiveSubscription?: boolean;
        user?: {
          email?: string;
          name?: string;
          patreon?: boolean;
        };
      },
      void
    >({
      path: `/api/stripe/subscription-status`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
