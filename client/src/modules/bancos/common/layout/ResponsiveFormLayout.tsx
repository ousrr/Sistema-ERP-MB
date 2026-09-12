import type {
  FormHTMLAttributes,
  HTMLAttributes,
  ReactNode
} from "react";

import "./ResponsiveFormLayout.css";


type GridVariant =
  | "identity"
  | "behavior"
  | "summaryFour";


interface FormProps
  extends FormHTMLAttributes<HTMLFormElement> {

  children:
    ReactNode;
}


interface StackProps
  extends HTMLAttributes<HTMLDivElement> {

  children:
    ReactNode;
}


interface GridProps
  extends HTMLAttributes<HTMLDivElement> {

  children:
    ReactNode;

  variant:
    GridVariant;
}


interface CardProps
  extends HTMLAttributes<HTMLDivElement> {

  children:
    ReactNode;

  tone?:
    | "default"
    | "subtle";
}


interface ActionsProps
  extends HTMLAttributes<HTMLDivElement> {

  children:
    ReactNode;
}


export class ResponsiveFormLayoutRules {

  static className(
    base:
      string,

    custom?:
      string
  ): string {

    return [
      base,
      custom
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      );
  }
}


function Form({
  children,
  className,
  ...props
}: FormProps) {

  return (
    <form
      className={
        ResponsiveFormLayoutRules
          .className(
            "mb-responsive-form",
            className
          )
      }

      {...props}
    >
      {children}
    </form>
  );
}


function Stack({
  children,
  className,
  ...props
}: StackProps) {

  return (
    <div
      className={
        ResponsiveFormLayoutRules
          .className(
            "mb-responsive-form__stack",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


function Grid({
  children,
  variant,
  className,
  ...props
}: GridProps) {

  return (
    <div
      className={
        ResponsiveFormLayoutRules
          .className(
            [
              "mb-responsive-form__grid",
              `mb-responsive-form__grid--${variant}`
            ].join(
              " "
            ),
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


function Card({
  children,
  tone = "default",
  className,
  ...props
}: CardProps) {

  return (
    <div
      className={
        ResponsiveFormLayoutRules
          .className(
            [
              "mb-responsive-form__card",
              `mb-responsive-form__card--${tone}`
            ].join(
              " "
            ),
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


function Actions({
  children,
  className,
  ...props
}: ActionsProps) {

  return (
    <div
      className={
        ResponsiveFormLayoutRules
          .className(
            "mb-responsive-form__actions",
            className
          )
      }

      {...props}
    >
      {children}
    </div>
  );
}


export const ResponsiveFormLayout = {

  Form,
  Stack,
  Grid,
  Card,
  Actions

} as const;
