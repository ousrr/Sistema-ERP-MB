import {
  Search,
  Bell,
} from "lucide-react";

interface HeaderProps {
  title?: string;

  searchPlaceholder?: string;

  searchValue?: string;

  onSearchChange?: (
    value: string
  ) => void;

  showSearch?: boolean;

  showNotifications?: boolean;
}

export function Header({
  title = "Sistema ERP",

  searchPlaceholder =
    "Buscar...",

  searchValue = "",

  onSearchChange,

  showSearch = true,

  showNotifications = true,
}: HeaderProps) {
  return (
    <header className="erp-header">

      {/* TÍTULO */}
      <div className="erp-header__title">
        {title}
      </div>

      {/* ACCIONES DERECHA */}
      <div className="erp-header__actions">

        {showSearch && (
          <div className="erp-header__search">

            <Search
              size={16}
              className="erp-header__search-icon"
            />

            <input
              type="search"
              value={searchValue}
              onChange={(event) =>
                onSearchChange?.(
                  event.target.value
                )
              }
              placeholder={
                searchPlaceholder
              }
              className="erp-header__search-input"
            />

          </div>
        )}

        {showNotifications && (
          <button
            type="button"
            className="erp-header__notification"
            aria-label="Notificaciones"
          >
            <Bell size={17} />

            <span className="erp-header__notification-dot" />
          </button>
        )}

      </div>

    </header>
  );
}