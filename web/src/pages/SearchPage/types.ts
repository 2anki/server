export interface NewRule {
  id: number;
  object_id: string;
  flashcard_is: string[];
  deck_is: string[];
  sub_deck_is: string[];
  tags_is: string;
  owner: number;
  email_notification: boolean;
}
