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

import { Error } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Search<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Access the search functionality (requires authentication)
   *
   * @tags Frontend
   * @name SearchList
   * @summary Search page (authenticated)
   * @request GET:/search
   * @secure
   */
  searchList = (params: RequestParams = {}) =>
    this.request<string, Error>({
      path: `/search`,
      method: "GET",
      secure: true,
      ...params,
    });
}
