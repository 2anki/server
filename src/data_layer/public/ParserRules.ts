// @generated
// This file is automatically generated by Kanel. Do not modify manually.

/** Identifier type for public.parser_rules */
export type ParserRulesId = number & { __brand: 'public.parser_rules' };

/** Represents the table public.parser_rules */
export default interface ParserRules {
  id: ParserRulesId;

  object_id: string;

  flashcard_is: string;

  deck_is: string;

  sub_deck_is: string;

  tags_is: string;

  owner: number;

  email_notification: boolean | null;
}

/** Represents the initializer for the table public.parser_rules */
export interface ParserRulesInitializer {
  /** Default value: nextval('slicer_rules_id_seq'::regclass) */
  id?: ParserRulesId;

  object_id: string;

  /** Default value: 'Toggles'::character varying */
  flashcard_is?: string;

  /** Default value: 'Pages'::character varying */
  deck_is?: string;

  /** Default value: 'Pages'::character varying */
  sub_deck_is?: string;

  /** Default value: 'Headings'::character varying */
  tags_is?: string;

  /** Default value: 1 */
  owner?: number;

  /** Default value: false */
  email_notification?: boolean | null;
}

/** Represents the mutator for the table public.parser_rules */
export interface ParserRulesMutator {
  id?: ParserRulesId;

  object_id?: string;

  flashcard_is?: string;

  deck_is?: string;

  sub_deck_is?: string;

  tags_is?: string;

  owner?: number;

  email_notification?: boolean | null;
}
