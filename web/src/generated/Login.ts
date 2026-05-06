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

import { User } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Login<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Check if user is authenticated and return user information
   *
   * @tags Authentication
   * @name LoginList
   * @summary Check user authentication
   * @request GET:/login
   * @secure
   */
  loginList = (params: RequestParams = {}) =>
    this.request<
      | User
      | {
          /** @example false */
          authenticated?: boolean;
        },
      any
    >({
      path: `/login`,
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });
}
