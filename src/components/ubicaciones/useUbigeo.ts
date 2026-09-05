"use client";

import { useEffect, useMemo, useState } from "react";
// Los 24 departamentos pesan 2 KB y hacen falta apenas se abre el formulario:
// ese sí viaja en el bundle. Provincias (19 KB) y distritos (236 KB) no.
import departamentosData from "@/data/ubigeos/1_ubigeo_departamentos.json";

export type Departamento = { id: number; departamento: string; ubigeo: string };
export type Provincia = { id: number; provincia: string; departamento_id: number };
export type Distrito = { id: number; distrito: string; provincia_id: number };

export const DEPARTAMENTOS: Departamento[] = departamentosData.ubigeo_departamentos;

/*
 * Los dos JSON grandes se piden una sola vez por sesión y se guardan acá.
 * Si dos formularios los necesitan (checkout y direcciones), el segundo
 * reutiliza la misma promesa en vez de volver a descargar.
 */
let promesaProvincias: Promise<Provincia[]> | null = null;
let promesaDistritos: Promise<Distrito[]> | null = null;

function cargarProvincias() {
  promesaProvincias ??= import("@/data/ubigeos/2_ubigeo_provincias.json").then(
    (modulo) => modulo.default.ubigeo_provincias,
  );
  return promesaProvincias;
}

function cargarDistritos() {
  promesaDistritos ??= import("@/data/ubigeos/3_ubigeo_distritos.json").then(
    (modulo) => modulo.default.ubigeo_distritos,
  );
  return promesaDistritos;
}

/**
 * Ubigeos del Perú para los formularios de dirección.
 *
 * Antes los tres JSON se importaban de forma estática dentro de componentes
 * cliente, así que los 236 KB de distritos entraban al bundle del checkout
 * aunque nadie llegara a abrir ese select. Acá se piden recién cuando la
 * persona elige departamento (provincias) y provincia (distritos), que es
 * cuando se necesitan de verdad.
 *
 * Recibe los nombres tal como se guardan en la base y devuelve ya resueltos
 * el registro seleccionado y las listas que corresponden al siguiente nivel.
 */
export function useUbigeo(nombreDepartamento: string, nombreProvincia: string) {
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [distritos, setDistritos] = useState<Distrito[]>([]);

  const departamento = useMemo(
    () => DEPARTAMENTOS.find((item) => item.departamento === nombreDepartamento) ?? null,
    [nombreDepartamento],
  );

  // Con un departamento elegido ya se pueden pedir sus provincias. Se piden
  // todas juntas (son 19 KB) y se filtran en memoria.
  useEffect(() => {
    if (!departamento) return;
    let vigente = true;
    cargarProvincias().then((datos) => {
      if (vigente) setProvincias(datos);
    });
    return () => {
      vigente = false;
    };
  }, [departamento]);

  const provinciasDisponibles = useMemo(
    () => (departamento ? provincias.filter((item) => item.departamento_id === departamento.id) : []),
    [provincias, departamento],
  );

  const provincia = useMemo(
    () =>
      provinciasDisponibles.find((item) => item.provincia === nombreProvincia) ?? null,
    [provinciasDisponibles, nombreProvincia],
  );

  useEffect(() => {
    if (!provincia) return;
    let vigente = true;
    cargarDistritos().then((datos) => {
      if (vigente) setDistritos(datos);
    });
    return () => {
      vigente = false;
    };
  }, [provincia]);

  const distritosDisponibles = useMemo(
    () => (provincia ? distritos.filter((item) => item.provincia_id === provincia.id) : []),
    [distritos, provincia],
  );

  return {
    departamentos: DEPARTAMENTOS,
    departamento,
    provincia,
    provinciasDisponibles,
    distritosDisponibles,
    /* El select de provincias queda deshabilitado mientras llega el archivo:
       sin esto se ve vacío un instante y parece que no hay provincias. */
    cargandoProvincias: Boolean(departamento) && provincias.length === 0,
    cargandoDistritos: Boolean(provincia) && distritos.length === 0,
  };
}
