import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Notify } from '../../utils/notify/Notify';
import { socket } from '../../utils/socket/connect';

export const updatePrenda = createAsyncThunk('prenda/updatePrenda', async (productos) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/update-prendas`, productos);
    socket.emit('client:cPricePrendas', response.data);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    Notify('Error', 'No se pudo actualizar el precio de las prendas', 'fail');
    throw new Error(error);
  }
});

export const GetPrendas = createAsyncThunk('prenda/GetPrendas ', async () => {
  try {
    const respuesta = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-prendas`);

    return respuesta.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    console.log(error.response.data.mensaje);
    throw new Error(`No se pudo obtener el precio de las prendas - ${error}`);
  }
});
