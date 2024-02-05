/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';

import Prendas from '../../../../../utils/img/Prendas/index';
import { GetDeliverysID } from '../../../../../redux/actions/aDelivery';
import './detalle.scss';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import moment from 'moment';
import { simboloMoneda } from '../../../../../services/global';
import { DateDetail_Hora, cLetter, handleGetInfoPago } from '../../../../../utils/functions';

const Detalle = ({ infoD }) => {
  const [ordern, setOrder] = useState();
  const [statePago, setStatePago] = useState();
  const dispatch = useDispatch();
  const iDelivery = useSelector((state) => state.delivery.infoDeliveryID);

  const calculateHeight = (description, fontSize, width, padding, lineHeightValue) => {
    // Crear un elemento de textarea oculto para medir su contenido.
    const hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.style.visibility = 'hidden';
    hiddenTextarea.style.position = 'absolute';
    hiddenTextarea.style.top = '-9999px';
    hiddenTextarea.style.padding = `${padding}`;
    hiddenTextarea.style.lineHeight = '1.2';
    hiddenTextarea.style.letterSpacing = '2px';
    hiddenTextarea.style.float = `left`;
    hiddenTextarea.style.fontSize = fontSize; // Establecer el tamaño de fuente.
    hiddenTextarea.style.width = `${width}px`; // Establecer el ancho del textarea.
    hiddenTextarea.value = description; // Establecer el contenido del textarea.

    document.body.appendChild(hiddenTextarea);

    // Calcular la altura necesaria según el contenido.
    const calculatedHeight = hiddenTextarea.scrollHeight;

    // Eliminar el textarea oculto.
    document.body.removeChild(hiddenTextarea);

    return calculatedHeight;
  };

  const handleDescDelivery = (word) => {
    const palabras = word.split(' ');
    const resultado = palabras.slice(2).join(' ');

    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
  };

  const handleDateLarge = (fecha) => {
    const fechaObjeto = moment(fecha);
    const fechaFormateada = fechaObjeto.format('dddd D [de] MMMM, YYYY');
    return fechaFormateada;
  };

  const handleHour = (hora) => {
    const hora12 = moment(hora, 'HH:mm').format('h:mm A');
    return hora12;
  };

  useEffect(() => {
    if (ordern?.Modalidad === 'Delivery') {
      dispatch(GetDeliverysID(ordern._id));
    }
  }, [ordern]);

  useEffect(() => {
    setOrder(infoD);
    if (infoD) {
      const sPago = handleGetInfoPago(infoD.ListPago, infoD.totalNeto);
      setStatePago(sPago);
    }
  }, [infoD]);

  return (
    <div className="almacen-detail">
      <div className="inWaiting">
        <h1>{ordern?.onWaiting.showText} en Espera</h1>
      </div>
      <h1 className="mod-ord">{ordern?.Modalidad}</h1>
      {ordern?.Modalidad === 'Delivery' && iDelivery ? (
        <div className="list-delivery">
          {iDelivery.map((e) => (
            <div className="gasto-d" key={e._id}>
              <div className="dsc_d">
                <span>{handleDescDelivery(e.descripcion)}</span>
              </div>
              <div className="cant_d">
                <span>
                  {simboloMoneda} {e.monto}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <table className="product-t">
        <thead>
          <tr>
            <th>Cantidad</th>
            <th>Producto</th>
            <th>Descripción</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {ordern?.DetalleProducto.map((p, index) => (
            <tr key={`${p._id}${index}`}>
              <td>{p.cantidad}</td>
              <td>{p.producto}</td>
              <td className="tADescription">
                <div className="contentDes">
                  <div id={`${index}-dsp`} className="textarea-container">
                    <textarea id={`${index}-txtA`} className="hide" rows={5} value={p.descripcion} readOnly={true} />
                    <button
                      type="button"
                      className="expand-button"
                      onClick={() => {
                        const element = document.getElementById(`${index}-dsp`);
                        const textArea = document.getElementById(`${index}-txtA`);

                        if (element) {
                          const hideElement = element.querySelector('.hide');
                          const showElement = element.querySelector('.show');
                          const iconElement = element.querySelector('#ico-action');

                          let txtAreaShow = null;
                          if (hideElement) {
                            hideElement.classList.replace('hide', 'show');
                            iconElement.classList.replace('fa-chevron-down', 'fa-chevron-up');

                            txtAreaShow = element.querySelector('.show');

                            const width = window.getComputedStyle(txtAreaShow).width;
                            const fontSize = window.getComputedStyle(txtAreaShow).fontSize;
                            const padding = getComputedStyle(txtAreaShow).padding;
                            const lineHeightValue = getComputedStyle(txtAreaShow).lineHeight;

                            txtAreaShow.style.height = `${calculateHeight(
                              p.descripcion,
                              fontSize,
                              width,
                              padding,
                              lineHeightValue
                            )}px`;
                          } else if (showElement) {
                            txtAreaShow = element.querySelector('.show');
                            showElement.classList.replace('show', 'hide');
                            txtAreaShow.style.height = null;
                            iconElement.classList.replace('fa-chevron-up', 'fa-chevron-down');
                          }
                        }
                      }}
                    >
                      <i id="ico-action" className="fa-solid fa-chevron-down" />
                    </button>
                  </div>
                </div>
              </td>
              <td>{p.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="list-extra">
        {ordern?.Factura === true ? (
          <div className="item-extra fact">
            <div className="title">
              <span>Factura</span>
            </div>
            <div className="monto">
              <span>{ordern?.CargosExtras.igv.importe}</span>
            </div>
          </div>
        ) : null}
        {ordern?.Descuento > 0 ? (
          <div className="item-extra desc">
            <div className="title">
              <span>Descuento</span>
            </div>
            <div className="monto">
              <span>
                {simboloMoneda} {ordern?.Descuento}
              </span>
            </div>
          </div>
        ) : null}
      </div>
      <div className="more-a">
        <h3>Total: {ordern?.totalNeto}</h3>
      </div>
      <div className="list-pagos">
        <div className="title">Lista de Pagos</div>
        <ul>
          {ordern?.ListPago.map((p, index) => (
            <li className="i-pago" key={index}>
              <span className="_fecha">{DateDetail_Hora(p.date.fecha, p.date.hora)}</span>
              <span className="_monto">
                {simboloMoneda}
                {p.total}
              </span>
              <span className="_metodopago">{cLetter(p.metodoPago)}</span>
              <span className="_ico">
                {p.metodoPago === 'Tarjeta' ? (
                  <i className="fa-solid fa-credit-card" />
                ) : p.metodoPago === 'Efectivo' ? (
                  <i className="fa-solid fa-sack-dollar" />
                ) : (
                  <i className="fa-solid fa-money-bill-transfer" />
                )}
              </span>
            </li>
          ))}
          <li className="i-final">
            <span></span>
            <span className="if-estado"></span>
            <span className="if-monto">
              <div>
                <div className="l-info">
                  <span>Subtotal :</span>
                </div>
                <div>
                  {simboloMoneda}
                  {statePago?.pago}
                </div>
              </div>
              <div>
                <div className="l-info">
                  <span>Estado :</span>
                </div>
                <div> {statePago?.estado}</div>
              </div>
              {statePago?.estado !== 'Completo' ? (
                <div>
                  <div className="l-info">
                    <span>Falta :</span>
                  </div>
                  <div>
                    {simboloMoneda}
                    {statePago?.falta}
                  </div>
                </div>
              ) : null}
            </span>
            <span></span>
          </li>
        </ul>
      </div>
      <table className="info-table">
        <tbody>
          <tr>
            <td>Fecha Recepcion:</td>
            <td>
              {handleDateLarge(ordern?.FechaIngreso.fecha)} / {handleHour(ordern?.FechaIngreso.hora)}
            </td>
          </tr>
          <tr>
            <td>Fecha Prevista:</td>
            <td>
              {handleDateLarge(ordern?.FechaPrevista.fecha)} / {handleHour(ordern?.FechaPrevista.hora)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Detalle;
