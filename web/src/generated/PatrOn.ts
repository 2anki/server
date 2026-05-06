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

export class PatrOn<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Handle Patreon authentication callback and redirects (supports /patreon)
   *
   * @tags Authentication
   * @name PatrOnList
   * @summary Patreon integration
   * @request GET:/patr*on
   * @secure
   */
  patrOnList = (params: RequestParams = {}) =>
    this.request<string, void>({
      path: `/patr*on`,
      method: "GET",
      secure: true,
      ...params,
    });
}
