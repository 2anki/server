import { renderToStaticMarkup } from 'react-dom/server';
import axios from 'axios';

export default async function renderIcon(icon?: string) {
  if (!icon) {
    return null;
  }
  if (icon.startsWith('http')) {
    let validIcon = true;
    await axios.get(icon).catch(function (error) {
      if (error.response && error.response.status === 404) {
        validIcon = false;
      }
    });
    if (!validIcon) {
      return null;
    }
    return renderToStaticMarkup(<img src={icon} width="32" />);
  }

  return renderToStaticMarkup(<span className="icon">{icon}</span>);
}
