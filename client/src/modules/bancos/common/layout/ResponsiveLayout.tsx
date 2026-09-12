import type {
  HTMLAttributes,
  ReactNode
} from "react";

import "./ResponsiveLayout.css";


type DivProps =
  HTMLAttributes<HTMLDivElement>;


interface ResponsivePageProps
  extends DivProps {

  children:
    ReactNode;
}


interface ResponsiveHeaderProps
  extends DivProps {

  title:
    string;

  description?:
    string;
}


interface ResponsiveToolbarProps
  extends DivProps {

  children:
    ReactNode;
}


interface ResponsiveToolbarItemProps
  extends DivProps {

  children:
    ReactNode;

  kind?:
    | "default"
    | "search"
    | "action";
}


interface ResponsiveFieldProps
  extends DivProps {

  label:
    string;

  htmlFor?:
    string;

  children:
    ReactNode;
}


interface ResponsiveInfoPanelProps
  extends DivProps {

  children:
    ReactNode;
}


interface ResponsiveInfoSectionProps
  extends DivProps {

  children:
    ReactNode;
}


interface ResponsiveTableScrollProps
  extends DivProps {

  children:
    ReactNode;

  minTableWidth?:
    number;
}


interface ResponsiveFooterProps
  extends DivProps {

  children:
    ReactNode;
}


interface ResponsiveFooterActionsProps
  extends DivProps {

  children:
    ReactNode;
}


// =====================================================
// UTILIDAD DE CLASES
//
// Se mantiene dentro del módulo Bancos para que
// cualquier feature reutilice la misma estructura
// responsive sin depender de client/src/shared.
// =====================================================

export class ResponsiveLayoutClassNames {

  static combinar(
    baseClass:
      string,

    customClass?:
      string
  ): string {

    return [
      baseClass,
      customClass
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      );
  }


  static toolbarItem(
    kind:
      ResponsiveToolbarItemProps["kind"] =
        "default",

    customClass?:
      string
  ): string {

    return this.combinar(
      [
        "mb-responsive-toolbar__item",
        `mb-responsive-toolbar__item--${kind}`
      ].join(
        " "
      ),
      customClass
    );
  }
}


// =====================================================
// PÁGINA
// =====================================================

function Page({
  children,
  className,
  ...props
}: ResponsivePageProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-page",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


// =====================================================
// ENCABEZADO
// =====================================================

function Header({
  title,
  description,
  className,
  ...props
}: ResponsiveHeaderProps) {

  return (
    <header
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-header",
            className
          )
      }

      {...props}
    >

      <h1
        className=
          "mb-responsive-header__title"
      >
        {title}
      </h1>


      {description ? (

        <p
          className=
            "mb-responsive-header__description"
        >
          {description}
        </p>

      ) : null}

    </header>
  );
}


// =====================================================
// TOOLBAR
// =====================================================

function Toolbar({
  children,
  className,
  ...props
}: ResponsiveToolbarProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-toolbar",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


function ToolbarItem({
  children,
  kind = "default",
  className,
  ...props
}: ResponsiveToolbarItemProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .toolbarItem(
            kind,
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


// =====================================================
// CAMPO DE TOOLBAR
// =====================================================

function Field({
  label,
  htmlFor,
  children,
  className,
  ...props
}: ResponsiveFieldProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-field",
            className
          )
      }

      {...props}
    >

      <label
        className=
          "mb-responsive-field__label"

        htmlFor={
          htmlFor
        }
      >
        {label}
      </label>


      <div
        className=
          "mb-responsive-field__control"
      >
        {children}
      </div>

    </div>
  );
}


// =====================================================
// PANEL INFORMATIVO
// =====================================================

function InfoPanel({
  children,
  className,
  ...props
}: ResponsiveInfoPanelProps) {

  return (
    <section
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-info",
            className
          )
      }

      {...props}
    >
      {children}
    </section>
  );
}


function InfoSection({
  children,
  className,
  ...props
}: ResponsiveInfoSectionProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-info__section",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


// =====================================================
// TABLA CON SCROLL INTERNO
// =====================================================

function TableScroll({
  children,
  className,
  minTableWidth = 840,
  style,
  ...props
}: ResponsiveTableScrollProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-table-scroll",
            className
          )
      }

      style={{
        ...style,

        ["--mb-table-min-width" as string]:
          `${minTableWidth}px`
      }}

      {...props}
    >
      {children}
    </div>
  );
}


// =====================================================
// PIE DE TABLA
// =====================================================

function Footer({
  children,
  className,
  ...props
}: ResponsiveFooterProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-footer",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


function FooterActions({
  children,
  className,
  ...props
}: ResponsiveFooterActionsProps) {

  return (
    <div
      className={
        ResponsiveLayoutClassNames
          .combinar(
            "mb-responsive-footer__actions",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


// =====================================================
// API DE COMPOSICIÓN REUTILIZABLE
// =====================================================

export const ResponsiveLayout = {

  Page,
  Header,
  Toolbar,
  ToolbarItem,
  Field,
  InfoPanel,
  InfoSection,
  TableScroll,
  Footer,
  FooterActions

} as const;
