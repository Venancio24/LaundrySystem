/* eslint-disable no-unused-vars */
import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { PrivateRoutes, Roles } from '../../models/index';
import { Setting } from '../../pages/private/admin/index';
import { EditOrdenService, ListOrdenService } from '../../pages/private/coord/index';

import { AddOrderService_Delivery, AddOrderService_Tienda } from '../../pages/private/coord/OrdenServicio/Add/index';

import Imprimir from '../../pages/private/coord/OrdenServicio/Actions/Imprimir/Imprimir';

// import { ReporteMesual } from '../../pages/private/coord/Reporte';

import { PrivateMainLayout } from '../../_MainLayout/indexLayout';
import { RoleGuard } from '../Guard/index';
import RoutesWithNotFound from '../NotFound/RoutesWithNotFound';
import CuadreCaja from '../../pages/private/coord/CuadreCaja/CuadreCaja';
import AddOld from '../../pages/private/admin/OrdenServicio/AddOld/AddOld';
// import Graficos from '../../pages/private/admin/Graficos/Graficos';
import Promociones from '../../pages/private/admin/Promociones/Promociones';

import Reportes from '../../pages/private/admin/Reportes/Reportes';
import Ordenes from '../../pages/private/admin/Reportes/Ordenes/Ordenes';
import Pendientes from '../../pages/private/admin/Reportes/Pendientes/Pendientes';
import Almacen from '../../pages/private/admin/Reportes/Almacen/Almacen';
import Prices from '../../pages/private/admin/Setting/Prices/Prices';
import Points from '../../pages/private/admin/Setting/Points/Points';
import Negocio from '../../pages/private/admin/Setting/Negocio/Negocio';
import Impuestos from '../../pages/private/admin/Setting/Impuestos/Impuestos';
import Usuarios from '../../pages/private/admin/Setting/Usuarios/Usuarios';
import Metas from '../../pages/private/admin/Setting/Metas/Metas';
import Gasto from '../../pages/private/admin/Reportes/Gastos/Gasto';

const Private = () => {
  return (
    <PrivateMainLayout>
      <RoutesWithNotFound>
        <Route path="/" element={<Navigate to={PrivateRoutes.LIST_ORDER_SERVICE} />} />
        {/* PAGES DEL PERSONAL */}
        <Route path={PrivateRoutes.LIST_ORDER_SERVICE} element={<ListOrdenService />} />
        {/* PAGES ADMINISTRADOR */}
        <Route element={<RoleGuard rol={Roles.ADMIN} />}>
          <Route path={PrivateRoutes.PROMOCIONES} element={<Promociones />} />
          {/* <Route path={PrivateRoutes.GRAFICOS} element={<Graficos />} /> */}
          <Route path={PrivateRoutes.SETTING} element={<Setting />} />
          <Route path={PrivateRoutes.SETTING_USERS} element={<Usuarios />} />
          <Route path={PrivateRoutes.SETTING_PRICES} element={<Prices />} />
          <Route path={PrivateRoutes.SETTING_BUSINESS} element={<Negocio />} />
          <Route path={PrivateRoutes.SETTING_POINT} element={<Points />} />
          <Route path={PrivateRoutes.SETTING_TAXES} element={<Impuestos />} />
          <Route path={PrivateRoutes.SETTING_GOALS} element={<Metas />} />
          <Route path={PrivateRoutes.REGISTER_OLDS} element={<AddOld />} />
          <Route path={PrivateRoutes.REPORTES} element={<Reportes />} />
          <Route path={PrivateRoutes.REPORTE_ORDENES} element={<Ordenes />} />
          <Route path={PrivateRoutes.REPORTE_PENDIENTES} element={<Pendientes />} />
          <Route path={PrivateRoutes.REPORTE_ALMACEN} element={<Almacen />} />
          <Route path={PrivateRoutes.REPORTE_GASTO} element={<Gasto />} />
        </Route>
        {/* PAGES COORDINADOR */}
        <Route element={<RoleGuard rol={Roles.COORD} />}>
          <Route path={`${PrivateRoutes.EDIT_ORDER_SERVICE}/:id`} element={<EditOrdenService />} />
          <Route path={PrivateRoutes.REGISTER_TIENDA} element={<AddOrderService_Tienda />} />
          <Route path={PrivateRoutes.REGISTER_DELIVERY} element={<AddOrderService_Delivery />} />
          <Route path={`${PrivateRoutes.FINISH_ORDEN_SERVICE_PENDING}/:id`} element={<EditOrdenService />} />
          <Route path={`${PrivateRoutes.IMPRIMIR_ORDER_SERVICE}/:id`} element={<Imprimir />} />
          {/* <Route path={PrivateRoutes.REPORTE_ORDER_SERVICE} element={<ReporteMesual />} /> */}
          <Route path={PrivateRoutes.CUADRE_CAJA} element={<CuadreCaja />} />
        </Route>
      </RoutesWithNotFound>
    </PrivateMainLayout>
  );
};

export default Private;
