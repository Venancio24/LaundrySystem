import { createSlice } from '@reduxjs/toolkit';
import {
  AddDelivery,
  GetDeliverysDate,
  //GetDeliverys,
  GetDeliverysID,
} from '../actions/aDelivery';

const delivery = createSlice({
  name: 'delivery',
  initialState: {
    infoDeliveryID: [],
    infoDeliveryDate: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updateDelivery: (state, action) => {
      const eDelivery = state.infoDeliveryDate.findIndex((item) => item._id === action.payload._id);
      if (eDelivery !== -1) {
        // Si existe, actualiza las propiedades existentes en action.payload en el elemento correspondiente
        Object.assign(state.infoDeliveryDate[eDelivery], action.payload);
      } else {
        console.log('no se econtro delivery');
      }
    },
    LS_newDelivery: (state, action) => {
      state.infoDeliveryDate.push(action.payload);
    },
    LS_CancelarDeliveryDevolucion: (state, action) => {
      const { idDeliveryDeleted } = action.payload;
      state.infoDeliveryDate = state.infoDeliveryDate.filter((item) => item.idCliente === idDeliveryDeleted);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(AddDelivery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(AddDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoDeliveryDate.push(action.payload);
      })
      .addCase(AddDelivery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // List for Fecha
      .addCase(GetDeliverysDate.pending, (state) => {
        state.isLoading = true;
        state.infoDeliveryDate = false;
        state.error = null;
      })
      .addCase(GetDeliverysDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoDeliveryDate = action.payload;
      })
      .addCase(GetDeliverysDate.rejected, (state, action) => {
        state.isLoading = false;
        state.infoDeliveryDate = false;
        state.error = action.error.message;
      })
      // List for ID
      .addCase(GetDeliverysID.pending, (state) => {
        state.isLoading = true;
        state.infoDeliveryID = false;
        state.error = null;
      })
      .addCase(GetDeliverysID.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoDeliveryID = action.payload;
      })
      .addCase(GetDeliverysID.rejected, (state, action) => {
        state.isLoading = false;
        state.infoDeliveryID = false;
        state.error = action.error.message;
      });
  },
});

export const { LS_updateDelivery, LS_newDelivery, LS_CancelarDeliveryDevolucion } = delivery.actions;
export default delivery.reducer;
