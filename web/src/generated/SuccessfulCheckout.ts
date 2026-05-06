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

export class SuccessfulCheckout<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Display the successful checkout confirmation page after payment
   *
   * @tags Payments
   * @name SuccessfulCheckoutList
   * @summary Successful checkout page
   * @request GET:/successful-checkout
   * @secure
   */
  successfulCheckoutList = (params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/successful-checkout`,
      method: "GET",
      secure: true,
      ...params,
    });
}
