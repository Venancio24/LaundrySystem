/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react';
import './setting.scss';

import userSetting from './userSetting.png';
import priceSetting from './precio.png';
import businessSetting from './business.png';
import impuestoSetting from './impuestos.png';
import pointsSetting from './points.png';
import metasSetting from './metas.png';

import { Link } from 'react-router-dom';
import { PrivateRoutes } from '../../../../models';
import { nameImpuesto, nameMoneda } from '../../../../services/global';

const Setting = () => {
  return (
    <div className="content-setting">
      <div className="list-st">
        <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.SETTING_USERS}`} className="tag-setting">
          <div className="img">
            <img src={userSetting} alt="" />
          </div>
          <div>
            <h1>Ajuste de Usuarios</h1>
            <p>Realiza Eliminacion, Actualizacion y Agregar nuevo usuario</p>
          </div>
        </Link>
        <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.SETTING_PRICES}`} className="tag-setting">
          <div className="img">
            <img src={priceSetting} alt="" />
          </div>
          <div>
            <h1>Ajuste de Precios</h1>
            <p>Realiza Actualizacion en precios por defecto de prendas y Delivery</p>
          </div>
        </Link>
        <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.SETTING_BUSINESS}`} className="tag-setting">
          <div className="img">
            <img src={businessSetting} alt="" />
          </div>
          <div>
            <h1>Ajuste del Negocio</h1>
            <p>Cambios de horarios, nombre del negocio , direccion</p>
          </div>
        </Link>
        <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.SETTING_POINT}`} className="tag-setting">
          <div className="img">
            <img src={pointsSetting} alt="" />
          </div>
          <div>
            <h1>Ajuste de Puntos</h1>
            <p>Actualiza el valor de puntos, "Donde "x" cantidad de {nameMoneda} valdra "y" cantidad de puntos"</p>
          </div>
        </Link>
        <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.SETTING_TAXES}`} className="tag-setting">
          <div className="img">
            <img src={impuestoSetting} alt="" />
          </div>
          <div>
            <h1>Ajuste de Impuesto</h1>
            <p>Actualiza el valor del {nameImpuesto}, en porcentaje</p>
          </div>
        </Link>
        <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.SETTING_GOALS}`} className="tag-setting">
          <div className="img">
            <img src={metasSetting} alt="" />
          </div>
          <div>
            <h1>Ajuste de Metas</h1>
            <p>Actualiza el valor de la (Meta Mensual)</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Setting;
