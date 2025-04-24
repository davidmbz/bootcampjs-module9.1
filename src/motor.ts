import {
  TipoIva,
  LineaTicket,
  TotalPorTipoIva,
  ResultadoLineaTicket,
  TicketFinal,
} from "./model";

// Porcentaje de IVA
const porcentajesIva = (tipo: TipoIva): number => {
  switch (tipo) {
    case "general":
      return 21;
    case "reducido":
      return 10;
    case "superreducidoA":
      return 5;
    case "superreducidoB":
      return 4;
    case "superreducidoC":
      return 0;
    default:
      return 0;
  }
};

// Calcular precio con IVA
export const calcularPrecioConIva = (
  precioSinIva: number,
  tipoIva: TipoIva
): number => {
  const ivaPorcentaje = porcentajesIva(tipoIva);
  return precioSinIva + (precioSinIva * ivaPorcentaje) / 100;
};

// Redondear los precios a dos decimales
export const redondearPrecio = (precio: number): number => {
  return parseFloat(precio.toFixed(2));
};

// Redondear los totales acumulados
export const redondearTotales = (ticket: TicketFinal): TicketFinal => {
  ticket.total.totalSinIva = redondearPrecio(ticket.total.totalSinIva);
  ticket.total.totalIva = redondearPrecio(ticket.total.totalIva);
  ticket.total.totalConIva = redondearPrecio(ticket.total.totalConIva);
  return ticket;
};

// Actualizar el desglose de IVA
export const actualizarDesgloseIva = (
  acumulador: TicketFinal,
  tipoIva: TipoIva,
  precioSinIva: number,
  precioConIva: number
) => {
  const tipoIvaExistente = acumulador.desgloseIva.find(
    (iva) => iva.tipoIva === tipoIva
  );

  const cantidadIva = precioConIva - precioSinIva;

  if (tipoIvaExistente) {
    tipoIvaExistente.cuantia += cantidadIva;
  } else {
    const nuevoDesglose: TotalPorTipoIva = {
      tipoIva,
      cuantia: cantidadIva,
    };
    acumulador.desgloseIva.push(nuevoDesglose);
  }
};

// Calcular una línea del ticket
export const calcularLineaTicket = (
  linea: LineaTicket,
  acumulador: TicketFinal
): TicketFinal => {
  const precioSinIva = linea.producto.precio * linea.cantidad;
  const precioConIva = calcularPrecioConIva(
    precioSinIva,
    linea.producto.tipoIva
  );

  const precioSinIvaRedondeado = redondearPrecio(precioSinIva);
  const precioConIvaRedondeado = redondearPrecio(precioConIva);

  const lineaResultado: ResultadoLineaTicket = {
    nombre: linea.producto.nombre,
    cantidad: linea.cantidad,
    precioSinIva: precioSinIvaRedondeado,
    tipoIva: linea.producto.tipoIva,
    precioConIva: precioConIvaRedondeado,
  };

  acumulador.lineas.push(lineaResultado);

  acumulador.total.totalSinIva += precioSinIva;
  acumulador.total.totalIva += precioConIva - precioSinIva;
  acumulador.total.totalConIva += precioConIva;

  actualizarDesgloseIva(
    acumulador,
    linea.producto.tipoIva,
    precioSinIva,
    precioConIva
  );

  return acumulador;
};

// Calcular el ticket
export const calculaTicket = (lineasTicket: LineaTicket[]): TicketFinal => {
  const resultadoInicial: TicketFinal = {
    lineas: [],
    total: {
      totalSinIva: 0,
      totalConIva: 0,
      totalIva: 0,
    },
    desgloseIva: [],
  };

  const resultadoFinal = lineasTicket.reduce(
    (acumulador, linea) => calcularLineaTicket(linea, acumulador),
    resultadoInicial
  );

  return redondearTotales(resultadoFinal);
};
