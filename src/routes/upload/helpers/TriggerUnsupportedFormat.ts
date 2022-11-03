export default function TriggerUnsupportedFormat() {
  throw new Error(
    'Markdown support has been removed, please use <a class="button" href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7">HTML</a>'
  );
}
