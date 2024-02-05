import { createSlice } from '@reduxjs/toolkit';
import {
  AddOrdenServices,
  CancelEntrega_OrdenService,
  GetOrdenServices_Date,
  GetOrdenServices_DateRange,
  UpdateOrdenServices,
  // UpdateOrdenServices_PagoEntrega,
} from '../actions/aOrdenServices';

const service_order = createSlice({
  name: 'service_order',
  initialState: {
    infoServiceOrder: false,
    registered: [],
    reserved: [],
    infoRegisteredDay: [],
    lastRegister: null,
    orderServiceId: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setOrderServiceId: (state, action) => {
      state.orderServiceId = action.payload;
    },
    updateLastRegister: (state, action) => {
      state.lastRegister = { ...state.lastRegister, promotions: action.payload };
    },
    setLastRegister: (state) => {
      state.lastRegister = null;
    },
    updateNotaOrden: (state, action) => {
      const index = state.registered.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) state.registered[index] = action.payload;
      else state.registered.push(action.payload);
    },
    LS_updateOrder: (state, action) => {
      // Busca si existe un elemento con el mismo _id en state.registered
      const eRegistered = state.registered.findIndex((item) => item._id === action.payload._id);
      const eReserved = state.reserved.some((item) => item._id === action.payload._id);
      if (eRegistered !== -1) {
        // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
        Object.assign(state.registered[eRegistered], action.payload);
      } else if (eReserved && action.payload.estado === 'registrado') {
        state.reserved = state.reserved.filter((item) => item._id !== action.payload._id);
        state.registered.push(action.payload);
      }
    },
    LS_updateListOrder: (state, action) => {
      const listOrderUpdated = action.payload;
      listOrderUpdated.map((order) => {
        // Busca si existe un elemento con el mismo _id en state.registered
        const eRegistered = state.registered.findIndex((item) => item._id === order._id);
        if (eRegistered !== -1) {
          // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
          Object.assign(state.registered[eRegistered], order);
        }
      });
    },
    LS_newOrder: (state, action) => {
      if (action.payload.estado === 'reservado') {
        state.reserved.push(action.payload);
      }

      if (action.payload.estado === 'registrado') {
        state.registered.push(action.payload);
      }
    },
    LS_updateRegisteredDay: (state, action) => {
      const newOrder = action.payload;
      if (newOrder.estado === 'registrado') {
        // Busca si existe un elemento con el mismo _id en state.registered
        const eRegisteredDay = state.infoRegisteredDay.findIndex((item) => item._id === newOrder._id);
        if (eRegisteredDay !== -1) {
          // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
          Object.assign(state.infoRegisteredDay[eRegisteredDay], newOrder);
        } else {
          state.infoRegisteredDay.push(newOrder);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(AddOrdenServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(AddOrdenServices.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.estado === 'reservado') {
          state.reserved.push(action.payload);
        }

        if (action.payload.estado === 'registrado') {
          state.registered.push(action.payload);
        }

        state.lastRegister = action.payload;
      })
      .addCase(AddOrdenServices.rejected, (state) => {
        state.isLoading = false;
      })
      // Update
      .addCase(UpdateOrdenServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(UpdateOrdenServices.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.registered.findIndex((item) => item._id === action.payload._id);
        if (index !== -1 && action.payload.estado === 'registrado') {
          // si existe acutaliza
          state.registered[index] = action.payload;
        } else {
          // si no y esta es
          if (action.payload.estado === 'registrado') {
            state.registered.push(action.payload);
          }
        }

        // Siempre q se actualiza es por ya esta registrado x eso si existe
        // alguna orden con id en reserved se quita

        state.reserved = state.reserved.filter((item) => item._id !== action.payload._id);
      })
      .addCase(UpdateOrdenServices.rejected, (state) => {
        state.isLoading = false;
      })
      // List for Day
      .addCase(GetOrdenServices_Date.pending, (state) => {
        state.isLoading = true;
        state.infoRegisteredDay = false;
        state.error = null;
      })
      .addCase(GetOrdenServices_Date.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoRegisteredDay = action.payload.filter(
          (item) => item.estado === 'registrado' /* && item.estadoPrenda !== 'anulado'*/
        );
      })
      .addCase(GetOrdenServices_Date.rejected, (state) => {
        state.isLoading = false;
        state.infoRegisteredDay = false;
      })
      // List for Date Range
      .addCase(GetOrdenServices_DateRange.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(GetOrdenServices_DateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = action.payload.length > 0;
        state.reserved = action.payload.filter((item) => item.estado === 'reservado');
        state.registered = action.payload.filter((item) => item.estado === 'registrado');
      })
      .addCase(GetOrdenServices_DateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      })
      // Cancelar Entrega
      .addCase(CancelEntrega_OrdenService.pending, (state) => {
        state.isLoading = true;
        state.infoServiceOrder = false;
        state.error = null;
      })
      .addCase(CancelEntrega_OrdenService.fulfilled, (state, action) => {
        state.isLoading = false;
        const indexRegistered = state.registered.findIndex((item) => item._id === action.payload._id);
        const indexRegisteredDay = state.infoRegisteredDay.findIndex((item) => item._id === action.payload._id);

        if (indexRegistered !== -1) state.registered[indexRegistered] = action.payload;
        else state.registered.push(action.payload);

        if (indexRegisteredDay !== -1) state.infoRegisteredDay[indexRegisteredDay] = action.payload;
        else state.infoRegisteredDay.push(action.payload);
      })
      .addCase(CancelEntrega_OrdenService.rejected, (state, action) => {
        state.isLoading = false;
        state.infoServiceOrder = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setOrderServiceId,
  setLastRegister,
  updateNotaOrden,
  updateLastRegister,
  LS_newOrder,
  LS_updateOrder,
  LS_updateListOrder,
  LS_updateRegisteredDay,
} = service_order.actions;
export default service_order.reducer;
