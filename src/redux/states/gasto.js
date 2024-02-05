import { createSlice } from '@reduxjs/toolkit';
import { AddGasto, GetGastoDate, GetGastos } from '../actions/aGasto';

const gasto = createSlice({
  name: 'gasto',
  initialState: {
    infoGasto: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updateGasto: (state, action) => {
      //state.infoGasto.push(action.payload);
      const exists = state.infoGasto.findIndex((item) => item._id === action.payload._id);
      if (exists === -1) {
        state.infoGasto.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Add
      .addCase(AddGasto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(AddGasto.fulfilled, (state, action) => {
        state.isLoading = false;
        const exists = state.infoGasto.findIndex((item) => item._id === action.payload._id);
        if (exists === -1) {
          state.infoGasto.push(action.payload);
        }
      })
      .addCase(AddGasto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // List
      .addCase(GetGastos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetGastos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoGasto = action.payload;
      })
      .addCase(GetGastos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // List x Date
      .addCase(GetGastoDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetGastoDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoGasto = action.payload;
      })
      .addCase(GetGastoDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { LS_updateGasto } = gasto.actions;
export default gasto.reducer;
