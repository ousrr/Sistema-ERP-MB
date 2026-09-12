export type Row = Record<string, string | null>;
export type Catalogs = Record<string, Row[]>;
export type Field = {
  name: string; label: string; kind: "id" | "integer" | "money" | "percent" | "flag" | "state" | "date" | "text";
  group: string; help?: string; optional?: boolean; createOnly?: boolean; catalog?: string; max?: string;
};
export type Config = {
  key: string; id: string; title: string; singular: string; description: string;
  active: string; inactive: string; states: string[]; fields: Field[]; resolver: Field[];
  defaults: Row; columns: { label: string; value: (r: Row) => string }[];
};

