interface ObjecTypeProps {
  type: string;
}

export default function ObjectType(props: ObjecTypeProps) {
  const { type } = props;
  return (
    <div className="control is-hidden-mobile">
      <div className="tags has-addons">
        <span className="tag is-small">Type</span>
        <span className="tag is-link">{type}</span>
      </div>
    </div>
  );
}
