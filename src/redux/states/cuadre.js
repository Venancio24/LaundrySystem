import { createSlice } from '@reduxjs/toolkit';
import { GetCuadre, SaveCuadre, GetLastCuadre } from '../actions/aCuadre';

const cuadre = createSlice({
  name: 'cuadre',
  initialState: {
    infoCuadreDate: null,
    stateActuallyCuadre: '',
    lastCuadre: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    LS_updateCuadre: (state, action) => {
      state.infoCuadreDate = action.payload;
    },
    updateLastCuadre: (state, action) => {
      state.lastCuadre = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetCuadre.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetCuadre.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload === null) {
          state.stateActuallyCuadre = 'noSaved';
        } else {
          state.stateActuallyCuadre = 'saved';
        }
        state.infoCuadreDate = action.payload;
      })
      .addCase(GetCuadre.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // List for Fecha
      .addCase(SaveCuadre.pending, (state) => {
        state.isLoading = true;
        state.infoCuadreDate = false;
        state.error = null;
      })
      .addCase(SaveCuadre.fulfilled, (state, action) => {
        state.isLoading = false;
        state.infoCuadreDate = action.payload;
      })
      .addCase(SaveCuadre.rejected, (state, action) => {
        state.isLoading = false;
        state.infoCuadreDate = false;
        state.error = action.error.message;
      })
      // List for Fecha
      .addCase(GetLastCuadre.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetLastCuadre.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload === null) {
          state.stateActuallyCuadre = 'noSaved';
          // state.lastCuadre = LAST_CUADRE_BASE;
        } else {
          state.stateActuallyCuadre = 'saved';
          state.lastCuadre = action.payload;
        }
      })
      .addCase(GetLastCuadre.rejected, (state, action) => {
        state.isLoading = false;
        // state.lastCuadre = LAST_CUADRE_BASE;
        state.error = action.error.message;
      });
  },
});

export const { LS_updateCuadre, updateLastCuadre } = cuadre.actions;
export default cuadre.reducer;
