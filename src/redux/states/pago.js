import { createSlice } from "@reduxjs/toolkit";
import {
  AddPago,
  GetPagosByDate,
  UpdatePago,
  DeletePago,
} from "../actions/aPago";

const pago = createSlice({
  name: "pago",
  initialState: {
    infoPago: [],
    listPagoByDate: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    // LS_changeListPagoByDate: (state, action) => {
    //   const { tipo, info } = action.payload;
    //   // Realizar la acción según el tipo
    //   if (tipo === "deleted") {
    //     // Eliminar el pago del array ListPago
    //     state.listPagoByDate = state.listPagoByDate.filter(
    //       (pago) => pago?._id !== info?._id
    //     );
    //   } else if (tipo === "updated") {
    //     // Actualizar el pago con la nueva información
    //     const indexPago = state.listPagoByDate.findIndex(
    //       (pago) => pago?._id === info?._id
    //     );
    //     if (indexPago !== -1) {
    //       state.listPagoByDate[indexPago] = info;
    //     } else {
    //       console.error("No se encontró el pago a actualizar");
    //     }
    //   } else if (tipo === "added") {
    //     // Agregar el nuevo pago a ListPago
    //     if (!state.listPagoByDate.some((pago) => pago?._id === info?._id)) {
    //       state.listPagoByDate.push(info);
    //     }
    //   } else {
    //     console.error("Tipo de acción no válido");
    //   }
    // },
  },
  extraReducers: (builder) => {
    builder
      // AddPago
      .addCase(AddPago.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(AddPago.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listPagoByDate.push(action.payload.info);
      })
      .addCase(AddPago.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // GetPagosByDate
      .addCase(GetPagosByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(GetPagosByDate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listPagoByDate = action.payload; // Actualiza el estado con los pagos obtenidos
      })
      .addCase(GetPagosByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // UpdatePago
      .addCase(UpdatePago.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedPago = action.payload;
        const indexPago = state.listPagoByDate.findIndex(
          (pago) => pago?._id === updatedPago._id
        );
        if (indexPago !== -1) {
          state.listPagoByDate[indexPago] = updatedPago;
        } else {
          console.error("No se encontró el pago a actualizar");
        }
      })
      .addCase(UpdatePago.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // DeletePago
      .addCase(DeletePago.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedPagoId = action.payload._id;
        state.listPagoByDate = state.listPagoByDate.filter(
          (pago) => pago._id !== deletedPagoId
        );
      })
      .addCase(DeletePago.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

// export const { LS_changeListPagoByDate } = pago.actions;
export default pago.reducer;
