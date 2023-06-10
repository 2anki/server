interface Prop {
  title: string;
}

export const BookmarkTitle = ({ title }: Prop) => {
  if (!title) {
    return null;
  }
  return <div className="bookmark-title">{title}</div>;
};
