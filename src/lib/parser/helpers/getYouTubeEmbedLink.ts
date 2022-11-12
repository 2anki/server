export default function getYouTubeEmbedLink(id: string): string {
  return `https://www.youtube.com/embed/${id}?`.replace(/"/, '');
}
