import ArrowRight from '../../../../../components/icons/ArrowRight';

interface ReadMoreProps {
  href: string;
}

export default function ReadMore({ href }: ReadMoreProps) {
  return (
    <div className="is-flex">
      <a className="is-uppercase has-text-weight-bold" href={href}>
        Read more
      </a>
      <ArrowRight innerFill="#5397f5" />
    </div>
  );
}
