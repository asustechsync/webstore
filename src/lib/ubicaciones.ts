const ABREVIATURAS_DEPARTAMENTOS: Record<string, string> = {
  AMAZONAS: "AMA",
  ANCASH: "ANC",
  APURIMAC: "APU",
  AREQUIPA: "ARE",
  AYACUCHO: "AYA",
  CAJAMARCA: "CAJ",
  CALLAO: "CAL",
  CUSCO: "CUS",
  HUANCAVELICA: "HVC",
  HUANUCO: "HCO",
  ICA: "ICA",
  JUNIN: "JUN",
  "LA LIBERTAD": "LLB",
  LAMBAYEQUE: "LAM",
  LIMA: "LIM",
  LORETO: "LOR",
  "MADRE DE DIOS": "MDD",
  MOQUEGUA: "MOQ",
  PASCO: "PAS",
  PIURA: "PIU",
  PUNO: "PUN",
  "SAN MARTIN": "SMA",
  TACNA: "TAC",
  TUMBES: "TUM",
  UCAYALI: "UCA",
};

export function formatearNombreUbicacion(valor: string) {
  return valor
    .toLocaleLowerCase("es-PE")
    .replace(/(^|[\s-])(\p{L})/gu, (_, separador: string, letra: string) => `${separador}${letra.toLocaleUpperCase("es-PE")}`);
}

export function abreviarDepartamento(departamento: string) {
  const normalizado = departamento.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return ABREVIATURAS_DEPARTAMENTOS[normalizado] ?? normalizado.slice(0, 3);
}
