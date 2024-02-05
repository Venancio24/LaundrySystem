/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Box, MultiSelect } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { MantineReactTable } from 'mantine-react-table';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Portal from '../../../../../components/PRIVATE/Portal/Portal';
import Detalle from '../../../../../utils/img/Otros/detalle.png';
import './list.scss';

import moment from 'moment';
import {
  DateCurrent,
  GetFirstFilter,
  handleGetInfoPago,
  handleOnWaiting,
  handleProductoCantidad,
} from '../../../../../utils/functions/index';

import { useDispatch, useSelector } from 'react-redux';

import { GetOrdenServices_DateRange } from '../../../../../redux/actions/aOrdenServices';
import { GetMetas } from '../../../../../redux/actions/aMetas';
import { setLastRegister, setOrderServiceId } from '../../../../../redux/states/service_order';

import EndProcess from '../Actions/EndProcess/EndProcess';
import Details from '../Details/Details';
import BarProgress from '../../../../../components/PRIVATE/BarProgress/BarProgress';
import { Roles } from '../../../../../models';
import { confMoneda, documento, simboloMoneda, tipoMoneda } from '../../../../../services/global';

const List = () => {
  //Filtros de Fecha
  const firstFilter = GetFirstFilter(); // Filtro x Mes Actual y anterior
  const [secondFilter, setSecondFilter] = useState(new Date()); // Filtro por Año
  const [showAnulado, setShowAnulado] = useState('Mostrar'); // Filtrar Anulados
  const [FiltroClientes, setFiltroClientes] = useState(firstFilter.formatoS);

  const dispatch = useDispatch();

  const InfoUsuario = useSelector((state) => state.user.infoUsuario);
  const { registered } = useSelector((state) => state.orden);
  //const { infoServiceOrder, registered } = useSelector((state) => state.orden);

  const [infoRegistrado, setInfoRegistrado] = useState([]);
  const [detailEdit, setDetailEdit] = useState(false);
  const [changePago, setChangePago] = useState(false);

  const [rowPick, setRowPick] = useState();

  const [cPedidos, setCPedidos] = useState();

  const infoMetas = useSelector((state) => state.metas.infoMetas);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'Recibo',
        header: 'Orden',
        mantineFilterTextInputProps: {
          placeholder: 'N°',
        },
        //enableEditing: false,
        size: 75,
      },
      {
        accessorKey: 'Nombre',
        header: 'Nombre',
        mantineFilterTextInputProps: {
          placeholder: 'Cliente',
        },
        //enableSorting: false,
        size: 100,
      },
      {
        accessorKey: 'Modalidad',
        header: 'Modalidad',
        //enableSorting: false,
        filterVariant: 'select',
        mantineFilterSelectProps: { data: ['TIENDA', 'DELIVERY'] },
        mantineFilterTextInputProps: { placeholder: 'Modalidad' },
        editVariant: 'select',
        mantineEditSelectProps: {
          data: [
            {
              value: 'Tienda',
              label: 'Tienda',
            },
            {
              value: 'Delivery',
              label: 'Delivery',
            },
          ],
        },
        enableEditing: false,
        size: 100,
      },
      {
        accessorKey: 'FechaRecepcion',
        header: 'Recepcion',
        mantineFilterTextInputProps: {
          placeholder: 'Fecha',
        },
        size: 100,
      },
      {
        accessorKey: 'Producto',
        header: 'Producto',
        mantineFilterTextInputProps: {
          placeholder: 'Producto',
        },
        Cell: ({ cell }) => (
          <MultiSelect
            data={cell.getValue()}
            value={cell.getValue()}
            disabled={true}
            clearable={true}
            searchable={false}
          />
        ),
        size: 190,
      },
      {
        accessorKey: 'PParcial',
        header: 'Monto Pagado',
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: 'Monto',
        },
        size: 120,
      },
      {
        accessorKey: 'Pago',
        header: 'Pago',
        filterVariant: 'select',
        mantineFilterSelectProps: { data: ['COMPLETO', 'INCOMPLETO', 'PENDIENTE'] },
        mantineFilterTextInputProps: { placeholder: 'C / I / P' },
        editVariant: 'select',
        mantineEditSelectProps: {
          data: [
            {
              value: 'COMPLETO',
              label: 'COMPLETO',
            },
            {
              value: 'INCOMPLETO',
              label: 'INCOMPLETO',
            },
            {
              value: 'PENDIENTE',
              label: 'PENDIENTE',
            },
          ],
        },
        enableEditing: false,
        size: 150,
      },
      {
        accessorKey: 'totalNeto',
        header: 'Total',
        //enableSorting: false,
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue()?.toLocaleString?.(confMoneda, {
              style: 'currency',
              currency: tipoMoneda,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Box>
        ),
        enableEditing: false,
        mantineFilterTextInputProps: {
          placeholder: 'Total',
        },
        size: 70,
      },
      {
        accessorKey: 'Celular',
        header: 'Celular',
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: 'Numero',
        },
        size: 80,
      },
      {
        accessorKey: 'Location',
        header: 'Ubicacion',
        //enableSorting: false,
        filterVariant: 'select',
        mantineFilterSelectProps: {
          data: [
            {
              value: 1,
              label: 'Tienda',
            },
            {
              value: 2,
              label: 'Almacen',
            },
            {
              value: 3,
              label: 'Donacion',
            },
          ],
        },
        mantineFilterTextInputProps: {
          placeholder: 'Tienda / Almacen / Donacion',
        },

        Cell: ({ cell }) => (
          // Wrapped the arrow function with parentheses
          <Box
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() === 1
                  ? theme.colors.green[9]
                  : cell.getValue() === 2
                  ? theme.colors.red[9]
                  : theme.colors.pink[4],
              borderRadius: '4px',
              color: '#fff',
              textAlign: 'center',
              padding: '10px 15px',
            })}
          >
            {cell.getValue() === 1 ? 'Tienda' : cell.getValue() === 2 ? 'Almacen' : 'Donacion'}
          </Box>
        ),
        size: 130,
      },
      {
        accessorKey: 'FechaEntrega',
        header: 'Fecha Entrega',
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: 'Fecha',
        },
        size: 120,
      },
      {
        accessorKey: 'DNI',
        header: documento,
        //enableSorting: false,
        mantineFilterTextInputProps: {
          placeholder: documento,
        },
        size: 80,
      },
      {
        accessorKey: 'onWaiting',
        header: 'Orden en Espera...',
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          // Wrapped the arrow function with parentheses
          cell.getValue().stado ? (
            <Box
              sx={(theme) => ({
                backgroundColor: cell.getValue().stadoEntrega
                  ? theme.colors.blue[9]
                  : cell.getValue().nDias < 20
                  ? theme.colors.green[9]
                  : cell.getValue().nDias >= 21 && cell.getValue().nDias <= 30
                  ? theme.colors.yellow[9]
                  : theme.colors.red[9],
                borderRadius: '4px',
                color: '#fff',
                textAlign: 'center',
                padding: '10px 15px',
              })}
            >
              {cell.getValue().showText}
            </Box>
          ) : (
            <span>-</span>
          ),
        size: 150,
      },
    ],
    []
  );

  const handleGetFactura = async (info) => {
    const reOrdenar = [...info].sort((a, b) => b.index - a.index);
    const newData = await Promise.all(
      reOrdenar.map(async (d) => {
        const dateEndProcess = d.estadoPrenda === 'donado' ? d.donationDate.fecha : d.dateEntrega.fecha;
        const onWaiting = await handleOnWaiting(d.dateRecepcion.fecha, d.estadoPrenda, dateEndProcess);
        const estadoPago = handleGetInfoPago(d.ListPago, d.totalNeto);

        const structureData = {
          Id: d._id,
          Recibo: String(d.codRecibo).padStart(6, '0'),
          Nombre: d.Nombre,
          Modalidad: d.Modalidad,
          Producto: handleProductoCantidad(d.Producto),
          PParcial: `${simboloMoneda} ${estadoPago.pago}`,
          Pago: d.Pago.toUpperCase(),
          totalNeto: `${simboloMoneda} ${d.totalNeto}`,
          DNI: d.dni,
          Celular: d.celular,
          FechaEntrega: d.dateEntrega.fecha,
          FechaRecepcion: d.dateRecepcion.fecha,
          Descuento: d.descuento,
          Location: d.location,
          EstadoPrenda: d.estadoPrenda,
          Estado: d.estado,
          onWaiting: onWaiting,
        };

        return structureData;
      })
    );

    setInfoRegistrado(newData);
  };

  const handlePlanChange = async (event) => {
    if (event.target.value !== 'MESES PREVIOS') {
      dispatch(
        GetOrdenServices_DateRange({
          dateInicio: firstFilter.formatoD[0],
          dateFin: firstFilter.formatoD[1],
        })
      );
    } else {
      const startDate = moment.utc(secondFilter).startOf('month').format('YYYY-MM-DD');
      const endDate = moment.utc(secondFilter).endOf('month').format('YYYY-MM-DD');
      dispatch(
        GetOrdenServices_DateRange({
          dateInicio: startDate,
          dateFin: endDate,
        })
      );
    }

    setFiltroClientes(event.target.value);
    setShowAnulado('Mostrar');
  };

  const handleFAnulados = (event) => {
    if (event.target.value === 'Esconder') {
      setInfoRegistrado(infoRegistrado.filter((item) => item.EstadoPrenda !== 'anulado'));
    } else {
      handleGetFactura(registered);
    }
    setShowAnulado(event.target.value);
  };

  const handleMonthPickerChange = useCallback(
    (date) => {
      const startDate = moment.utc(date).startOf('month').format('YYYY-MM-DD');
      const endDate = moment.utc(date).endOf('month').format('YYYY-MM-DD');
      setSecondFilter(date);
      dispatch(
        GetOrdenServices_DateRange({
          dateInicio: startDate,
          dateFin: endDate,
        })
      );
      setShowAnulado('Mostrar');
    },
    [dispatch]
  );

  const handleGetTotalPedidos = () => {
    const resultado = {
      Tienda: 0,
      Delivery: 0,
      Total: 0,
    };

    const currentYearMonth = moment().format('YYYY-MM'); // Obtiene el año y mes actual en el formato deseado (sin el día)

    for (const registro of registered) {
      const fechaRegistro = moment(registro.dateRecepcion.fecha).format('YYYY-MM'); // Formatea la fecha del registro en el mismo formato (sin el día)

      if (registro.estadoPrenda !== 'anulado' && fechaRegistro === currentYearMonth) {
        if (registro.Modalidad === 'Tienda') {
          resultado.Tienda++;
        } else if (registro.Modalidad === 'Delivery') {
          resultado.Delivery++;
        }
      }
    }
    resultado.Total = resultado.Tienda + resultado.Delivery;

    setCPedidos(resultado);
  };

  useEffect(() => {
    dispatch(setOrderServiceId(false));
    dispatch(setLastRegister());
  }, []);

  useEffect(() => {
    handleGetFactura(registered);
    handleGetTotalPedidos();
  }, [registered]);

  useEffect(() => {
    if (infoMetas.length === 0) {
      dispatch(GetMetas());
    }
  }, [infoMetas]);

  return (
    <div className="list-pedidos">
      <div className="indicator">
        <BarProgress cantActual={cPedidos?.Total} meta={infoMetas?.Total} />
      </div>
      <div className="b-order">
        <div className="header-space">
          <div className="actions">
            <div className="filter-date">
              <div style={{ minWidth: '33rem' }} className="switches-container fecha-s">
                <input
                  type="radio"
                  id="filtroUno"
                  name="switchFC"
                  value={firstFilter.formatoS}
                  checked={FiltroClientes === firstFilter.formatoS}
                  onChange={handlePlanChange}
                />
                <input
                  type="radio"
                  id="filtroDos"
                  name="switchFC"
                  value="MESES PREVIOS"
                  checked={FiltroClientes === 'MESES PREVIOS'}
                  onChange={handlePlanChange}
                />
                <label htmlFor="filtroUno">{firstFilter.formatoS}</label>
                <label htmlFor="filtroDos">MESES PREVIOS</label>
                <div className="switch-wrapper">
                  <div className="switch">
                    <div>{firstFilter.formatoS}</div>
                    <div>MESES PREVIOS</div>
                  </div>
                </div>
              </div>
              {FiltroClientes === 'MESES PREVIOS' ? (
                <MonthPickerInput
                  className="date-m"
                  placeholder="Pick date"
                  value={secondFilter}
                  onChange={handleMonthPickerChange}
                  mx="auto"
                  maw={400}
                />
              ) : null}
            </div>
            <div className="filter-anulados">
              <label className="title-anulado" htmlFor="">
                Mostrar Anulados
              </label>
              <div className="switches-container fecha-a">
                <input
                  type="radio"
                  id="fShowAnulado"
                  name="switchAnulado"
                  value="Mostrar"
                  checked={showAnulado === 'Mostrar'}
                  onChange={handleFAnulados}
                />
                <input
                  type="radio"
                  id="fHideAnulado"
                  name="switchAnulado"
                  value="Esconder"
                  checked={showAnulado === 'Esconder'}
                  onChange={handleFAnulados}
                />
                <label htmlFor="fShowAnulado">Mostrar</label>
                <label htmlFor="fHideAnulado">Esconder</label>
                <div className="switch-wrapper">
                  <div className="switch">
                    <div>Mostrar</div>
                    <div>Esconder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="leyenda">
            <div>
              <span>Leyenda Filas</span>
              <ul>
                <li>
                  <div className="color f1" />
                  <span>Entregado</span>
                </li>
                <li>
                  <div className="color f2" />
                  <span>Anulado</span>
                </li>
                <li>
                  <div className="color f3" />
                  <span>No Entregado</span>
                </li>
                <li>
                  <div className="color f4" />
                  <span>Donado</span>
                </li>
              </ul>
            </div>
            <div>
              <span>Leyenda en Espera</span>
              <ul>
                <li>
                  <div className="color a1" />
                  <span>Iniciado</span>
                </li>
                <li>
                  <div className="color a2" />
                  <span>Finalizado</span>
                </li>
                <li>
                  <div className="color a3" />
                  <span>Mayor a 21 dias</span>
                </li>
                <li>
                  <div className="color a4" />
                  <span>Mayor a 1 mes </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="list-table">
          <MantineReactTable
            columns={columns}
            data={infoRegistrado}
            initialState={{
              showColumnFilters: true,
              density: 'xs',
              sorting: [{ id: 'Recibo', desc: true }],
              pagination: { pageSize: 5 },
            }}
            enableToolbarInternalActions={false}
            enableHiding={false}
            filterFns={{
              customFilterFn: (row, id, filterValue) => {
                return row.getValue(id) === filterValue;
              },
            }}
            localization={{
              filterCustomFilterFn: 'Custom Filter Fn',
            }}
            enableColumnActions={false}
            enableSorting={false}
            enableTopToolbar={false}
            mantineTableProps={{
              highlightOnHover: false,
            }}
            mantineTableBodyCellProps={() => ({
              sx: {
                background: 'transparent',
              },
            })}
            mantineTableBodyRowProps={({ row }) => ({
              onDoubleClick: () => {
                if (InfoUsuario.rol !== Roles.PERS) {
                  setRowPick(row.original);
                  if (row.original.EstadoPrenda === 'anulado' || row.original.EstadoPrenda === 'donado') {
                    setChangePago(false);
                  } else if (
                    row.original.EstadoPrenda === 'entregado' &&
                    row.original.FechaPago !== DateCurrent().format4 &&
                    row.original.FechaEntrega !== DateCurrent().format4
                  ) {
                    setChangePago(false);
                  } else {
                    setChangePago(true);
                  }
                }
              },
              sx: {
                backgroundColor:
                  row.original.EstadoPrenda === 'entregado'
                    ? '#77f9954d'
                    : row.original.EstadoPrenda === 'anulado'
                    ? '#f856564d'
                    : row.original.EstadoPrenda === 'donado'
                    ? '#f377f94d'
                    : '',
              },
            })}
            enableStickyHeader={true}
            mantineTableContainerProps={{
              sx: {
                //maxHeight: '500px',
                minHeight: '500px',
                //minWidth: '500px',
                //width: '90%',
                maxWidth: '120vw',
              },
            }}
            enableRowVirtualization={true} // no scroll lateral
            enableRowActions={true}
            //enableRowNumbers
            renderRowActions={({ row }) => (
              <img
                className="ico-detail"
                src={Detalle}
                alt="detalle"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setRowPick(row.original);
                  setDetailEdit(true);
                }}
              />
            )}
          />
        </div>
      </div>

      {detailEdit && (
        <Portal
          onClose={() => {
            setDetailEdit(false);
          }}
        >
          <Details IdCliente={rowPick.Id} />
        </Portal>
      )}
      {changePago && (
        <Portal
          onClose={() => {
            setChangePago(false);
          }}
        >
          <EndProcess IdCliente={rowPick.Id} onClose={setChangePago} />
        </Portal>
      )}
    </div>
  );
};

export default List;
