export interface Props {
  name: string;
  description: string;
  title: string;
  profile: string;
}

export default function Testimonial({
  name, description, title, profile,
}: Props) {
  return (
    <div className="is-flex column m-4 is-flex-direction-column box has-background-white has-text-grey-dark">
      <div className="is-flex">
        {profile && (
        <div className="is-flex is-align-items-center is-justify-content-start mt-4">
          <div className="image is-48x48">
            <img alt="profil" src={profile} className="is-rounded" />
          </div>
        </div>
        )}
        <div className="is-flex is-flex-direction-column is-justify-content-center ml-2 is-align-content-space-between">
          <span className="font-semibold has-text-weight-bold">{name}</span>
          <span className="is-size-7 is-flex is-align-items-center">
            {title}
          </span>
        </div>
      </div>
      <p>
        <span className="font-bold has-text-primary is-size-5">“</span>
        {description}
        <span className="font-bold has-text-primary is-size-5">”</span>
      </p>
    </div>
  );
}
