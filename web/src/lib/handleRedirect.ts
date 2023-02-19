function handleRedirect(response: Response): void {
  const currentPathName = window.location.pathname;
  if (response.url.includes('login') && !currentPathName.includes('login')) {
    window.location.href = '/login#login';
  }
}

export default handleRedirect;
