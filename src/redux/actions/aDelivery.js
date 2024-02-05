import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const GetDeliverys = createAsyncThunk('delivery/GetDeliverys', async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-delivery`);

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudieron obtener los datos del usuario - ${error}`);
  }
});

export const GetDeliverysID = createAsyncThunk('delivery/GetDeliverysID', async (id) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-delivery/${id}`);

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudieron obtener los datos del usuario - ${error}`);
  }
});

export const GetDeliverysDate = createAsyncThunk('delivery/GetDeliverysDate', async (fecha) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-delivery-date/${fecha}`);

    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudieron obtener los datos del usuario - ${error}`);
  }
});

export const AddDelivery = createAsyncThunk('delivery/AddDelivery', async (infoDelivery) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/add-delivery`, infoDelivery);
    return response.data;
  } catch (error) {
    // Puedes manejar los errores aquí
    throw new Error(`No se pudieron obtener los datos del usuario - ${error}`);
  }
});
