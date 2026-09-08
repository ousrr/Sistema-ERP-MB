import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  DollarSign,
  Landmark,
} from "lucide-react";

export const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "compras",
    label: "Compras",
    icon: ShoppingCart,
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: Package,
  },
  {
    id: "cxp",
    label: "Cuentas por Pagar",
    icon: CreditCard,
  },
  {
    id: "cxc",
    label: "Cuentas por Cobrar",
    icon: DollarSign,
  },
  {
    id: "bancos",
    label: "Bancos",
    icon: Landmark,
  },
] as const;

export type NavigationId =
  (typeof navigationItems)[number]["id"];