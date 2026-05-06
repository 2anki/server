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

export class IndexHtml<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Serve the main application index page
   *
   * @tags Frontend
   * @name IndexHtmlList
   * @summary Get main application page
   * @request GET:/index.html
   * @secure
   */
  indexHtmlList = (params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/index.html`,
      method: "GET",
      secure: true,
      ...params,
    });
}
