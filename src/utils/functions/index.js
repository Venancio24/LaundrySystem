export * from './dateCurrent/dateCurrent';
export * from './formatNumber/formatNumber';
export * from './roundDecimal/roundDecimal';
export * from './showProduct/showProduct';
export * from './showHorario/showHorario';

export const handleGetInfoPago = (listPago, totalNeto) => {
  let sPagos = 0;
  let estado;
  if (listPago.length > 0) {
    sPagos = listPago.reduce((accumulatedTotal, item) => accumulatedTotal + item.total, 0);

    if (totalNeto > 0) {
      if (sPagos >= totalNeto) {
        estado = 'Completo';
      } else if (sPagos < totalNeto && sPagos > 0) {
        estado = 'Incompleto';
      } else if (sPagos === 0) {
        estado = 'Pendiente';
      }
    } else {
      estado = 'Completo';
    }
  } else {
    estado = 'Pendiente';
  }
  return {
    pago: sPagos,
    falta: +(+totalNeto - +sPagos).toFixed(1),
    estado,
  };
};

export const cLetter = (texto) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};
