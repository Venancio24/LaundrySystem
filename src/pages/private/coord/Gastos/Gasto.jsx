/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { AddGasto } from '../../../../redux/actions/aGasto';
import { DateCurrent } from '../../../../utils/functions';

import { NumberInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

import './gastos.scss';
import { simboloMoneda } from '../../../../services/global';

const Gasto = ({ onClose }) => {
  const dispatch = useDispatch();
  const InfoUsuario = useSelector((state) => state.user.infoUsuario);
  const { error } = useSelector((state) => state.gasto);

  const validationSchema = Yup.object().shape({
    descripcion: Yup.string().required('Ingrese motivo de gasto'),
    monto: Yup.string().required('Ingrese monto (numerico)'),
  });

  const openModal = (values) =>
    modals.openConfirmModal({
      title: 'Confirmar Gasto',
      centered: true,
      children: <Text size="sm">¿ Estas seguro que agregar este GASTO ?</Text>,
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => handleSaveGasto(values),
    });

  const handleSaveGasto = (infoGasto) => {
    dispatch(AddGasto({ infoGasto, rol: InfoUsuario.rol }));
    onClose(false);
  };

  return (
    <div>
      <Formik
        initialValues={{
          descripcion: '',
          fecha: DateCurrent().format4,
          hora: DateCurrent().format3,
          monto: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          openModal(values);
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, isSubmitting, handleSubmit, errors, touched }) => (
          <Form onSubmit={handleSubmit} className="container-gasto">
            <div className="info-gasto">
              <h1>Gastos</h1>
              <div className="input-g">
                <Field
                  placeholder="Motivo del Gasto.."
                  className="description-info"
                  as="textarea"
                  name="descripcion"
                  cols="30"
                  rows="5"
                />
                {errors.descripcion && touched.descripcion && (
                  <div className="ico-req">
                    <i className="fa-solid fa-circle-exclamation ">
                      <div className="info-req" style={{ pointerEvents: 'none' }}>
                        <span>{errors.descripcion}</span>
                      </div>
                    </i>
                  </div>
                )}
              </div>
              <div className="input-g">
                <NumberInput
                  name="monto"
                  value={values.monto}
                  parser={(value) => value.replace(new RegExp(`${simboloMoneda}\\s?|(,*)`, 'g'), '')}
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value))
                      ? `${simboloMoneda} ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                      : ''
                  }
                  placeholder="Ingrese Monto"
                  precision={2}
                  step={0.05}
                  hideControls
                  autoComplete="off"
                  onChange={(value) => setFieldValue('monto', value)}
                />
                {errors.monto && touched.monto && (
                  <div className="ico-req">
                    <i className="fa-solid fa-circle-exclamation ">
                      <div className="info-req" style={{ pointerEvents: 'none' }}>
                        <span>{errors.monto}</span>
                      </div>
                    </i>
                  </div>
                )}
              </div>
              <div className="actions-bottom">
                <button type="submit" disabled={isSubmitting} className="b-saved">
                  Agregar Gasto
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Gasto;
