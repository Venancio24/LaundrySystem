import { createSlice } from '@reduxjs/toolkit';
import { addPromocion, GetPromocion, DeletePromocion } from '../actions/aPromociones';

const promocion = createSlice({
  name: 'promocion',
  initialState: {
    infoPromocion: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updatePromociones: (state, action) => {
      const { onAction, info } = action.payload;
      if (onAction === 'add') {
        state.infoPromocion.push(info);
      } else if (onAction === 'delete') {
        state.infoPromocion = state.infoPromocion.filter((promocion) => promocion.codigo !== info.codigo);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Delete
      .addCase(DeletePromocion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(DeletePromocion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoPromocion = state.infoPromocion.filter((promocion) => promocion.codigo !== action.payload.codigo);
      })
      .addCase(DeletePromocion.rejected, (state) => {
        state.isLoading = false;
      })
      // List
      .addCase(GetPromocion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetPromocion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoPromocion = action.payload;
      })
      .addCase(GetPromocion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Add
      .addCase(addPromocion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPromocion.fulfilled, (state, action) => {
        state.isLoading = false;
        const payloadCodigo = action.payload.codigo;
        if (!state.infoPromocion.some((promocion) => promocion.codigo === payloadCodigo)) {
          state.infoPromocion.push(action.payload);
        }
      })
      .addCase(addPromocion.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { LS_updatePromociones } = promocion.actions;
export default promocion.reducer;
