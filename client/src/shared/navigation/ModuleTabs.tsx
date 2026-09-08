type ModuleTab = {
  label: string;
};

type ModuleTabsProps = {
  items: ModuleTab[];
};

export function ModuleTabs({ items }: ModuleTabsProps) {
  return (
    <nav className="module-tabs" aria-label="Navegación interna">
      {items.map((item) => (
        <span key={item.label} className="module-tabs__item">
          {item.label}
        </span>
      ))}
    </nav>
  );
}
