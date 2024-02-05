import { createSlice } from '@reduxjs/toolkit';
import { GetPrendas, updatePrenda } from '../actions/aPrenda';

const prenda = createSlice({
  name: 'prenda',
  initialState: {
    infoPrendas: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updatePrendas: (state, action) => {
      state.infoPrendas = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update
      .addCase(updatePrenda.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrenda.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoPrendas = action.payload;
      })
      .addCase(updatePrenda.rejected, (state, action) => {
        state.isLoading = false;
      })
      // List
      .addCase(GetPrendas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetPrendas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoPrendas = action.payload;
      })
      .addCase(GetPrendas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { LS_updatePrendas } = prenda.actions;
export default prenda.reducer;
