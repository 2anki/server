interface NotionObject {
  object: string;
  title: string;
  url: string;
  icon?: string;
  id: string;
  data?: Response;
  isFavorite?: boolean;
  parent?: { type: string };
}

export default NotionObject;
