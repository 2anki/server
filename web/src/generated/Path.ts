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

import { HttpClient, RequestParams } from "./http-client";

export class Path<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Serve the main application for all non-API routes (SPA routing)
   *
   * @tags Frontend
   * @name GetPath
   * @summary Catch-all frontend routes
   * @request GET:/{path}
   * @secure
   */
  getPath = (path?: string, params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/${path}`,
      method: "GET",
      secure: true,
      ...params,
    });
}
