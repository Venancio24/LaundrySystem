/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DateCurrent } from '../../../../../utils/functions';
import { GetReporte } from '../../../../../redux/actions/aReporte';
import { PrivateRoutes } from '../../../../../models';
import LoaderSpiner from '../../../../../components/LoaderSpinner/LoaderSpiner';
import './reporteDiario.scss';

const ReporteDiario = ({ onClose }) => {
  const InfoUsuario = useSelector((store) => store.user.infoUsuario);
  const [isLoading, setIsLoading] = useState(true);
  const [infoReport, setInfoReport] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const infoReporte_xDias = useSelector((state) => state.reporte.infoReporte_xDias);
  const isInitialRender = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      isInitialRender.current = true;
      await dispatch(GetReporte({ type: 'daily', filter: { days: 3 } }));
    };

    if (isInitialRender.current === false) {
      fetchData();
    }
  }, [dispatch]);

  useEffect(() => {
    if (infoReporte_xDias.length > 0) {
      setIsLoading(false);
      setInfoReport(infoReporte_xDias);
    }
  }, [infoReporte_xDias]);

  return (
    <div>
      {isLoading ? (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      ) : (
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
                    product.Cantidad % 1 !== 0 ? parseFloat(product.Cantidad).toFixed(2) : product.Cantidad;
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
                      if (element && DateCurrent().format4 === element.getAttribute('data-fechaprevista')) {
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
          {InfoUsuario.rol !== 'pers' && (
            <div className="action-end">
              <button
                type="button"
                onClick={() => {
                  onClose(false);
                  navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_ORDER_SERVICE}`);
                }}
              >
                Informe Completo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReporteDiario;
