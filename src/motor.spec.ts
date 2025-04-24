import { describe, it, expect } from "vitest";
import {
  calcularPrecioConIva,
  redondearPrecio,
  actualizarDesgloseIva,
  calculaTicket,
} from "./motor";
import { TipoIva, LineaTicket, TicketFinal } from "./model";

// Calcular precio con IVA
describe("calcularPrecioConIva", () => {
  // IVA general
  it("debería calcular correctamente el precio con IVA general (21%)", () => {
    // Arrange
    const precio = 100;
    const tipoIva: TipoIva = "general";

    // Act
    const resultado = calcularPrecioConIva(precio, tipoIva);

    // Assert
    expect(resultado).toBe(121);
  });

  // IVA superreducido B
  it("debería calcular correctamente el precio con IVA superreducidoB (4%)", () => {
    // Arrange
    const precio = 50;
    const tipoIva: TipoIva = "superreducidoB";

    // Act
    const resultado = calcularPrecioConIva(precio, tipoIva);

    // Assert
    expect(resultado).toBe(52);
  });

  // Sin IVA
  it("debería calcular correctamente el precio sin IVA (0%)", () => {
    // Arrange
    const precio = 75;
    const tipoIva: TipoIva = "sinIva";

    // Act
    const resultado = calcularPrecioConIva(precio, tipoIva);

    // Assert
    expect(resultado).toBe(75);
  });
});

// Redondear precio a dos decimales
describe("redondearPrecio", () => {
  it("debería redondear correctamente hacia arriba", () => {
    // Arrange
    const precio = 12.345;

    // Act
    const resultado = redondearPrecio(precio);

    // Assert
    expect(resultado).toBe(12.35);
  });

  it("debería redondear correctamente hacia abajo", () => {
    // Arrange
    const precio = 9.994;

    // Act
    const resultado = redondearPrecio(precio);

    // Assert
    expect(resultado).toBe(9.99);
  });
});

// Actualizar desglose IVA
describe("actualizarDesgloseIva", () => {
  it("debería agregar nuevo tipo de IVA si no existe", () => {
    // Arrange
    const ticket: TicketFinal = {
      lineas: [],
      total: {
        totalSinIva: 0,
        totalConIva: 0,
        totalIva: 0,
      },
      desgloseIva: [],
    };
    const tipoIva: TipoIva = "reducido";
    const sinIva = 100;
    const conIva = 110;

    // Act
    actualizarDesgloseIva(ticket, tipoIva, sinIva, conIva);

    // Assert
    expect(ticket.desgloseIva).toEqual([{ tipoIva: "reducido", cuantia: 10 }]);
  });

  it("debería acumular el coste si el tipo de IVA ya existe", () => {
    // Arrange
    const ticket: TicketFinal = {
      lineas: [],
      total: {
        totalSinIva: 0,
        totalConIva: 0,
        totalIva: 0,
      },
      desgloseIva: [{ tipoIva: "general", cuantia: 21 }],
    };
    const tipoIva: TipoIva = "general";
    const sinIva = 50;
    const conIva = 60.5;

    // Act
    actualizarDesgloseIva(ticket, tipoIva, sinIva, conIva);

    // Assert
    expect(ticket.desgloseIva).toEqual([{ tipoIva: "general", cuantia: 31.5 }]);
  });
});

// Calcular Ticket
describe("calculaTicket", () => {
  it("debería calcular correctamente un ticket con varias líneas y distintos IVAs", () => {
    const lineas: LineaTicket[] = [
      {
        producto: { nombre: "Camiseta", precio: 20, tipoIva: "general" },
        cantidad: 2,
      },
      {
        producto: { nombre: "Libro", precio: 15, tipoIva: "superreducidoB" },
        cantidad: 1,
      },
      {
        producto: { nombre: "Medicamento", precio: 30, tipoIva: "sinIva" },
        cantidad: 1,
      },
    ];

    const resultado = calculaTicket(lineas);

    expect(resultado.lineas.length).toBe(3);
    expect(resultado.total.totalSinIva).toBeCloseTo(85);
    expect(resultado.total.totalConIva).toBeCloseTo(94);
    expect(resultado.total.totalIva).toBeCloseTo(9);

    expect(
      resultado.desgloseIva.find((d) => d.tipoIva === "general")?.cuantia
    ).toBeCloseTo(8.4, 2);
    expect(
      resultado.desgloseIva.find((d) => d.tipoIva === "superreducidoB")?.cuantia
    ).toBeCloseTo(0.6, 2);
    expect(
      resultado.desgloseIva.find((d) => d.tipoIva === "sinIva")?.cuantia
    ).toBeCloseTo(0, 2);
  });
});
