/* eslint-disable no-unused-vars */
import { Button, Modal, MultiSelect, NumberInput, Select, Table, Textarea } from '@mantine/core';
import * as Yup from 'yup';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import React, { useEffect, useState, useRef } from 'react';
import { useFormik } from 'formik';
import { useDisclosure } from '@mantine/hooks';
import { ScrollArea } from '@mantine/core';
import './promocion.scss';
import SwitchModel from '../../../../components/SwitchModel/SwitchModel';
import { useDispatch, useSelector } from 'react-redux';
import { ReactComponent as Eliminar } from '../../../../utils/img/OrdenServicio/eliminar.svg';
import { DeletePromocion, addPromocion } from '../../../../redux/actions/aPromociones';
import { codigoPhonePais, nameMoneda } from '../../../../services/global';
import giftcupon from './gift.png';
import { WSendMessage, handleRegisterCupon } from '../../../../services/default.services';
import { Notify } from '../../../../utils/notify/Notify';
import whatsappApp from './whatsappApp.png';
import Cupon from '../../../../components/PRIVATE/Cupon/Cupon';
import axios from 'axios';
import moment from 'moment';
import { DateDetail, calcularFechaFutura } from '../../../../utils/functions';

const Promociones = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const dispatch = useDispatch();
  const [listPrendas, setListPrendas] = useState([]);
  const [promoSelected, setPromoSelected] = useState();
  const [phoneA, setPhoneA] = useState('');
  const [sCuponSaved, setSCuponSaved] = useState(false);
  const [lPrendasInicial, setLPrendasInicial] = useState([]);

  const [modeSelect, setModeSelect] = useState('unico');

  const inputRef = useRef();

  //const [listPromociones, setListPromociones] = useState([]);
  const infoProductos = useSelector((state) => state.prenda.infoPrendas);
  const infoPromocion = useSelector((state) => state.promocion.infoPromocion);
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const validationSchema = Yup.object().shape({
    tipoPromocion: Yup.string().required('Campo obligatorio'),
    prenda:
      modeSelect === 'unico'
        ? Yup.string().required('Campo obligatorio')
        : Yup.array().min(1, 'Debe seleccionar al menos una prenda').of(Yup.string().required('Campo obligatorio')),
    cantidadMin: Yup.string().required('Campo obligatorio'),
    tipoDescuento: Yup.string().required('Campo obligatorio'),
    descripcion: Yup.string().required('Campo obligatorio'),
    descuento: Yup.string().required('Campo obligatorio'),
    vigencia: Yup.string().required('Campo obligatorio'),
  });

  const formik = useFormik({
    initialValues: {
      tipoPromocion: 'Unico',
      prenda: '',
      cantidadMin: 0,
      tipoDescuento: 'Porcentaje',
      descripcion: '',
      descuento: '',
      vigencia: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      validAddPromocion(values);
    },
  });

  const validAddPromocion = (data) =>
    modals.openConfirmModal({
      title: 'Registro de Promocion',
      centered: true,
      children: <Text size="sm">¿ Estas seguro de agregar esta nueva Promocion ?</Text>,
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'green' },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        dispatch(addPromocion(data));
        // formik.resetForm();
      },
    });

  const validDeletePromocion = (cod) =>
    modals.openConfirmModal({
      title: 'Eliminar Promocion',
      centered: true,
      children: <Text size="sm">¿ Estas seguro de eliminar esta promocion ?</Text>,
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'red' },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => dispatch(DeletePromocion(cod)),
    });

  const handleAddPromocion = async (promo) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/generate-codigo-cupon`);

      if (response.data) {
        const codigoCupon = response.data;
        setPromoSelected({ codigoCupon, ...promo });
        open();
        setTimeout(() => {
          inputRef.current.focus();
        }, 1000);
      } else {
        alert('No se pudo generar promocion');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  const validIco = (mensaje) => {
    return (
      <div className="ico-req">
        <i className="fa-solid fa-circle-exclamation ">
          <div className="info-req" style={{ pointerEvents: 'none' }}>
            <span>{mensaje}</span>
          </div>
        </i>
      </div>
    );
  };

  const handleSavedSendCup = async () => {
    const promociones = [{ codigoPromocion: promoSelected.codigo, codigoCupon: promoSelected.codigoCupon }];
    await handleRegisterCupon(promociones).then((responses) => {
      const res = responses[0];
      if (res.status === 201) {
        Notify('Cupon Creado Existosamente', res.data.mensaje, 'success');
        handleSendMessage();
      }
    });
  };

  const handleSendMessage = () => {
    const number = phoneA;
    const mensaje = `¡Hola le saluda la *Lavanderia ${InfoNegocio.name}*, enviandole este *promocion* de *regalo* : *${
      promoSelected.descripcion
    }*, puede cangearlo con el siguiente codigo: *${promoSelected.codigoCupon}* hasta el día ${calcularFechaFutura(
      promoSelected.vigencia
    )}`;
    for (let index = 0; index < 2; index++) {
      WSendMessage(mensaje, number);
    }
  };

  useEffect(() => {
    if (infoProductos.length > 0) {
      const filteredArray = infoProductos.filter((item) => item.name !== 'Delivery');
      const resultArray = filteredArray.map((item) => item.name);
      resultArray.unshift('Todos'); // Agrega 'Todos' al principio del array
      setListPrendas(resultArray);
      setLPrendasInicial(resultArray);
    }
  }, [infoProductos]);

  return (
    <div className="content-promos">
      <div className="form-promotion">
        <form onSubmit={formik.handleSubmit} className="container">
          <h1>Promociones</h1>
          <div className="input-item">
            <SwitchModel
              title="Tipo de Promocion :"
              onSwitch="Unico" // TRUE
              offSwitch="Varios" // FALSE
              name="tipoPromocion"
              defaultValue={formik.values.tipoPromocion === 'Unico' ? true : false}
              onChange={(value) => {
                formik.setFieldValue('tipoDescuento', 'Porcentaje');
                if (value === true) {
                  formik.setFieldValue('prenda', '');
                  const filteredList = lPrendasInicial.filter((item) => item !== 'Todos');
                  setListPrendas(filteredList);
                  formik.setFieldValue('tipoPromocion', 'Unico');
                  formik.setFieldValue('cantidadMin', '');

                  setModeSelect('unico');
                } else {
                  formik.setFieldValue('prenda', []);
                  formik.setFieldValue('tipoPromocion', 'Varios');
                  setListPrendas(lPrendasInicial);
                  if (formik.values.tipoDescuento === 'Monto') {
                    formik.setFieldValue('cantidadMin', '');
                  } else {
                    formik.setFieldValue('cantidadMin', 0);
                  }
                  setModeSelect('varios');
                }
              }}
            />
            {formik.errors.tipoPromocion && formik.touched.tipoPromocion && validIco(formik.errors.tipoPromocion)}
          </div>
          {formik.values.tipoPromocion === 'Unico' ? (
            <>
              <div className="input-item">
                <SwitchModel
                  title="Tipo de Descuento :"
                  onSwitch="Gratis" // TRUE
                  offSwitch="Porcentaje" // FALSE
                  name="tipoDescuento"
                  defaultValue={formik.values.tipoDescuento === 'Porcentaje' ? false : true}
                  onChange={(value) => {
                    formik.setFieldValue('descuento', '');
                    if (value === true) {
                      formik.setFieldValue('tipoDescuento', 'Gratis');
                    } else {
                      formik.setFieldValue('tipoDescuento', 'Porcentaje');
                    }
                  }}
                />
                {formik.errors.tipoDescuento && formik.touched.tipoDescuento && validIco(formik.errors.tipoDescuento)}
              </div>
              <div className="input-item">
                {formik.values.tipoDescuento === 'Gratis' ? (
                  <NumberInput
                    name="descuento"
                    label="Numero Prendas Gratuitas"
                    value={formik.values.descuento}
                    precision={2}
                    min={0}
                    step={1}
                    hideControls
                    autoComplete="off"
                    onChange={(e) => {
                      formik.setFieldValue('descuento', e);
                    }}
                  />
                ) : (
                  <NumberInput
                    name="descuento"
                    label="Porcentaje de Descuento :"
                    value={formik.values.descuento}
                    placeholder="Ingrese Porcentaje de Descuento"
                    precision={2}
                    max={100}
                    min={0}
                    step={10}
                    hideControls
                    autoComplete="off"
                    onChange={(e) => {
                      formik.setFieldValue('descuento', e);
                    }}
                  />
                )}
                {formik.errors.descuento && formik.touched.descuento && validIco(formik.errors.descuento)}
              </div>
              <div className="input-item">
                <Select
                  name="prenda"
                  label="Prenda"
                  value={formik.values.prenda}
                  onChange={(e) => {
                    formik.setFieldValue('prenda', e);
                  }}
                  placeholder="Escoge una prenda"
                  clearable
                  searchable
                  data={listPrendas}
                />
                {formik.errors.prenda && formik.touched.prenda && validIco(formik.errors.prenda)}
              </div>
              <div className="input-item">
                <NumberInput
                  name="cantidadMin"
                  label="Cantidad Minima :"
                  value={formik.values.cantidadMin}
                  placeholder="Cantidad Minima para efectuar promocion"
                  precision={0}
                  min={0}
                  step={1}
                  hideControls
                  autoComplete="off"
                  onChange={(e) => {
                    formik.setFieldValue('cantidadMin', e);
                  }}
                />
                {formik.errors.cantidadMin && formik.touched.cantidadMin && validIco(formik.errors.cantidadMin)}
              </div>

              <div className="input-item">
                <Textarea
                  name="descripcion"
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  placeholder="Promocion 2 x 1 en ..."
                  label="Ingrese Descripcion"
                />
                {formik.errors.descripcion && formik.touched.descripcion && validIco(formik.errors.descripcion)}
              </div>
            </>
          ) : (
            <>
              <div className="input-item">
                <SwitchModel
                  title="Tipo de Descuento :"
                  onSwitch="Monto" // TRUE
                  offSwitch="Porcentaje" // FALSE
                  name="tipoDescuento"
                  defaultValue={formik.values.tipoDescuento === 'Monto' ? true : false}
                  onChange={(value) => {
                    // formik.setFieldValue('descuento', '');
                    if (value === true) {
                      formik.setFieldValue('tipoDescuento', 'Monto');
                      formik.setFieldValue('prenda', ['Todos']);
                      setListPrendas(['Todos']);
                      formik.setFieldValue('cantidadMin', '');
                    } else {
                      formik.setFieldValue('tipoDescuento', 'Porcentaje');
                      formik.setFieldValue('cantidadMin', 0);
                      if (formik.values.prenda.includes('Todos')) {
                        setListPrendas(['Todos']);
                      } else {
                        setListPrendas(lPrendasInicial);
                      }
                      formik.setFieldValue('prenda', ['Todos']);
                      formik.setFieldValue('tipoDescuento', 'Monto');
                      formik.setFieldValue('prenda', ['Todos']);
                      setListPrendas(['Todos']);
                      formik.setFieldValue('cantidadMin', '');
                    }
                  }}
                />
                {formik.errors.tipoDescuento && formik.touched.tipoDescuento && validIco(formik.errors.tipoDescuento)}
              </div>
              <div className="input-item">
                {formik.values.tipoDescuento === 'Monto' ? (
                  <NumberInput
                    name="descuento"
                    label={`Monto de Descuento : (${nameMoneda})`}
                    placeholder={`Monto en ${nameMoneda}`}
                    value={formik.values.descuento}
                    precision={2}
                    min={1}
                    step={1}
                    hideControls
                    autoComplete="off"
                    onChange={(e) => {
                      formik.setFieldValue('descuento', e);
                    }}
                  />
                ) : (
                  <NumberInput
                    name="descuento"
                    label="Porcentaje de Descuento :"
                    value={formik.values.descuento}
                    placeholder="Ingrese Porcentaje de Descuento"
                    precision={2}
                    max={100}
                    min={0}
                    step={10}
                    hideControls
                    autoComplete="off"
                    onChange={(e) => {
                      formik.setFieldValue('descuento', e);
                    }}
                  />
                )}
                {formik.errors.descuento && formik.touched.descuento && validIco(formik.errors.descuento)}
              </div>
              <div className="input-item">
                <MultiSelect
                  name="prenda"
                  label="Prenda"
                  value={formik.values.prenda}
                  onChange={(e) => {
                    if (e.includes('Todos')) {
                      setListPrendas(['Todos']);
                      formik.setFieldValue('prenda', ['Todos']);
                    } else {
                      if (formik.values.tipoDescuento === 'Porcentaje') {
                        setListPrendas(lPrendasInicial);
                      }
                      formik.setFieldValue('prenda', e);
                    }
                  }}
                  placeholder="Escoge una prenda"
                  clearable
                  searchable
                  data={listPrendas}
                />
                {formik.errors.prenda && formik.touched.prenda && validIco(formik.errors.prenda)}
              </div>

              <div className="input-item">
                <NumberInput
                  name="cantidadMin"
                  label={`Cantidad Minima : (${formik.values.tipoDescuento === 'Monto' ? nameMoneda : 'Prenda'})`}
                  value={formik.values.cantidadMin}
                  placeholder="Cantidad Minima para efectuar promocion"
                  precision={0}
                  disabled={formik.values.tipoDescuento === 'Porcentaje'}
                  min={formik.values.descuento !== 0 ? formik.values.descuento : null}
                  step={1}
                  hideControls
                  autoComplete="off"
                  onChange={(e) => {
                    formik.setFieldValue('cantidadMin', e);
                  }}
                />
                {formik.errors.cantidadMin && formik.touched.cantidadMin && validIco(formik.errors.cantidadMin)}
              </div>

              <div className="input-item">
                <Textarea
                  name="descripcion"
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  placeholder="Promocion 2 x 1 en ..."
                  label="Ingrese Descripcion"
                />
                {formik.errors.descripcion && formik.touched.descripcion && validIco(formik.errors.descripcion)}
              </div>
            </>
          )}
          <div className="input-item">
            <NumberInput
              name="vigencia"
              label="Vigencia: (Dias)"
              value={formik.values.vigencia}
              placeholder="N° Dias para q caduque promocion"
              precision={0}
              min={1}
              step={1}
              hideControls
              autoComplete="off"
              onChange={(e) => {
                formik.setFieldValue('vigencia', e);
              }}
            />
            {formik.errors.vigencia && formik.touched.vigencia && validIco(formik.errors.vigencia)}
          </div>
          <Button type="submit" className="btn-save" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            Agregar Promocion
          </Button>
        </form>
      </div>
      <div className="list-promotions">
        {infoPromocion?.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descripcion</th>
                <th>Descuento</th>
                <th>Prenda</th>
                <th>Cantidad Minima</th>
                <th>Tipo Descuento</th>
                <th>Vigencia</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {infoPromocion.map((p, index) => (
                <tr key={index}>
                  <td>{p.codigo}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.descuento}</td>
                  <td>{p.prenda}</td>
                  <td>{p.cantidadMin}</td>
                  <td>{p.tipoDescuento}</td>
                  <td>{p.vigencia}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn delete"
                        type="button"
                        onClick={() => {
                          validDeletePromocion(p.codigo);
                        }}
                      >
                        <Eliminar className="delete-action" />
                      </button>
                      <button
                        className="btn gift"
                        type="button"
                        onClick={() => {
                          handleAddPromocion(p);
                        }}
                      >
                        <img className="gift-action" src={giftcupon} alt="" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
      </div>
      <Modal
        opened={opened}
        closeOnClickOutside={false}
        // closeOnEscape={false}
        // withCloseButton={false}
        onClose={() => {
          setSCuponSaved(false);
          setPhoneA('');
          setPromoSelected();
          close();
        }}
        size={450}
        title={'Cupon de Promociones Manual'}
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (sCuponSaved === false) {
              setSCuponSaved(true);
              handleSavedSendCup();
            } else {
              handleSendMessage();
            }
          }}
          className="content-generate-cupon"
        >
          <div className="cup-space">
            <Cupon infoPromo={promoSelected} />
          </div>
          <div className="send-whatsapp">
            <button type="button" className="btn-send-whatsapp app">
              <img src={whatsappApp} alt="" />
            </button>
            <div className="info-cel">
              <label htmlFor="">Numero Celular :</label>
              <input
                type="number"
                required
                ref={inputRef}
                onDragStart={(e) => e.preventDefault()}
                defaultValue={`${codigoPhonePais}${phoneA}`}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const validInput = inputValue ? inputValue.replace(/[^0-9.]/g, '') : '';
                  setPhoneA(validInput);
                }}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={phoneA.length <= 8}
            className="btn-save"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            {sCuponSaved === false ? 'Guardar y Enviar' : 'Reenviar'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Promociones;
