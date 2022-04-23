interface MenuItemProps {
  name: string;
  link: string;
  currentPath: string;
}

export default function MenuItem(props: MenuItemProps) {
  const { name, link, currentPath } = props;

  return (
    <li>
      <a
        className={`${currentPath === link ? 'is-active' : ''}`}
        href={link}
      >
        {name}
      </a>
    </li>
  );
}
