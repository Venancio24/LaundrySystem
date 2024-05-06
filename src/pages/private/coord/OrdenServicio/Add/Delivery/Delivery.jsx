/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NumberInput } from "@mantine/core";

import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

// import Factura from "../../../../../Data/ReusableComponent/Factura/Factura";
import OrdenServicio from "../../../../../../components/PRIVATE/OrdenServicio/OrdenServicio";
import LoaderSpiner from "../../../../../../components/LoaderSpinner/LoaderSpiner";
import { DateCurrent } from "../../../../../../utils/functions";
import "./delivery.scss";

import { ReactComponent as Moto } from "../../../../../../utils/img/Delivery/moto.svg";
import { ReactComponent as Taxi } from "../../../../../../utils/img/Delivery/taxi-lateral.svg";

import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDispatch, useSelector } from "react-redux";
import { AddOrdenServices } from "../../../../../../redux/actions/aOrdenServices";

import { setLastRegister } from "../../../../../../redux/states/service_order";
import { PrivateRoutes } from "../../../../../../models";
import { simboloMoneda } from "../../../../../../services/global";

const Delivery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const infoCodigo = useSelector((state) => state.codigo.infoCodigo);
  const { lastRegister } = useSelector((state) => state.orden);

  const { InfoImpuesto } = useSelector((state) => state.modificadores);

  const InfoUsuario = useSelector((state) => state.user.infoUsuario);

  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const [registrar, setRegistrar] = useState(false);

  const [redirect, setRedirect] = useState(false);

  const [infoGastoByDelivery, setInfoGastoByDelivery] = useState();
  const [nameDefault, setNameDefault] = useState();

  const infoServiceDelivery = useSelector(
    (state) => state.servicios.serviceDelivery
  );

  const infoTipoGastoDeliveryRecojo = useSelector(
    (state) => state.tipoGasto.iDeliveryRecojo
  );

  // Reservar
  const handleReservar = (values) => {
    const infoGastoByDelivery = {
      idTipoGasto: infoTipoGastoDeliveryRecojo._id,
      tipo: infoTipoGastoDeliveryRecojo.name,
      motivo: `[${String(infoCodigo.codActual).padStart(
        4,
        "0"
      )}] Delivery recojo en ${values.tipoDelivery} - ${values.name}`,
      date: {
        fecha: DateCurrent().format4,
        hora: DateCurrent().format3,
      },
      monto: values.price,
      idUser: InfoUsuario._id,
    };

    const infoOrden = {
      codRecibo: infoCodigo.codActual,
      dateRecepcion: {
        fecha: DateCurrent().format4,
        hora: DateCurrent().format3,
      },
      Modalidad: "Delivery",
      Nombre: values.name,
      Items: [
        {
          identificador: infoServiceDelivery._id,
          tipo: "servicio",
          cantidad: 1,
          item: infoServiceDelivery.nombre,
          simboloMedida: infoServiceDelivery.simboloMedida,
          descripcion: "Recojo y Entrega",
          price: infoServiceDelivery.precioVenta,
          total: infoServiceDelivery.precioVenta,
          disable: {
            cantidad: true,
            item: true,
            descripcion: true,
            total: false,
            action: true,
          },
        },
      ],
      celular: "",
      datePrevista: {
        fecha: "",
        hora: "",
      },
      dateEntrega: {
        fecha: "",
        hora: "",
      },
      descuento: 0,
      estadoPrenda: "pendiente",
      estado: "reservado",
      dni: "",
      factura: false,
      subTotal: 0,
      cargosExtras: {
        beneficios: {
          puntos: 0,
          promociones: [],
        },
        descuentos: {
          puntos: 0,
          promocion: 0,
        },
        igv: {
          valor: InfoImpuesto.IGV,
          importe: 0,
        },
      },
      totalNeto: 0,
      modeRegistro: "nuevo",
      modoDescuento: "Puntos",
      gift_promo: [],
      attendedBy: {
        name: InfoUsuario.name,
        rol: InfoUsuario.rol,
      },
      typeRegistro: "normal",
    };

    dispatch(
      AddOrdenServices({
        infoOrden,
        rol: InfoUsuario.rol,
        infoPago: [],
        infoGastoByDelivery,
      })
    ).then((res) => {
      if (res.payload) {
        navigate(
          `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
        );
      }
    });
  };

  // Registrar
  const handleRegistrar = (info) => {
    const { infoOrden, infoPago, rol } = info;
    if (infoGastoByDelivery) {
      dispatch(
        AddOrdenServices({
          infoOrden,
          infoPago,
          rol,
          infoGastoByDelivery,
        })
      ).then((res) => {
        if ("error" in res) {
          setRedirect(false);
        } else {
          setRedirect(true);
        }
      });
    }
  };

  const handleGetInfoGastoByDelivery = (values) => {
    const infoGastoByDeliveryRecojo = {
      idTipoGasto: infoTipoGastoDeliveryRecojo._id,
      tipo: infoTipoGastoDeliveryRecojo.name,
      motivo: `[${String(infoCodigo.codActual).padStart(
        4,
        "0"
      )}] Delivery recojo en ${values.tipoDelivery} - ${values.name}`,
      date: {
        fecha: DateCurrent().format4,
        hora: DateCurrent().format3,
      },
      monto: values.price,
      idUser: InfoUsuario._id,
    };

    setNameDefault(values.name);
    setInfoGastoByDelivery(infoGastoByDeliveryRecojo);

    setRegistrar(true);
  };

  const inputRef = useRef(null);

  const openModal = (values) =>
    modals.openConfirmModal({
      title: "Reserva de Pedido",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro que quieres RESERVAR este pedido ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => handleReservar(values),
    });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    price: Yup.string().required("Campo obligatorio (numero)"),
    tipoDelivery: Yup.string().required("Selecciona medio de transporte"),
  });

  useEffect(() => {
    if (shouldFocusInput) {
      inputRef.current.focus();
      setShouldFocusInput(false);
    }
  }, [shouldFocusInput]);

  useEffect(() => {
    if (lastRegister !== null) {
      const getId = lastRegister._id;
      dispatch(setLastRegister());
      navigate(
        `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.IMPRIMIR_ORDER_SERVICE}/${getId}`
      );
    }
  }, [lastRegister]);

  return (
    <>
      {redirect === false ? (
        <div className="delivery-orden-service">
          {registrar === false ? (
            <Formik
              initialValues={{
                name: "",
                price: "",
                tipoDelivery: "",
                submitAction: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                if (values.submitAction === "reservar") {
                  openModal(values);
                } else if (values.submitAction === "registrar") {
                  handleGetInfoGastoByDelivery(values);
                }
                setSubmitting(false);
              }}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                handleChange,
                handleSubmit,
                setFieldValue,
              }) => (
                <Form onSubmit={handleSubmit} className="content-delivery">
                  <fieldset className="checkbox-group">
                    <legend className="checkbox-group-legend">Delivery</legend>
                    <div className="checkbox">
                      <label className="checkbox-wrapper">
                        <Field
                          type="radio"
                          className="checkbox-input"
                          name="tipoDelivery"
                          value="Taxi"
                          onClick={() => {
                            // setFieldValue('price', +getProductValue('Delivery'));
                            setShouldFocusInput(true);
                          }}
                        />
                        <span className="checkbox-tile">
                          <span className="checkbox-icon">
                            <Taxi className="custom-icon" />
                          </span>
                          <span className="checkbox-label">Taxi</span>
                        </span>
                      </label>
                    </div>
                    <div className="checkbox">
                      <label className="checkbox-wrapper">
                        <Field
                          type="radio"
                          className="checkbox-input"
                          name="tipoDelivery"
                          value="Moto"
                          onClick={() => {
                            setFieldValue("price", "");
                            setShouldFocusInput(true);
                          }}
                        />
                        <span className="checkbox-tile">
                          <span className="checkbox-icon">
                            <Moto className="custom-icon" />
                          </span>
                          <span className="checkbox-label">Moto</span>
                        </span>
                      </label>
                    </div>
                    {errors.tipoDelivery && touched.tipoDelivery && (
                      <div className="ico-req">
                        <i className="fa-solid fa-circle-exclamation ">
                          <div
                            className="info-req"
                            style={{ pointerEvents: "none" }}
                          >
                            <span>{errors.tipoDelivery}</span>
                          </div>
                        </i>
                      </div>
                    )}
                  </fieldset>
                  <hr />
                  <div className="code-reserva">
                    <h2>Codigo de Reserva</h2>
                    <h1>{String(infoCodigo.codActual).padStart(6, "0")}</h1>
                  </div>
                  <div className="selectBoxGroup">
                    <div className="selectBox radio">
                      <input
                        type="checkbox"
                        id={"radio-recojo"}
                        readOnly={true}
                        checked={true}
                      />
                      <label htmlFor={"radio-recojo"}>Recojo</label>
                    </div>
                  </div>
                  <div className="infoDelivery">
                    <div className="name-d">
                      <div className="input-valid">
                        <input
                          type="text"
                          name="name"
                          onChange={handleChange}
                          value={values.name}
                          placeholder="Ingrese Nombre"
                          autoComplete="off"
                          ref={inputRef}
                        />
                        {errors.name && touched.name && (
                          <div className="ico-req">
                            <i className="fa-solid fa-circle-exclamation ">
                              <div
                                className="info-req"
                                style={{ pointerEvents: "none" }}
                              >
                                <span>{errors.name}</span>
                              </div>
                            </i>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="data-prices">
                      <div className="input-valid">
                        <NumberInput
                          name="price"
                          value={values.price}
                          parser={(value) =>
                            value.replace(
                              new RegExp(`${simboloMoneda}\\s?|(,*)`, "g"),
                              ""
                            )
                          }
                          formatter={(value) => {
                            return Number.isNaN(parseFloat(value))
                              ? ""
                              : `${simboloMoneda} ${value}`.replace(
                                  /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
                                  ","
                                );
                          }}
                          placeholder="Ingrese Monto"
                          precision={2}
                          step={0.05}
                          hideControls={true}
                          autoComplete="off"
                          onChange={(value) => setFieldValue("price", value)}
                        />
                        {errors.price && touched.price && (
                          <div className="ico-req">
                            <i className="fa-solid fa-circle-exclamation ">
                              <div
                                className="info-req"
                                style={{ pointerEvents: "none" }}
                              >
                                <span>{errors.price}</span>
                              </div>
                            </i>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="footer-delivery">
                    <button
                      type="submit"
                      className="btn-saved"
                      disabled={isSubmitting}
                      onClick={() => setFieldValue("submitAction", "reservar")}
                    >
                      Reservar
                    </button>
                    <button
                      type="submit"
                      className="btn-saved"
                      onClick={() => setFieldValue("submitAction", "registrar")}
                    >
                      Registrar
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="OS-content">
              <div className="title-action">
                <h1 className="elegantshadow">Agregando Factura</h1>
                <h1 className="elegantshadow">- DELIVERY -</h1>
              </div>
              <OrdenServicio
                mode={"Delivery"}
                action={"Guardar"}
                onAction={handleRegistrar}
                onReturn={setRegistrar}
                nameDefault={nameDefault}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      )}
    </>
  );
};

export default Delivery;
