interface NotionObject {
  object: string;
  title: string;
  url: string;
  icon?: string;
  id: string;
  data?: any;
  isFavorite?: boolean;
}

export default NotionObject;
