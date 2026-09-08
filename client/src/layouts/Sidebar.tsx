import { navigationItems } from "../app/navigation";
import type { NavigationId } from "../app/navigation";

interface SidebarProps {
  activeItem?: NavigationId;

  onNavigate?: (
    item: NavigationId
  ) => void;

  userName?: string;
  userRole?: string;
  userInitials?: string;
}

export function Sidebar({
  activeItem = "bancos",
  onNavigate,
  userName = "Usuario",
  userRole = "Usuario del sistema",
  userInitials = "US",
}: SidebarProps) {
  return (
    <aside className="erp-sidebar">

      {/* LOGO */}
      <div className="erp-sidebar__logo">
        <div className="erp-sidebar__logo-icon">
          E
        </div>

        <span className="erp-sidebar__logo-text">
          System
        </span>
      </div>

      {/* NAVEGACIÓN */}
      <nav
        className="erp-sidebar__navigation"
        aria-label="Menú principal"
      >
        {navigationItems.map(
          ({
            id,
            label,
            icon: Icon,
          }) => {
            const active =
              activeItem === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onNavigate?.(id)
                }
                className={
                  active
                    ? "erp-sidebar__item erp-sidebar__item--active"
                    : "erp-sidebar__item"
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
              >
                <Icon
                  size={16}
                  strokeWidth={2}
                />

                <span>{label}</span>
              </button>
            );
          }
        )}
      </nav>

      {/* USUARIO */}
      <div className="erp-sidebar__profile">
        <div className="erp-sidebar__avatar">
          {userInitials}
        </div>

        <div className="erp-sidebar__profile-data">
          <span className="erp-sidebar__profile-name">
            {userName}
          </span>

          <span className="erp-sidebar__profile-role">
            {userRole}
          </span>
        </div>
      </div>

    </aside>
  );
}