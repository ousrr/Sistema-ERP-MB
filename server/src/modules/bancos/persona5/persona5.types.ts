export type FieldKind = "id" | "integer" | "money" | "percent" | "flag" | "state" | "date" | "text";
export type Field = { name: string; kind: FieldKind; max?: string; optional?: boolean; createOnly?: boolean };
export type Row = Record<string, string | null>;
export type Definition = {
  key: string; pkg: string; id: string; states: readonly string[];
  inactive: string; fields: readonly Field[];
  resolver: readonly Field[]; catalogs: Readonly<Record<string, string>>;
};
export interface Repository {
  list(): Promise<Row[]>;
  get(id: string): Promise<Row | null>;
  create(data: Row): Promise<Row>;
  update(id: string, data: Row): Promise<Row>;
  state(id: string, state: string): Promise<Row>;
  resolve(data: Row): Promise<Row | null>;
  catalogs(): Promise<Record<string, Row[]>>;
}
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

