/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import './negocio.scss';
import { modals } from '@mantine/modals';
import { Button, Text } from '@mantine/core';
import { TextInput } from '@mantine/core';
import SwitchModel from '../../../../../components/SwitchModel/SwitchModel';
import { TimeInput } from '@mantine/dates';
import { PrivateRoutes } from '../../../../../models';
import { useNavigate } from 'react-router-dom';
import { UpdateInfoNegocio } from '../../../../../redux/actions/aNegocio';

const Negocio = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const formik = useFormik({
    initialValues: {
      name: InfoNegocio.name,
      direccion: InfoNegocio.direccion,
      numero: InfoNegocio.numero,
      horario: InfoNegocio.horario,
      estado: InfoNegocio.estado,
    },
    //validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      openModal(values);
      setSubmitting(false);
    },
  });

  const openModal = (data) =>
    modals.openConfirmModal({
      title: 'Acttualizar Informacion de Negocio',
      centered: true,
      children: <Text size="sm">¿ Desea de realizar cambios en el informacion del negocio ?</Text>,
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'green' },
      onCancel: () => console.log('Cancelado'),
      onConfirm: () => handleUpdateNegocio(data),
    });

  const handleUpdateNegocio = (data) => {
    dispatch(UpdateInfoNegocio(data));
    navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`);
  };

  const handleChangeDay = (day) => {
    const dias = formik.values.horario?.dias;
    const updatedDias = dias.includes(day) ? dias.filter((d) => d !== day) : [...dias, day];
    formik.setFieldValue('horario.dias', updatedDias);
  };

  useEffect(() => {
    formik.setFieldValue('name', InfoNegocio.name);
    formik.setFieldValue('direccion', InfoNegocio.direccion);
    formik.setFieldValue('numero', InfoNegocio.numero);
    formik.setFieldValue('horario', InfoNegocio.horario);
    formik.setFieldValue('estado', InfoNegocio.estado);
  }, [InfoNegocio]);

  const renderDayCell = (day) => (
    <td key={day} onClick={() => handleChangeDay(day)}>
      <div className={`item-day ${formik.values.horario?.dias.includes(day) ? 'open' : 'close'}`}>
        <div className="day" />
      </div>
    </td>
  );

  return (
    <div className="content-negocio">
      {Object.keys(InfoNegocio).length > 0 ? (
        <form onSubmit={formik.handleSubmit} className="form-info">
          <h1>Informacion del Negocio</h1>
          <div className="data">
            <div className="info-base">
              <div className="input-item">
                <TextInput
                  name="name"
                  label="Nombre :"
                  defaultValue={formik.values.name}
                  placeholder="Ingrese Nombre del Negocio"
                  autoComplete="off"
                  required
                  onChange={(e) => {
                    formik.setFieldValue('name', e.target.value);
                  }}
                />
                {/* {formik.errors.cantidadMin && formik.touched.cantidadMin && validIco(formik.errors.cantidadMin)} */}
              </div>
              <div className="input-item">
                <TextInput
                  name="direccion"
                  label="direccion :"
                  defaultValue={formik.values.direccion}
                  placeholder="Ingrese Direccion"
                  required
                  autoComplete="off"
                  onChange={(e) => {
                    formik.setFieldValue('direccion', e.target.value);
                  }}
                />
                {/* {formik.errors.cantidadMin && formik.touched.cantidadMin && validIco(formik.errors.cantidadMin)} */}
              </div>
              <div className="input-item">
                <TextInput
                  name="numero"
                  label="Numero :"
                  defaultValue={formik.values.numero?.info}
                  placeholder="Ingrese Numero de contacto"
                  autoComplete="off"
                  required
                  onChange={(e) => {
                    formik.setFieldValue('numero.info', e.target.value);
                  }}
                />
                <button
                  className={`state-ii ${formik.values.numero?.state ? 'show' : 'hide'}`}
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('numero.state', !formik.values.numero?.state);
                  }}
                >
                  {formik.values.numero?.state ? (
                    <i className="fa-solid fa-eye" />
                  ) : (
                    <i className="fa-solid fa-eye-slash" />
                  )}
                </button>
                {/* {formik.errors.cantidadMin && formik.touched.cantidadMin && validIco(formik.errors.cantidadMin)} */}
              </div>
            </div>
            {/* <div className="state">
              <div className="input-item">
                <SwitchModel
                  title="Estado"
                  onSwitch="Abierto" // TRUE
                  offSwitch="Cerrado" // FALSE
                  name="estado"
                  defaultValue={formik.values.estado}
                  onChange={(value) => {
                    formik.setFieldValue('estado', value);
                  }}
                />
              </div>
            </div> */}
          </div>
          <div>
            <h2>Horario de Atencion</h2>
            <table className="t-horario">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Lunes</th>
                  <th>Martes</th>
                  <th>Miércoles</th>
                  <th>Jueves</th>
                  <th>Viernes</th>
                  <th>Sábado</th>
                  <th>Domingo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="horario">
                      <TimeInput
                        name="inicio"
                        required
                        defaultValue={formik.values.horario?.horas.inicio}
                        onChange={(e) => {
                          formik.setFieldValue('horario.horas.inicio', e.target.value);
                        }}
                      />
                      <TimeInput
                        required
                        name="fin"
                        defaultValue={formik.values.horario?.horas.fin}
                        onChange={(e) => {
                          formik.setFieldValue('horario.horas.fin', e.target.value);
                        }}
                      />
                    </div>
                  </td>
                  {Array.from({ length: 7 }, (_, day) => renderDayCell(day + 1))}
                </tr>
              </tbody>
            </table>
          </div>
          <Button type="submit" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            Actualizar
          </Button>
        </form>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Negocio;
