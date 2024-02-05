/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import './reportes.scss';
import { Link } from 'react-router-dom';
import { PrivateRoutes } from '../../../../models';
import Ordenes from './Ordenes/Ordenes';
import Gasto from './Gastos/Gasto';
import Portal from '../../../../components/PRIVATE/Portal/Portal';

const Reportes = () => {
  const [isMenuActive, setIsMenuActive] = useState(true);
  const [titleCenter, setTitleCenter] = useState();

  const [mMensual, setMMensual] = useState(false);
  const [mGasto, setMGasto] = useState(false);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  const handleMouseEnter = (tipoR) => {
    // Manejar el evento onMouseEnter (al pasar el mouse sobre el elemento)
    // Puedes cambiar el estilo o realizar otras acciones aquí
    setTitleCenter(tipoR);
  };

  const handleMouseLeave = () => {
    // Manejar el evento onMouseLeave (al sacar el mouse del elemento)
    // Puedes cambiar el estilo o realizar otras acciones aquí
    setTitleCenter();
  };

  const listReports = [
    {
      id: '0',
      ico: 'fa-solid fa-clipboard-list',
      type_show: 'page',
      title: 'Reporte de Pendientes',
      page: `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_PENDIENTES}`,
    },
    {
      id: '1',
      ico: 'fa-solid fa-calendar',
      type_show: 'modal',
      title: 'Reporte Mensual',
      page: () => setMMensual(true),
    },
    {
      id: '2',
      ico: 'fa-solid fa-warehouse',
      type_show: 'page',
      title: 'Reporte de Almacen',
      page: `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_ALMACEN}`,
    },
    {
      id: '3',
      ico: 'fas fa-hand-holding-usd',
      type_show: 'modal',
      title: 'Reporte de Gastos',
      page: () => setMGasto(true),
    },
  ];

  const items = listReports.map((report, index) => {
    const maths = (360 / listReports.length) * index;

    // Estilo en línea para aplicar la transformación
    const sLi = {
      transform: `rotate(${maths}deg)`,
    };
    const sA = {
      transform: `rotate(-${maths}deg)`,
    };

    return (
      <li
        key={report.id}
        style={sLi}
        onMouseEnter={() => handleMouseEnter(report.title)}
        onMouseLeave={handleMouseLeave}
      >
        {report.type_show === 'page' ? (
          <Link to={report.page} style={sA}>
            <span className={`fa ${report.ico}`}></span>
          </Link>
        ) : (
          <button className="btn-report" onClick={report.page} style={sA}>
            <span className={`fa ${report.ico}`}></span>
          </button>
        )}
      </li>
    );
  });

  return (
    <div className="content-reportes">
      <div className={`content ${isMenuActive ? 'is-active' : ''}`}>
        <div id="nav" className="cp-nav">
          <button id="radial-menu" className="cp-nav__button" onClick={toggleMenu}>
            {titleCenter ? <span>{titleCenter}</span> : <span>Reportes</span>}
          </button>
          <nav>
            <ul>{items}</ul>
          </nav>
        </div>
      </div>
      {mMensual && (
        <Portal
          onClose={() => {
            setMMensual(false);
          }}
        >
          <Ordenes onClose={() => setMMensual(false)} />
        </Portal>
      )}
      {mGasto && (
        <Portal
          onClose={() => {
            setMGasto(false);
          }}
        >
          <Gasto onClose={() => setMGasto(false)} />
        </Portal>
      )}
    </div>
  );
};

export default Reportes;
