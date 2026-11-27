interface MaterialIconProps {
  name: string;
  className?: string;
}

function MaterialIcon({ name, className }: MaterialIconProps) {
  return (
    <span
      aria-hidden="true"
      className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
    >
      {name}
    </span>
  );
}

export default MaterialIcon;
