import {
  ChevronRight
} from "lucide-react";

import type {
  BancosBreadcrumbItem,
  BancosSection
} from "./BancosNavigation.types";

import {
  BancosNavigationModel
} from "./BancosNavigation.types";

import "./BancosBreadcrumbs.css";


type BancosBreadcrumbsProps = {

  items:
    BancosBreadcrumbItem[];

  activeKey:
    BancosSection;

  onNavigate?:
    (
      target:
        BancosSection
    ) => void;
};


export function BancosBreadcrumbs({
  items,
  activeKey,
  onNavigate
}: BancosBreadcrumbsProps) {

  return (
    <nav
      className=
        "mb-breadcrumbs"

      aria-label=
        "Ruta de navegación del módulo Bancos"
    >

      <ol
        className=
          "mb-breadcrumbs__list"
      >

        {items.map(
          (
            item,
            index
          ) => {

            const esActual =
              item.key ===
                activeKey;


            const puedeNavegar =
              BancosNavigationModel
                .puedeNavegar(
                  item,
                  activeKey
                ) &&
              Boolean(
                onNavigate
              );


            return (
              <li
                key={
                  item.key
                }

                className=
                  "mb-breadcrumbs__item"
              >

                {index > 0 ? (

                  <ChevronRight
                    className=
                      "mb-breadcrumbs__separator"

                    size={
                      15
                    }

                    strokeWidth={
                      1.8
                    }

                    aria-hidden=
                      "true"
                  />

                ) : null}


                {puedeNavegar ? (

                  <button
                    type=
                      "button"

                    className=
                      "mb-breadcrumbs__link"

                    onClick={() =>
                      onNavigate?.(
                        item.target
                      )
                    }
                  >
                    {item.label}
                  </button>

                ) : (

                  <span
                    className={
                      esActual
                        ? "mb-breadcrumbs__label mb-breadcrumbs__label--current"
                        : "mb-breadcrumbs__label mb-breadcrumbs__label--context"
                    }

                    aria-current={
                      esActual
                        ? "page"
                        : undefined
                    }
                  >
                    {item.label}
                  </span>

                )}

              </li>
            );
          }
        )}

      </ol>

    </nav>
  );
}
