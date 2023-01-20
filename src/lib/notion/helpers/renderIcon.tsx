import { renderToStaticMarkup } from 'react-dom/server';

export default function renderIcon(icon?: string) {
  if (!icon) {
    return null;
  }
  return renderToStaticMarkup(
    icon.startsWith('http') ? (
      <img src={icon} width="32" />
    ) : (
      <span className="icon">{icon}</span>
    )
  );
}
