import { configureStore } from '@reduxjs/toolkit';
import anular from './states/anular';
import codigo from './states/codigo';
import delivery from './states/delivery';
import prenda from './states/prenda';
import service_order from './states/service_order';
import user from './states/user';
import reporte from './states/reporte';
import cuadre from './states/cuadre';
import gasto from './states/gasto';
import metas from './states/metas';
import modificadores from './states/modificadores';
import promocion from './states/promociones';
import negocio from './states/negocio';

const store = configureStore({
  reducer: {
    user: user,
    orden: service_order,
    anular: anular,
    delivery: delivery,
    prenda: prenda,
    codigo: codigo,
    reporte: reporte,
    cuadre: cuadre,
    gasto: gasto,
    metas: metas,
    modificadores: modificadores,
    promocion: promocion,
    negocio: negocio,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
