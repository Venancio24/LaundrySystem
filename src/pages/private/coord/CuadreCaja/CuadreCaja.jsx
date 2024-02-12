/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { DateCurrent } from '../../../../utils/functions/index';
import { TextInput } from '@mantine/core';
import { NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

import { GetDeliverysDate } from '../../../../redux/actions/aDelivery';
import { GetGastoDate } from '../../../../redux/actions/aGasto';
import { GetOrdenServices_Date } from '../../../../redux/actions/aOrdenServices';
import { GetCuadre, GetLastCuadre, SaveCuadre } from '../../../../redux/actions/aCuadre';
import { GetAnuladoId, GetOrderId } from '../../../../services/default.services';

import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import './cuadreCaja.scss';

import { jsPDF } from 'jspdf';
import { PrivateRoutes } from '../../../../models';
import Nota from './Nota/Nota';

import { LS_updateGasto } from '../../../../redux/states/gasto';
import { LS_CancelarDeliveryDevolucion } from '../../../../redux/states/delivery';

import LoaderSpiner from '../../../../components/LoaderSpinner/LoaderSpiner';
import { socket } from '../../../../utils/socket/connect';
import { Notify } from '../../../../utils/notify/Notify';
import { MONTOS_BASE, ingresoDigital, simboloMoneda } from '../../../../services/global';

const CuadreCaja = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [certificateTemplateRef, setCertificateTemplateRef] = useState(null);
  const certificateTemplateRef = useRef(null);

  const [saveActivated, setSaveActivated] = useState(false);

  const infoGastos = useSelector((state) => state.gasto.infoGasto);
  const infoDelivery = useSelector((state) => state.delivery.infoDeliveryDate);
  const infoRegisteredDay = useSelector((state) => state.orden.infoRegisteredDay);
  const infoCuadre = useSelector((state) => state.cuadre.infoCuadreDate);

  const InfoUsuario = useSelector((state) => state.user.infoUsuario);
  const infoRegistered = useSelector((state) => state.orden.registered);
  const infoLastCuadre = useSelector((state) => state.cuadre.lastCuadre);
  const stateActuallyCuadre = useSelector((state) => state.cuadre.stateActuallyCuadre);

  const [stateCuadre, setStateCuadre] = useState();
  const [datePrincipal, setDatePrincipal] = useState({
    fecha: DateCurrent().format4,
    hora: DateCurrent().format3,
  });

  const [iClienteEfectivo, setIClienteEfectivo] = useState();
  const [iClienteTransferencia, setIClienteTransferencia] = useState();
  const [iClienteTarjeta, setIClienteTarjeta] = useState();

  const [iGastos, setIGastos] = useState([]);

  const [pedidosPagadosEfectivo, setPedidosPagadosEfectivo] = useState(0);
  const [pedidosPagadosTransferencia, setPedidosPagadosTransferencia] = useState(0);
  const [pedidosPagadosTarjeta, setPedidosPedidosPagadosTarjeta] = useState(0);

  const [gastos, setGastos] = useState('');

  const [pruebaState, setPruebaState] = useState();

  const [onLoading, setOnLoading] = useState(false);

  const [iState, setIState] = useState({
    montoCaja: 0,
    corte: 0,
    cajaFinal: 0,
    cajaInicial: 0,
    gastos: 0,
    cajaActual: 0,
    notas: [],
  });

  const handleCompareDates = (date) => {
    const dPrincipal = moment(datePrincipal.fecha, 'YYYY-MM-DD');
    const dToCompare = moment(date, 'YYYY-MM-DD');

    const sMayor = dPrincipal.isAfter(dToCompare);
    // const sMenor = dPrincipal.isBefore(dToCompare);
    const sIgual = dPrincipal.isSame(dToCompare);

    return sMayor || sIgual ? true : false;
  };

  const calculateTotalNeto = (Montos) => {
    let totalNeto = 0;
    if (Montos && Montos.length > 0) {
      totalNeto = Montos.reduce((sum, monto) => {
        const total = parseFloat(monto.total) || 0;

        return sum + total;
      }, 0);
    }

    return totalNeto.toFixed(2);
  };

  const handleSaved = (clonedElement) => {
    const cjFinal = parseFloat(calculateTotalNeto(pruebaState.Montos) - pruebaState.corte).toFixed(2);
    dispatch(
      SaveCuadre({
        infoCuadre: {
          ...pruebaState,
          cajaInicial:
            datePrincipal.fecha === DateCurrent().format4 && infoLastCuadre.dateCuadre.fecha !== DateCurrent().format4
              ? infoLastCuadre.cajaFinal
              : pruebaState.cajaInicial,
          corte: iState.corte,
          cajaFinal: cjFinal,
          dateCuadre: { fecha: datePrincipal.fecha, hora: DateCurrent().format3 },
        },
        rol: InfoUsuario.rol,
      })
    ).then((res) => {
      if (res.payload) {
        handleGeneratePdf(clonedElement);
      }
    });
  };

  const openModal = (value) => {
    const clonedElement = certificateTemplateRef.current.cloneNode(true);

    modals.openConfirmModal({
      title: value === true ? 'Guardar y Generar PDF' : 'Generar PDF',
      centered: true,
      children: (
        <Text size="sm">{`${
          value === true
            ? '¿ Estas seguro que quieres quieres guardar y generar el PDF ?'
            : '¿ Estas seguro que quieres generar el PDF ?'
        }`}</Text>
      ),
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'green' },
      onCancel: () => {
        setSaveActivated(false);
        setOnLoading(false);
      },
      onConfirm: () => {
        setOnLoading(true);
        setTimeout(() => {
          value === true ? handleSaved(clonedElement) : handleGeneratePdf(clonedElement);
        }, 500);
      },
    });
  };

  const handleGeneratePdf = (clonedElement) => {
    clonedElement.style.transform = 'scale(0.338)';
    clonedElement.style.transformOrigin = 'left top';

    // Establecer altura máxima y márgenes
    clonedElement.style.maxHeight = '842px'; // Altura máxima del tamaño A4

    const doc = new jsPDF({
      format: 'a4',
      unit: 'px',
    });

    doc.html(clonedElement, {
      callback: function (pdf) {
        pdf.save(`Informe (${datePrincipal.fecha}).pdf`);
        setTimeout(() => {
          navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`);
        }, 1000);
      },
    });
  };

  const sumaMontos = (clientes) => {
    // console.log(clientes.filter((cliente) => cliente.metodoPago !== 'YAPE'));
    return clientes
      .filter((cliente) => !(cliente.typeRegistro === 'pendiente' && cliente.estadoPrenda === 'anulado'))
      .reduce((sum, cliente) => sum + (parseFloat(cliente.total) || 0), 0)
      .toFixed(2);
  };

  const MontoPrevisto = () => {
    const MontoInicial = parseFloat(
      datePrincipal.fecha === DateCurrent().format4 && infoLastCuadre.dateCuadre.fecha !== DateCurrent().format4
        ? infoLastCuadre.cajaFinal
        : pruebaState.cajaInicial
    );

    return (MontoInicial + parseFloat(pedidosPagadosEfectivo) - parseFloat(gastos)).toFixed(2);
  };

  const handleGetInfoCuadre = async () => {
    await dispatch(GetCuadre(datePrincipal.fecha));
    await dispatch(GetDeliverysDate(datePrincipal.fecha));
    await dispatch(GetGastoDate(datePrincipal.fecha));
    await dispatch(GetOrdenServices_Date(datePrincipal.fecha));
  };

  useEffect(() => {
    const procesarClientesAprobados = async (clientes) => {
      const clientesAprobadosPromises = await Promise.all(
        clientes.map(async (d) => {
          const valid = async () => {
            if (d.Pago !== 'Pendiente') {
              if (d.estadoPrenda === 'anulado') {
                const infoAnulacion = await GetAnuladoId(d._id);
                if (infoAnulacion.fecha === datePrincipal.fecha) {
                  return false;
                } else {
                  return true;
                }
              } else {
                return true;
              }
            }

            return false;
          };

          if (await valid()) {
            return d;
          }

          return null;
        })
      );
      const clientesAprobados = await Promise.all(clientesAprobadosPromises);
      return clientesAprobados.filter((cliente) => cliente !== null);
    };

    const procesarData = async () => {
      if (infoRegisteredDay) {
        const clientesAprobados = await procesarClientesAprobados(infoRegisteredDay);

        const agruparPagosPorMetodo = (facturas, fechaPrincipal) => {
          const resultados = [];
          let index = 0;

          facturas.forEach((factura) => {
            const pagosPorMetodo = {};

            factura.ListPago.forEach((pago) => {
              // Verifica si la factura es antigua y si la fecha del pago es distinta de la fecha de recepción
              const esPagoValido =
                (factura.modeRegistro !== 'antiguo' && pago.date.fecha === fechaPrincipal) ||
                (factura.modeRegistro === 'antiguo' &&
                  pago.date.fecha !== factura.dateRecepcion.fecha &&
                  pago.date.fecha === fechaPrincipal);

              if (esPagoValido) {
                const metodo = pago.metodoPago;

                if (!pagosPorMetodo[metodo]) {
                  pagosPorMetodo[metodo] = {
                    _id: factura._id,
                    codRecibo: factura.codRecibo,
                    Modalidad: factura.Modalidad,
                    estadoPrenda: factura.estadoPrenda,
                    metodoPago: metodo,
                    Nombre: factura.Nombre,
                    total: 0,
                  };
                }
                pagosPorMetodo[metodo].total += pago.total;
              }
            });

            for (const metodo in pagosPorMetodo) {
              resultados.push({ ...pagosPorMetodo[metodo], index: index++ });
            }
          });

          return resultados;
        };

        const resultadosAgrupados = await agruparPagosPorMetodo(clientesAprobados, datePrincipal.fecha);

        //const facturados = clientesAprobados.filter((d) => d.factura === true);

        const cEfectivo = resultadosAgrupados.filter((d) => d.metodoPago === 'Efectivo');
        const cTransferencia = resultadosAgrupados.filter((d) => d.metodoPago === ingresoDigital);
        const cTarjeta = resultadosAgrupados.filter((d) => d.metodoPago === 'Tarjeta');

        setPedidosPagadosEfectivo(sumaMontos(cEfectivo));
        setPedidosPagadosTransferencia(sumaMontos(cTransferencia));
        setPedidosPedidosPagadosTarjeta(sumaMontos(cTarjeta));

        setIClienteEfectivo(cEfectivo);
        setIClienteTransferencia(cTransferencia);
        setIClienteTarjeta(cTarjeta);
      }

      if (infoDelivery) {
        const infoProductPromises = infoDelivery
          .filter((d) => d.fecha === datePrincipal.fecha)
          .map(async (d) => {
            const orderByDelivery = await GetOrderId(d.idCliente);

            if (orderByDelivery?.estadoPrenda === 'anulado') {
              const infoAnulacion = await GetAnuladoId(orderByDelivery._id);

              const commonProperties = {
                descripcion: `${d.descripcion} - ${d.name}`,
                fecha: d.fecha,
                hora: d.hora,
                monto: d.monto,
                _state: 'anulado',
              };

              return {
                ...commonProperties,
                cSuma: infoAnulacion.fecha === d.fecha ? false : true,
              };
            } else {
              return {
                descripcion: `${d.descripcion} - ${d.name}`,
                fecha: d.fecha,
                hora: d.hora,
                monto: d.monto,
                _state: 'activo',
                cSuma: true,
              };
            }
          });

        const infoProduct = await Promise.all(infoProductPromises);
        const iGasto = infoGastos.map((g) => {
          return {
            ...g,
            _state: 'activo',
            cSuma: true,
          };
        });

        const gastosFinal = [...iGasto, ...infoProduct].flat(1);

        setIGastos(gastosFinal);
        const sumaMontosGasto = gastosFinal
          .reduce((sum, gastos) => {
            return sum + (gastos.cSuma ? parseFloat(gastos.monto) : 0);
          }, 0)
          .toFixed(2);

        setGastos(sumaMontosGasto);
      }
    };

    procesarData();
  }, [infoRegisteredDay, infoGastos, infoDelivery, datePrincipal]);

  useEffect(() => {
    handleGetInfoCuadre();
  }, [datePrincipal]);

  useEffect(() => {
    setPruebaState();

    const dPrincipal = moment(datePrincipal.fecha, 'YYYY-MM-DD');
    const dToCompare = moment(infoLastCuadre.dateCuadre.fecha, 'YYYY-MM-DD');

    const sMayor = dPrincipal.isAfter(dToCompare);
    const sMenor = dPrincipal.isBefore(dToCompare);
    const sIgual = dPrincipal.isSame(dToCompare);

    const chageInfo = (info) => {
      setTimeout(() => {
        setPruebaState(info);
      }, 1000);
    };

    if (infoCuadre && sMenor) {
      chageInfo(infoCuadre);
    } else {
      const infoBase = {
        dateCuadre: {
          fecha: datePrincipal.fecha,
          hora: '',
        },
        Montos: MONTOS_BASE,
        cajaInicial: '0',
        cajaFinal: '0',
        corte: '0',
        notas: [],
      };
      const cuadreLS = JSON.parse(localStorage.getItem('respuesta'));
      if (sIgual) {
        if (cuadreLS?.dateCuadre.fecha === infoLastCuadre.dateCuadre.fecha) {
          chageInfo(cuadreLS);
        } else {
          chageInfo(infoLastCuadre);
        }
      } else {
        if (sMayor) {
          if (cuadreLS) {
            if (cuadreLS.dateCuadre.fecha === datePrincipal.fecha) {
              chageInfo(cuadreLS);
            } else {
              infoBase.cajaInicial = infoLastCuadre.cajaFinal;
              chageInfo(infoBase);
            }
          } else {
            infoBase.cajaInicial = infoLastCuadre.cajaFinal;
            localStorage.setItem('respuesta', JSON.stringify(infoBase));
            chageInfo(infoBase);
          }
        }
        if (sMenor) {
          chageInfo(infoBase);
        }
      }
    }
  }, [infoCuadre, datePrincipal, infoLastCuadre]);

  useEffect(() => {
    if (pruebaState) {
      setStateCuadre((calculateTotalNeto(pruebaState.Montos) - MontoPrevisto()).toFixed(2));
    }
  }, [pruebaState, infoLastCuadre, gastos, pedidosPagadosEfectivo, pedidosPagadosTransferencia, pedidosPagadosTarjeta]);

  useEffect(() => {
    socket.on('server:cGasto', (data) => {
      dispatch(LS_updateGasto(data));
    });

    socket.on('server:changeCuadre:child', (data) => {
      Notify('CUADRE DE CAJA A SIDO ACTUALIZADO', 'vuelve a ingresar', 'warning');
      navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`);
    });

    socket.on('server:cancel-delivery', (data) => {
      if (datePrincipal.fecha === DateCurrent().format4) {
        dispatch(LS_CancelarDeliveryDevolucion(data));
      }
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off('server:cancel-delivery');
      socket.off('server:cGasto');
      socket.off('server:changeCuadre:child');
      socket.off('cAnular');
    };
  }, []);

  return (
    <div className="content-cuadre">
      {pruebaState && onLoading === false ? (
        <>
          <div className="state-cuadre" style={{ background: stateActuallyCuadre === 'saved' ? '#53d895' : '#ed7b72' }}>
            <h1>
              {stateActuallyCuadre === 'saved'
                ? infoLastCuadre.dateCuadre.fecha === datePrincipal.fecha
                  ? 'Ultimo Cuadre Guardado'
                  : 'Cuadre Guardado'
                : 'Cuadre No guardado'}
            </h1>
          </div>
          <ContainerCC id="cuadreStructure" ref={certificateTemplateRef}>
            <BodyContainerCC>
              <HeaderCC>
                <h1 className="title">Cuadre Diario</h1>
                <div className="date-filter">
                  <DatePickerInput
                    clearable={false}
                    value={moment(datePrincipal.fecha).toDate()}
                    maxDate={new Date()}
                    minDate={moment('2024-02-12').toDate()}
                    onChange={(date) => {
                      setDatePrincipal((prevState) => ({
                        ...prevState,
                        fecha: moment(date).format('YYYY-MM-DD'),
                      }));
                    }}
                    label="Fecha"
                    mx="auto"
                    maw={200}
                  />
                </div>
              </HeaderCC>
              <BodyCC>
                <div className="info-top">
                  <div className="cash-counter">
                    <table>
                      <thead>
                        <tr>
                          <th>Monto</th>
                          <th>Cantidad</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pruebaState.Montos.map((mS, index) => (
                          <tr key={index}>
                            <td>
                              <label htmlFor="">
                                {simboloMoneda} {mS.monto}
                              </label>
                            </td>
                            <td>
                              <NumberInput
                                name="codigo"
                                value={mS.cantidad ? parseFloat(mS.cantidad) : ''}
                                precision={0}
                                onChange={(e) => {
                                  const updatedMontos = [...pruebaState.Montos];
                                  const updatedMonto = {
                                    ...updatedMontos[index],
                                  };
                                  updatedMonto.cantidad = e;
                                  updatedMonto.total = mS.monto * e;
                                  updatedMontos[index] = updatedMonto;
                                  setPruebaState((prevState) => ({
                                    ...prevState,
                                    Montos: updatedMontos,
                                  }));
                                  if (datePrincipal.fecha === DateCurrent().format4) {
                                    localStorage.setItem(
                                      'respuesta',
                                      JSON.stringify({
                                        ...pruebaState,
                                        Montos: updatedMontos,
                                      })
                                    );
                                  }
                                }}
                                min={0}
                                step={1}
                                disabled={handleCompareDates(infoLastCuadre.dateCuadre.fecha) ? false : true}
                                hideControls
                                autoComplete="off"
                              />
                            </td>
                            <td>
                              <label htmlFor="">
                                {simboloMoneda} {parseFloat(mS.total.toFixed(1))}
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="footer-info">
                      <div className="input-number">
                        <label>Total S./</label>
                        <input
                          id="input-descuento"
                          name="descuento"
                          type="text"
                          placeholder="Descuento..."
                          autoComplete="off"
                          value={calculateTotalNeto(pruebaState.Montos)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="info-cuadre">
                    <div className="form-ic">
                      <TextInput
                        label="Caja Inicial"
                        radius="md"
                        value={
                          datePrincipal.fecha === DateCurrent().format4 &&
                          infoLastCuadre.dateCuadre.fecha !== DateCurrent().format4
                            ? infoLastCuadre.cajaFinal
                            : pruebaState.cajaInicial
                        }
                        readOnly
                      />
                      <TextInput label="Gastos" radius="md" value={gastos} readOnly />
                      <TextInput
                        label="Pedidos Pagados (EFECTIVO)"
                        radius="md"
                        value={pedidosPagadosEfectivo}
                        readOnly
                      />
                      <TextInput
                        label="En caja deberia haber :"
                        radius="md"
                        id="m-previsto"
                        value={MontoPrevisto()}
                        readOnly
                      />
                    </div>
                    <div className="response-ic">
                      <div className="bloques-states">
                        <div className="states">
                          <div className="bloque title sb">SOBRA</div>
                          <div className="bloque res">
                            {Number(stateCuadre) > 0 ? `${simboloMoneda} ${stateCuadre}` : 'NO'}
                          </div>
                        </div>
                        <div className="states ">
                          <div className="bloque title cd">CUADRA</div>
                          <div className="bloque res">{Number(stateCuadre) === 0 ? 'SI' : 'NO'}</div>
                        </div>
                        <div className="states ">
                          <div className="bloque title fl">FALTA</div>
                          <div className="bloque res">
                            {Number(stateCuadre) < 0 ? `${simboloMoneda} ${stateCuadre}` : 'NO'}
                          </div>
                        </div>
                      </div>
                      <TextInput
                        label={`Pedidos Pagados (${ingresoDigital}) :`}
                        radius="md"
                        value={pedidosPagadosTransferencia}
                        readOnly
                      />
                      <TextInput
                        label={`Pedidos Pagados (TARJETA) :`}
                        radius="md"
                        value={pedidosPagadosTarjeta}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="finish-balance">
                    <h1>Finaliza el cuadre con :</h1>
                    <div className="form-fb">
                      <TextInput
                        label="Monto en Caja"
                        radius="md"
                        value={calculateTotalNeto(pruebaState.Montos)}
                        readOnly
                      />
                      <TextInput
                        label="Corte"
                        radius="md"
                        disabled={handleCompareDates(infoLastCuadre.dateCuadre.fecha) ? false : true}
                        value={pruebaState.corte}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const numericValue = inputValue.replace(/[^0-9.]/g, ''); // Filtrar caracteres no numéricos, permitiendo el punto decimal

                          setIState({
                            ...iState,
                            corte: numericValue,
                            cajaFinal: parseFloat(calculateTotalNeto(pruebaState.Montos) - numericValue).toFixed(2),
                          });

                          setPruebaState({
                            ...pruebaState,
                            corte: numericValue,
                            cajaFinal: parseFloat(calculateTotalNeto(pruebaState.Montos) - numericValue).toFixed(2),
                          });

                          if (datePrincipal.fecha === DateCurrent().format4) {
                            localStorage.setItem(
                              'respuesta',
                              JSON.stringify({
                                ...pruebaState,
                                corte: numericValue,
                              })
                            );
                          }
                        }}
                      />
                      <TextInput
                        label="Caja Final"
                        radius="md"
                        value={parseFloat(calculateTotalNeto(pruebaState.Montos) - pruebaState.corte).toFixed(2)}
                        readOnly
                      />
                    </div>
                    <h1>Se hace Entrega de {pruebaState.corte}</h1>
                    {handleCompareDates(infoLastCuadre.dateCuadre.fecha) ? (
                      <div className="action-end">
                        <button
                          type="button"
                          onClick={async () => {
                            await setSaveActivated(true);
                            openModal(true);
                          }}
                        >
                          Guardar y Generar PDF
                        </button>
                      </div>
                    ) : (
                      <div className="action-end">
                        <button
                          type="button"
                          onClick={async () => {
                            await setSaveActivated(true);
                            openModal(false);
                          }}
                        >
                          Generar PDF
                        </button>
                      </div>
                    )}
                    <div style={{ pointerEvents: datePrincipal.fecha !== DateCurrent().format4 ? 'none' : 'auto' }}>
                      <Nota
                        onMode={saveActivated} // Cambiar el diseño si se va a generar el PDF
                        setMode={setSaveActivated} // Si se cancela el PDF vuelve el diseño Original
                        infoNotas={pruebaState.notas} // Info de las notas
                        handleGetData={(notas) => {
                          // Cambiar el estado del padre con la info del hijo
                          setPruebaState({
                            ...pruebaState,
                            notas: notas,
                          });
                          if (datePrincipal.fecha === DateCurrent().format4) {
                            localStorage.setItem(
                              'respuesta',
                              JSON.stringify({
                                ...pruebaState,
                                notas: notas,
                              })
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="info-extra">
                  <div className="efectivo tb-info">
                    <span>EFECTIVO</span>
                    {iClienteEfectivo ? (
                      <div className="paid-orders-efectivo">
                        <table>
                          <thead>
                            <tr>
                              <th>Codigo</th>
                              <th>Modalidad</th>
                              <th>Nombre</th>
                              <th>Monto</th>
                            </tr>
                          </thead>
                          <tbody>
                            {iClienteEfectivo.map((cliente, index) => (
                              <tr
                                key={index}
                                //style={{ background: cliente.estadoPrenda === 'anulado' ? '#ff686847' : '#fff' }}
                                className={`${cliente.estadoPrenda === 'anulado' ? 'mode-anulado' : null}`}
                              >
                                <td>{cliente.codRecibo}</td>
                                <td>{cliente.Modalidad}</td>
                                <td>{cliente.Nombre}</td>
                                <td>{cliente.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <div className="gastos tb-info">
                      <span>GASTOS</span>
                      {iGastos ? (
                        <div className="daily-expenses">
                          <table>
                            <thead>
                              <tr>
                                <th>Descripcion</th>
                                <th>Fecha y Hora</th>
                                <th>Monto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {iGastos.map((gasto, index) => (
                                <tr
                                  key={index}
                                  //style={{ background: gasto._state === 'anulado' ? '#ff686847' : '#fff' }}
                                  className={`${gasto._state === 'anulado' ? 'mode-anulado' : null}`}
                                >
                                  <td>{gasto.descripcion}</td>
                                  <td>
                                    {gasto.fecha} / {gasto.hora}
                                  </td>
                                  <td>{gasto.monto}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                    <div className="transferencia tb-info">
                      <span>{ingresoDigital}</span>
                      {iClienteTransferencia ? (
                        <div className="paid-orders-tranf">
                          <table>
                            <thead>
                              <tr>
                                <th>Codigo</th>
                                <th>Modalidad</th>
                                <th>Nombre</th>
                                <th>Monto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {iClienteTransferencia.map((cliente, index) => (
                                <tr
                                  key={index}
                                  // style={{ background: cliente.estadoPrenda === 'anulado' ? '#ff686847' : '#fff' }}
                                  className={`${cliente.estadoPrenda === 'anulado' ? 'mode-anulado' : null}`}
                                >
                                  <td>{cliente.codRecibo}</td>
                                  <td>{cliente.Modalidad}</td>
                                  <td>{cliente.Nombre}</td>
                                  <td>{cliente.total}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                    {/* -------- */}
                    <div className="tarjeta tb-info">
                      <span>TARJETA</span>
                      {iClienteTarjeta ? (
                        <div className="paid-orders-tarj">
                          <table>
                            <thead>
                              <tr>
                                <th>Codigo</th>
                                <th>Modalidad</th>
                                <th>Nombre</th>
                                <th>Monto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {iClienteTarjeta.map((cliente, index) => (
                                <tr
                                  key={index}
                                  // style={{ background: cliente.estadoPrenda === 'anulado' ? '#ff686847' : '#fff' }}
                                  className={`${cliente.estadoPrenda === 'anulado' ? 'mode-anulado' : null}`}
                                >
                                  <td>{cliente.codRecibo}</td>
                                  <td>{cliente.Modalidad}</td>
                                  <td>{cliente.Nombre}</td>
                                  <td>{cliente.total}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                    {/* ------- */}
                  </div>
                </div>
              </BodyCC>
            </BodyContainerCC>
          </ContainerCC>
        </>
      ) : (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      )}
    </div>
  );
};

export const ContainerCC = styled.div`
  position: relative;
  width: 100%;
  max-width: 1350px;
  //border: 1px solid #ccc;
  //border-radius: 4px;
  margin: auto;
`;

export const BodyContainerCC = styled.div`
  position: relative;
  padding: 5px;
  background-color: #fff;
  display: grid;
  grid-template-rows: 85px auto;
`;

export const HeaderCC = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 260px auto;
  padding: 5px 25px;
  border-bottom: solid 1px silver;

  .title {
    margin-bottom: 0;
  }

  .date-filter {
    padding-right: 275px;
  }
`;

const BodyCC = styled.div`
  max-width: 1350px;
  display: grid;

  .info-top {
    width: 100%;
    display: grid;
    grid-template-columns: 450px 1fr 1fr;

    .cash-counter {
      margin: auto;

      table {
        display: block;
        border-collapse: collapse;
        margin: 10px auto;

        &::-webkit-scrollbar {
          width: 0;
        }

        tr {
          position: relative;
          display: grid;
          grid-template-columns: 100px 100px 200px;
        }

        thead {
          tr {
            th {
              background: #5b81ea;
              color: #fff;
              font-weight: bold;
              padding: 10px;
              text-align: center;
              font-size: 18px;
            }
          }
        }

        tbody {
          tr {
            td {
              position: relative;
              padding: 10px 5px;
              border: 1px solid #4672ea79;
              text-align: center;
              font-size: 14px;
              vertical-align: top;
              display: flex;
              justify-content: center;
              align-items: center;
              &:last-child {
                border-right: 1px solid #4672ea79 !important;
              }

              input {
                width: 65px;
                height: 28px;
                font-size: 18px !important;
                border-radius: 7px;
                font-size: 14px;
                border: none;
                text-align: center;
                outline: none;
              }

              label {
                margin: auto;
                font-size: 18px;
              }

              &:nth-child(2) {
                background-color: #75757559;
              }
            }
          }
        }
      }

      .footer-info {
        width: 100%;
        margin: 10px auto;
        display: flex;
        justify-content: space-between;

        .input-number {
          width: 100%;
          margin: 10px auto;
          display: flex;
          justify-content: right;

          label {
            color: #7a7dbb;
            text-transform: uppercase;
            font-size: 17px;
            font-weight: bold;
            letter-spacing: 0.05em;
            margin: auto;
            margin-right: 10px;
          }

          input {
            display: inline-block;
            font-size: 18px;
            text-align: center;
            border: 2px solid #7a7dbb;
            width: 200px;
            height: 30px;
            color: #3d44c9;
            border-radius: 7px;
            font-family: 'PT Sans', sans-serif;
            font-weight: bold;
            background: transparent;
            outline: 0;

            &:focus::placeholder {
              color: transparent;
            }

            &::placeholder {
              display: inline-block;
              font-size: 18px;
              padding: auto;
              font-family: 'PT Sans', sans-serif;
              font-weight: bold;
              color: #67688a77;
            }
          }
        }
      }
    }

    .info-cuadre {
      display: grid;
      grid-template-rows: 305px auto;
      padding: 20px 10%;

      .form-ic {
        max-width: 300px;
        display: grid;
        gap: 10px;
      }

      .response-ic {
        .bloques-states {
          margin: 25px 0;
          display: grid;
          grid-template-rows: 1fr 1fr 1fr;
          gap: 10px;

          .sb {
            background: #afffa8;
          }

          .cd {
            background: #f9ffa8;
          }

          .fl {
            background: #ffa8a8;
          }

          .states {
            width: max-content;
            text-align: center;
            color: #6c757d;
            font-weight: bold;
            display: grid;
            grid-template-columns: 125px max-content;

            .bloque {
              padding: 10px 20px;
              line-height: 2;
            }

            .title {
              border: solid 1px silver;
              border-radius: 15px 1px 1px 15px;
              border-right: none;
            }

            .res {
              border: solid 1px silver;
              border-radius: 1px 15px 15px 1px;
              border-left: solid 0.5px silver;
              min-width: 125px;
            }
          }
        }
      }
    }

    .finish-balance {
      display: grid;
      grid-template-rows: 40px 225px 50px min-content auto;
      padding: 10px 20px;

      h1 {
        font-size: 25px;
        margin: auto;
        margin-left: 0;
      }

      .form-fb {
        max-width: 300px;
        display: grid;
        gap: 10px;
      }

      .action-end {
        height: min-content;
        button {
          position: relative;
          height: 65px;
          width: 100%;
          margin: auto;
          font-size: 23px;
          font-weight: 500;
          letter-spacing: 1px;
          border-radius: 5px;
          text-transform: uppercase;
          border: 1px solid transparent;
          outline: none;
          cursor: pointer;
          background: #5b81ea;
          overflow: hidden;
          transition: 0.6s;
          color: #fff;
          border-color: #3868eb;

          &::before,
          &::after {
            position: absolute;
            content: '';
            left: 0;
            top: 0;
            height: 100%;
            filter: blur(30px);
            opacity: 0.4;
            transition: 0.6s;
          }

          &:before {
            width: 60px;
            background: rgba(255, 255, 255, 0.6);
            transform: translateX(-130px) skewX(-45deg);
          }

          &:after {
            width: 30px;
            background: rgba(255, 255, 255, 0.6);
            transform: translateX(-130px) skewX(-45deg);
          }

          &:hover:before,
          &:hover:after {
            opacity: 0.6;
            transform: translateX(320px) skewX(-45deg);
          }

          &:hover {
            color: #f2f2f2;
            background: #44df6b;
          }
        }
      }
    }
  }

  .mode-anulado {
    border-top: none;
    background: #ffd0d0;
    td {
      border: none !important;
      &:first-child {
        border-left: 2px solid #ea5b5b !important;
      }
      &:last-child {
        border-right: 2px solid #ea5b5b !important;
      }
    }
  }

  table {
    display: block;
    border-collapse: collapse;
    margin: 10px;

    &::-webkit-scrollbar {
      width: 0;
    }

    tr {
      position: relative;
      display: grid;
    }

    thead {
      tr {
        th {
          background: #5b81ea;
          color: #fff;
          font-weight: bold;
          padding: 10px;
          text-align: center;
          font-size: 18px;
        }
      }
    }

    tbody {
      tr {
        td {
          position: relative;
          padding: 10px 5px;
          text-align: center;
          font-size: 18px;
          vertical-align: top;
          display: flex;
          justify-content: center;
          align-items: center;
          border-right: none !important;
          //border-top: none !important;
        }
      }
    }
  }

  .info-extra {
    display: flex;
    justify-content: space-between;

    .tb-info {
      display: grid;
      grid-template-rows: 50px auto;
      span {
        margin: auto;
        font-weight: 800;
        font-size: 18px;
        color: #5161ce;
        letter-spacing: 3px;
        border: solid 1px #5161ce;
        padding: 10px;
        padding-bottom: 7px;
      }
    }
    .paid-orders-tarj {
      table {
        tr {
          grid-template-columns: 80px 140px 280px 150px;
        }
        thead {
          tr {
            th {
              background: #007bff;
              color: #fff;
            }
          }
        }
        tbody {
          tr {
            td {
              border: 1px solid #007bff;
              &:last-child {
                border-right: 2px solid #007bff !important;
              }
              &:first-child {
                border-left: 2px solid #007bff !important;
              }
            }
            &:last-child {
              border-bottom: 2px solid #007bff !important;
            }
          }
        }
      }
    }

    .paid-orders-tranf {
      table {
        tr {
          grid-template-columns: 80px 140px 280px 150px;
        }
        thead {
          tr {
            th {
              background: #7a43c9;
              color: #fff;
            }
          }
        }
        tbody {
          tr {
            td {
              border: 1px solid #7a43c9;
              &:last-child {
                border-right: 2px solid #7a43c9 !important;
              }
              &:first-child {
                border-left: 2px solid #7a43c9 !important;
              }
            }
            &:last-child {
              border-bottom: 2px solid #7a43c9 !important;
            }
          }
        }
      }
    }
    .paid-orders-efectivo {
      table {
        tr {
          grid-template-columns: 80px 140px 250px 150px;
        }
        thead {
          tr {
            th {
              background: #3faf84;
              color: #fff;
            }
          }
        }
        tbody {
          tr {
            td {
              border: 1px solid #3faf84;
              &:last-child {
                border-right: 2px solid #3faf84 !important;
              }
              &:first-child {
                border-left: 2px solid #3faf84 !important;
              }
            }
            &:last-child {
              border-bottom: 2px solid #3faf84 !important;
            }
          }
        }
      }
    }

    .daily-expenses {
      table {
        tr {
          grid-template-columns: 300px 250px 100px;
        }
        thead {
          tr {
            th {
              background: #ea5b5b;
            }
          }
        }

        tbody {
          tr {
            td {
              border: 1px solid #ea5b5b;
              &:last-child {
                border-right: 2px solid #ea5b5b !important;
              }
            }
            &:last-child {
              border-bottom: 2px solid #ea5b5b !important;
            }
          }
        }
      }
    }
  }
`;

export default CuadreCaja;
