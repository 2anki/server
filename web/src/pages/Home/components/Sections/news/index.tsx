import ReadMore from './ReadMore';

interface NewsEntryProps {
  title: string;
  description: string;
  link: string;
}

export default function NewsEntry({
  title,
  description,
  link,
}: NewsEntryProps) {
  return (
    <div className="card">
      <div className="card-content">
        <h3 className="title is-4">{title}</h3>
        <p className="content">{description}</p>
        <ReadMore href={link} />
      </div>
    </div>
  );
}
