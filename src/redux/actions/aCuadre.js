import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { socket } from '../../utils/socket/connect';

export const GetCuadre = createAsyncThunk('cuadreDiario/GetCuadre', async (dateCuadre) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-cuadre/date/${dateCuadre}`);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error('No se pudieron obtener los datos');
  }
});

export const GetLastCuadre = createAsyncThunk('cuadreDiario/GetCajaInicial', async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-cuadre/last`);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error('No se pudieron obtener los datos');
  }
});

export const SaveCuadre = createAsyncThunk('cuadreDiario/SaveCuadre', async (infoCuadreDiario, { dispatch }) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/save-cuadre`, infoCuadreDiario);
    dispatch(GetLastCuadre());
    socket.emit('client:changeCuadre', response.data);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se Registro la Orden - ${error.response.data.mensaje}`);
  }
});
