"use client";

import { Children, isValidElement, type ChangeEvent, type SelectHTMLAttributes } from "react";
import { Select, type OpcionSelect } from "./Select";

// Compatibilidad para migrar selects existentes sin repetir opciones ni lógica.
export function SelectConFlecha({ className, children, onChange, value, defaultValue, "aria-label": ariaLabel, disabled, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const opciones: OpcionSelect[] = Children.toArray(children).flatMap((hijo) => {
    if (!isValidElement<{ value?: string; children?: React.ReactNode }>(hijo) || hijo.type !== "option") return [];
    return [{ valor: String(hijo.props.value ?? ""), etiqueta: String(hijo.props.children ?? "") }];
  });
  const valor = String(value ?? defaultValue ?? "");

  return <Select
    value={valor}
    options={opciones}
    className={className}
    disabled={disabled}
    ariaLabel={ariaLabel ?? String(props.name ?? "Selector")}
    onChange={(siguiente) => onChange?.({ target: { value: siguiente }, currentTarget: { value: siguiente } } as ChangeEvent<HTMLSelectElement>)}
  />;
}
