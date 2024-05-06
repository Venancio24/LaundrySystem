import { simboloMoneda } from "../../../services/global";

export function formatValue(value) {
  const isNumericValue = !Number.isNaN(parseFloat(value));

  if (isNumericValue) {
    const formattedValue = `${simboloMoneda} ${value}`.replace(
      /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
      ","
    );
    return formattedValue;
  }

  return "";
}

export function redondearNumero(input) {
  // Convertir el input a número
  let numero = Number(input);

  // Verificar si el número es un entero o tiene decimales
  if (Number.isInteger(numero)) {
    // Si es un entero, simplemente devolver el número
    return numero;
  } else {
    // Si tiene decimales, ajustar a dos decimales sin redondear hacia arriba
    let base = Math.floor(numero * 100) / 100; // Redondeo hacia abajo para dos decimales
    let decimales = (numero - base).toFixed(3).slice(2, 5); // Extraer los decimales como string

    // Verificar condiciones específicas para ajustar el formato
    if (decimales.length >= 2) {
      if (decimales[1] === "0") {
        // Si el segundo decimal es 0, ajustar para mostrar un solo decimal
        return Math.floor(numero * 10) / 10;
      } else {
        // En caso contrario, devolver el número ajustado a dos decimales sin redondear arriba
        return base.toFixed(1);
      }
    } else {
      // Si solo hay un decimal o ninguno, devolver el número como está
      return base;
    }
  }
}
