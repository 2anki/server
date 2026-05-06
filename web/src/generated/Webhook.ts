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

import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Webhook<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description Handle Stripe webhook events for payment processing and subscription management
   *
   * @tags Webhooks
   * @name WebhookCreate
   * @summary Stripe webhook handler
   * @request POST:/webhook
   */
  webhookCreate = (data: object, params: RequestParams = {}) =>
    this.request<void, string>({
      path: `/webhook`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
