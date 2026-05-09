import { renderToStaticMarkup } from 'react-dom/server';

import instrumentedAxios from '../../observability/instrumentedAxios';

export default async function renderIcon(icon?: string) {
  if (!icon) {
    return null;
  }
  if (icon.startsWith('http') || icon.startsWith('data:image')) {
    if (icon.startsWith('http')) {
      let validIcon = true;
      await instrumentedAxios.get('notion', icon).catch(function (error) {
        if (error.response && error.response.status === 404) {
          validIcon = false;
        }
      });
      if (!validIcon) {
        return null;
      }
    }
    return renderToStaticMarkup(<img src={icon} width="32" />);
  }

  return renderToStaticMarkup(<span className="icon">{icon}</span>);
}
