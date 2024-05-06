/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import {
  handleGetInfoPago,
  roundDecimal,
} from "../../../../../../../utils/functions";
// import "./ticket50.scss";
import "./ticket80.scss";

import Pet from "./pet.jpg";
import AhorroPet from "./petAhorro.jpg";
import { ReactComponent as Logo } from "../../../../../../../utils/img/Logo/logo.svg";

import moment from "moment";
import axios from "axios";
import {
  nameImpuesto,
  politicaAbandono,
  simboloMoneda,
} from "../../../../../../../services/global";
import { useSelector } from "react-redux";

const Ticket = React.forwardRef((props, ref) => {
  const sizePaper80 = true;
  const { showDescripcion, tipoTicket, infoOrden, InfoNegocio } = props;
  const [listPromos, setListPromos] = useState([]);
  const [sPago, setSPago] = useState();

  const InfoServicios = useSelector((state) => state.servicios.listServicios);
  const InfoCategorias = useSelector(
    (state) => state.categorias.listCategorias
  );

  const getInfoDelivery = () => {
    const ICategory = InfoCategorias.find((cat) => cat.nivel === "primario");
    const IService = InfoServicios.find(
      (service) =>
        service.idCategoria === ICategory._id && service.nombre === "Delivery"
    );

    return IService;
  };

  const montoDelivery = (dataC) => {
    if (dataC.Modalidad === "Delivery") {
      return infoOrden.Items.find((p) => p.item === "Delivery").total;
    } else {
      return 0;
    }
  };

  const calcularFechaFutura = (numeroDeDias) => {
    const fechaActual = moment();
    const nuevaFecha = fechaActual.clone().add(numeroDeDias, "days");
    return nuevaFecha.format("D [de] MMMM[, del] YYYY");
  };

  const handleGetInfoPromo = async (codigoCupon) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/get-info-promo/${codigoCupon}`
      );
      return response.data;
    } catch (error) {
      // Maneja los errores aquí
      console.error(
        `No se pudo obtener información de la promoción - ${error}`
      );
      throw error; // Lanza el error para que pueda ser capturado por Promise.all
    }
  };

  const handleShowDateTime = (date, hour) => {
    // Concatena la fecha y hora
    const datetimeString = `${date} ${hour}`;

    // Parsea la fecha y hora usando Moment.js
    const dateTime = moment(datetimeString, "YYYY-MM-DD HH:mm");

    if (sizePaper80) {
      // Si sizePaper80 es true, devuelve el formato combinado
      return dateTime.format("D [de] MMMM, YYYY / hh:mm a");
    } else {
      // Si sizePaper80 es false, devuelve un objeto con fecha y hora separados
      const formattedDate = dateTime.format("D [de] MMMM, YYYY");
      const formattedTime = dateTime.format("dddd / hh:mm a");

      // Construye el objeto de respuesta
      const result = {
        FInfoD: formattedDate,
        SInfoD: formattedTime,
      };

      return result;
    }
  };

  const spaceLine = (txt) => {
    // Separar el string por saltos de línea ("\n")
    const lines = txt.split("\n");

    // Devolver un elemento <ol> con elementos <li> numerados para cada línea
    return (
      <ol className="formatted-list">
        {lines.map((line, index) => (
          <li key={index} className="formatted-line">
            <p>
              {line.includes("✔ ") ? (
                <>
                  {line.replace("✔ ", ``)}
                  <br />
                </>
              ) : (
                line
              )}
            </p>
          </li>
        ))}
      </ol>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (infoOrden?.gift_promo.length > 0) {
        const promos = infoOrden.gift_promo;

        try {
          // Utiliza Promise.all para esperar a que todas las llamadas asincrónicas se completen
          const results = await Promise.all(
            promos.map(async (promo) => {
              return await handleGetInfoPromo(promo.codigoCupon);
            })
          );

          setListPromos(results);
        } catch (error) {
          // Maneja los errores aquí
          console.error(
            "Error al obtener información de las promociones:",
            error
          );
        }
      }
    };

    fetchData();
  }, [infoOrden]);

  useEffect(() => {
    if (infoOrden) {
      setSPago(handleGetInfoPago(infoOrden.ListPago, infoOrden.totalNeto));
    }
  }, [infoOrden]);

  return (
    <>
      {infoOrden ? (
        <div className="container-ticket" ref={ref}>
          <div className="body-orden-service">
            <div className="receipt_header">
              <div className="name-bussiness">
                <Logo className="img-logo" />
              </div>
              {sizePaper80 === false ? (
                <>
                  <div className="i-negocio">
                    <span>Horario de Atencion</span>
                    {InfoNegocio.horario.map((hor, index) => (
                      <span key={index}>{hor.horario}</span>
                    ))}
                  </div>
                  <div className="i-negocio">
                    <span>Direccion</span>
                    <span>{InfoNegocio?.direccion}</span>
                  </div>
                  <div className="i-negocio " style={{ paddingBottom: "0" }}>
                    <span>Telefono de contacto</span>
                    <div className="flexd">
                      {InfoNegocio.contacto.map((num, index) => (
                        <span key={index}> {num.numero}</span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td>Direccion:</td>
                      <td>{InfoNegocio?.direccion}</td>
                    </tr>
                    <tr>
                      <td>Telefono:</td>
                      <td className="u-line">
                        {InfoNegocio.contacto.map((num, index) => (
                          <span key={index}>
                            {num.numero}{" "}
                            {index !== InfoNegocio.contacto.length - 1 && (
                              <>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;</>
                            )}
                          </span>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <td>Horario:</td>
                      <td className="m-line">
                        {InfoNegocio.horario.map((hor, index) => (
                          <span key={index}>{hor.horario}</span>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="info-client">
              <div className="cod-rec">
                <p className="l-text">
                  <span className="title-o">ORDEN DE SERVICIO</span>
                  <span className="number-o">
                    N° {String(infoOrden.codRecibo).padStart(4, "0")}
                  </span>
                </p>
              </div>
              <div className="info-detail">
                <table className="tb-date">
                  <tbody>
                    <tr>
                      <td>Ingreso:</td>
                      <td>
                        <div className="date-time">
                          {sizePaper80 ? (
                            <span>
                              {handleShowDateTime(
                                infoOrden.dateRecepcion.fecha,
                                infoOrden.dateRecepcion.hora
                              )}
                            </span>
                          ) : (
                            <>
                              <span>
                                {
                                  handleShowDateTime(
                                    infoOrden.dateRecepcion.fecha,
                                    infoOrden.dateRecepcion.hora
                                  ).SInfoD
                                }
                              </span>
                              <span>
                                {
                                  handleShowDateTime(
                                    infoOrden.dateRecepcion.fecha,
                                    infoOrden.dateRecepcion.hora
                                  ).FInfoD
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Entrega:</td>
                      <td>
                        <div className="date-time">
                          {sizePaper80 ? (
                            <span>
                              {handleShowDateTime(
                                infoOrden.datePrevista.fecha,
                                infoOrden.datePrevista.hora
                              )}
                            </span>
                          ) : (
                            <>
                              <span>
                                {
                                  handleShowDateTime(
                                    infoOrden.datePrevista.fecha,
                                    infoOrden.datePrevista.hora
                                  ).SInfoD
                                }
                              </span>
                              <span>
                                {
                                  handleShowDateTime(
                                    infoOrden.datePrevista.fecha,
                                    infoOrden.datePrevista.hora
                                  ).FInfoD
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="i-cliente">
                  <div className="h-cli">
                    <span>Nombres del Cliente</span>
                    <h2>{infoOrden.Nombre}</h2>
                  </div>
                  <table className="tb-info-cliente">
                    <tbody>
                      {infoOrden.direccion ? (
                        <tr className="f-direccion">
                          <td>Direccion : </td>
                          <td>&nbsp;&nbsp;{infoOrden.direccion}</td>
                        </tr>
                      ) : null}
                      {infoOrden.celular ? (
                        <tr className="f-telf">
                          <td>Telefono : </td>
                          <td>&nbsp;&nbsp;{infoOrden.celular}</td>
                        </tr>
                      ) : null}
                      <tr className="f-attend">
                        <td>Atentido por : </td>
                        <td>&nbsp;&nbsp;{infoOrden.attendedBy.name}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="receipt_body">
              <div className="items">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Item</th>
                      <th>Servicio</th>
                      {!tipoTicket ? (
                        <>
                          <th>Total</th>
                        </>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {infoOrden.Items.filter(
                      (p) => p.identificador !== getInfoDelivery()?._id
                    ).map((p, index) => (
                      <React.Fragment key={`${infoOrden._id}-${index}`}>
                        <tr>
                          <td>•</td>
                          <td>{p.item}</td>
                          <td>{roundDecimal(p.cantidad)}</td>
                          {!tipoTicket ? (
                            <>
                              <td>{roundDecimal(p.total)}</td>
                            </>
                          ) : null}
                        </tr>
                        {showDescripcion && p.descripcion ? (
                          <tr className="fila_descripcion">
                            <td colSpan={!tipoTicket ? 4 : 3}>
                              {spaceLine(p.descripcion)}
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </tbody>
                  {!tipoTicket ? (
                    <tfoot>
                      <tr>
                        <td colSpan="3">Subtotal :</td>
                        <td>
                          {roundDecimal(
                            infoOrden.Items.reduce(
                              (total, p) => total + parseFloat(p.total),
                              0
                            ) - montoDelivery(infoOrden)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3">Delivery :</td>
                        <td>{montoDelivery(infoOrden)}</td>
                      </tr>
                      {infoOrden.factura ? (
                        <tr>
                          <td colSpan="3">
                            {nameImpuesto} (
                            {infoOrden.cargosExtras.igv.valor * 100} %) :
                          </td>
                          <td>{infoOrden.cargosExtras.igv.importe}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <td colSpan="3">Descuento :</td>
                        <td>{infoOrden.descuento ? infoOrden.descuento : 0}</td>
                      </tr>
                      <tr>
                        <td colSpan="3">Total a Pagar :</td>
                        <td>{roundDecimal(infoOrden.totalNeto)}</td>
                      </tr>
                      {sPago?.estado === "Incompleto" ? (
                        <>
                          <tr>
                            <td colSpan="3">A Cuenta :</td>
                            <td>{sPago?.pago}</td>
                          </tr>
                          <tr>
                            <td colSpan="3">Deuda Pendiente :</td>
                            <td>{sPago?.falta}</td>
                          </tr>
                        </>
                      ) : null}
                    </tfoot>
                  ) : null}
                </table>
                {infoOrden.modoDescuento === "Promocion" &&
                infoOrden.descuento > 0 &&
                !tipoTicket ? (
                  <div className="space-ahorro">
                    <h2 className="title">
                      ! Felicidades Ahorraste {simboloMoneda}
                      {infoOrden?.descuento} ¡
                    </h2>
                    <div className="info-promo">
                      <span>Usando nuestras promociones :</span>
                      <div className="body-ahorro">
                        <div className="list-promo">
                          <ul>
                            {infoOrden.cargosExtras.beneficios.promociones.map(
                              (p) => (
                                <li key={p.codigoCupon}>{p.descripcion}</li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="img-pet">
                          <img src={AhorroPet} alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            {!tipoTicket ? (
              <>
                <div className="monto-final">
                  <h2>
                    Pago : {simboloMoneda}
                    {sPago?.pago}
                  </h2>
                  <h3 className={`${infoOrden.factura ? null : "sf"} estado`}>
                    {sPago?.estado.toUpperCase()}
                  </h3>
                  {infoOrden.factura ? (
                    <h2 className="cangeo-factura">
                      Canjear Orden de Servicio por Factura
                    </h2>
                  ) : null}
                </div>
                <p className="aviso">
                  NOTA: <span>{politicaAbandono.mResaltado}</span>
                  {politicaAbandono.mGeneral}
                </p>
                {listPromos.length > 0 ? (
                  <div className="container-promociones">
                    {listPromos?.map((promo, index) => (
                      <div className="item-promo" key={index}>
                        <div className="info-promo">
                          <div>
                            <h1>PROMOCION:</h1>
                            <h2
                              style={{
                                fontSize: "0.8em",
                                textAlign: "justify",
                              }}
                            >
                              {promo.descripcion}
                            </h2>
                            <h2 className="cod-i">
                              codigo: {promo.codigoCupon}
                            </h2>
                          </div>
                          <div className="img-pet">
                            <img src={Pet} alt="" />
                          </div>
                        </div>
                        <div className="notice">
                          <span>CÁNJEELO EN SU PRÓXIMA ORDEN</span>
                        </div>
                        <h2
                          className="vigencia"
                          style={{ float: "right", fontSize: "0.9em" }}
                        >
                          Vencimiento : {calcularFechaFutura(promo.vigencia)}
                        </h2>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div>Loading...</div>
        </>
      )}
    </>
  );
});

export default Ticket;
