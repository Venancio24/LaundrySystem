/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { MonthPickerInput } from '@mantine/dates';
import { Formik, Form, FieldArray } from 'formik';

import { DateCurrent } from '../../../../../utils/functions';
import { GetReporte } from '../../../../../redux/actions/aReporte';
import './reporteMensual.scss';
import LoaderSpiner from '../../../../../components/LoaderSpinner/LoaderSpiner';
import moment from 'moment';

const ReporteMesual = () => {
  const [datePrincipal, setDatePrincipal] = useState(new Date());
  const dispatch = useDispatch();
  const [infoReport, setInfoReport] = useState([]);

  const infoReporte_xMes = useSelector((state) => state.reporte.infoReporte_xMes);
  const isInitialRender = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (date) => {
    isInitialRender.current = true;
    const currentDate = moment(date).format('YYYY-MM-DD');
    await dispatch(GetReporte({ type: 'monthly', filter: { date: currentDate } }));
  };

  useEffect(() => {
    if (isInitialRender.current === false) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (infoReporte_xMes.length > 0) {
      setIsLoading(false);
      setInfoReport(infoReporte_xMes);
      isInitialRender.current = false;
    }
  }, [infoReporte_xMes]);

  useEffect(() => {
    if (isInitialRender.current === false) {
      setIsLoading(true);
      fetchData(datePrincipal);
    }
  }, [datePrincipal]);

  return (
    <div className="content-inform-m" style={isLoading ? null : { border: 'solid 1px silver' }}>
      {isLoading ? (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      ) : (
        <>
          <h1>Informe Mensual</h1>
          <div className="filter-date">
            <MonthPickerInput
              label="Ingrese Fecha"
              placeholder="Pick date"
              value={datePrincipal}
              onChange={(date) => {
                setDatePrincipal(date);
              }}
              mx="auto"
              maw={400}
            />
          </div>
          <Formik
            initialValues={{
              fEntrega: [],
            }}
          >
            {({ values }) => (
              <Form className="container-informe">
                <div className="informe-body">
                  <FieldArray name="fEntrega">
                    {() => (
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Fecha Entrega</th>
                              <th>Cantidad</th>
                              <th>Edredones</th>
                              <th>Frazada</th>
                              <th>Ropa x Kilo</th>
                              <th>Cobertor</th>
                              <th>Zapatillas</th>
                              <th>Saco</th>
                              <th>Abrigo</th>
                              <th>Terno</th>
                              <th>Delivery</th>
                            </tr>
                          </thead>
                          <tbody>
                            {infoReport.map((dayData, index) => {
                              const productQuantities = dayData.InfoProducto.reduce((acc, product) => {
                                // Redondear la cantidad a dos decimales si no es un número entero
                                const cantidad =
                                  product.Cantidad % 1 !== 0
                                    ? parseFloat(product.Cantidad).toFixed(2)
                                    : product.Cantidad;
                                acc[product.Producto] = cantidad;
                                return acc;
                              }, {});

                              return (
                                <tr
                                  key={index}
                                  style={{
                                    background: DateCurrent().format4 === dayData.FechaPrevista ? '#ffd9d9' : null,
                                  }}
                                  data-fechaprevista={dayData.FechaPrevista}
                                  ref={(element) => {
                                    if (
                                      element &&
                                      DateCurrent().format4 === element.getAttribute('data-fechaprevista')
                                    ) {
                                      element.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                      });
                                    }
                                  }}
                                >
                                  <td>{dayData.FechaPrevista}</td>
                                  <td>{dayData.CantidadPedido}</td>
                                  <td>{productQuantities['Edredon']}</td>
                                  <td>{productQuantities['Frazada']}</td>
                                  <td>{productQuantities['Ropa x Kilo']}</td>
                                  <td>{productQuantities['Cobertor']}</td>
                                  <td>{productQuantities['Zapatillas']}</td>
                                  <td>{productQuantities['Saco']}</td>
                                  <td>{productQuantities['Abrigo']}</td>
                                  <td>{productQuantities['Terno']}</td>
                                  <td>{productQuantities['Delivery']}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default ReporteMesual;
