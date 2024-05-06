/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { NumberInput, TextInput, Modal } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { Autocomplete } from "@mantine/core";
import React, { useEffect, useState } from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";

import { useFormik } from "formik";
import * as Yup from "yup";

import { useNavigate } from "react-router-dom";

import BotonModel from "../BotonModel/BotonModel";
import InputSelectedPrendas from "../InputSelectedPrenda/InputSelectedPrenda";
import MetodoPago from "../MetodoPago/MetodoPago";
import Portal from "../Portal/Portal";
import "./ordernServicio.scss";

import { ReactComponent as Eliminar } from "../../../utils/img/OrdenServicio/eliminar.svg";
// import { ReactComponent as Lavadora } from "../../../utils/img/OrdenServicio/lavadora.svg";
import { ReactComponent as Logo } from "../../../utils/img/Logo/logo.svg";

import Tranferencia from "../../../utils/img/OrdenServicio/Transferencia.png";
import Efectivo from "../../../utils/img/OrdenServicio/dinero.png";
import Tarjeta from "../../../utils/img/OrdenServicio/card.png";
import Coins from "../../../utils/img/Puntos/coins.png";

import Tag from "../../Tag/Tag";
import InputText from "../InputText/InputText";

import moment from "moment";
//import 'moment/locale/es';

import { Text, ScrollArea } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import { useDispatch, useSelector } from "react-redux";
import { PrivateRoutes } from "../../../models";
import axios from "axios";
import { DateCurrent, handleGetInfoPago } from "../../../utils/functions";
import SwitchModel from "../../SwitchModel/SwitchModel";
import Promocion from "./Promocion/Promocion";
import { setLastRegister } from "../../../redux/states/service_order";
import { socket } from "../../../utils/socket/connect";
import { Notify } from "../../../utils/notify/Notify";
import {
  documento,
  ingresoDigital,
  nameImpuesto,
  simboloMoneda,
} from "../../../services/global";
import ButtonSwitch from "../MetodoPago/ButtonSwitch/ButtonSwitch";
import { DeletePago, UpdatePago } from "../../../redux/actions/aPago";

const OrdenServicio = ({
  mode,
  action,
  onAction,
  iEdit,
  onReturn,
  nameDefault,
}) => {
  const iCodigo = useSelector((state) => state.codigo.infoCodigo.codActual);
  const infoPromocion = useSelector((state) => state.promocion.infoPromocion);
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);
  const InfoUsuario = useSelector((state) => state.user.infoUsuario);

  const InfoServicios = useSelector((state) => state.servicios.listServicios);
  const InfoCategorias = useSelector(
    (state) => state.categorias.listCategorias
  );

  const { InfoImpuesto, InfoPuntos } = useSelector(
    (state) => state.modificadores
  );

  const [delivery, setDelivery] = useState(false);

  const [isPortalPago, setIsPortalPago] = useState(false);
  const [PortalValidPromocion, setPortalValiPromocion] = useState(false);
  const [isPromocion, setIsPromocion] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  // Lista de Cupones
  const [cupon, setCupon] = useState();
  const [resValidCupon, setResValidCupon] = useState(null);
  const [listCupones, setListCupones] = useState([]);
  // Lista de clientes
  const [infoClientes, setInfoClientes] = useState([]);
  // Puntos del cliente Actual
  const [dataScore, setDataScore] = useState(false);

  const [iPago, setIPago] = useState();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getInfoDelivery = () => {
    const ICategory = InfoCategorias.find((cat) => cat.nivel === "primario");
    const IService = InfoServicios.find(
      (service) =>
        service.idCategoria === ICategory._id && service.nombre === "Delivery"
    );

    return IService;
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campo obligatorio"),
    items: Yup.array()
      .min(1, "Debe haber al menos un item")
      .test(
        "categoria",
        "Debe haber al menos un item - Delivery no cuenta",
        function (value) {
          return value.some(
            (item) => item.identificador !== getInfoDelivery()?._id
          );
        }
      )
      .of(
        Yup.object().shape({
          //cantidad: Yup.string().required("Campo obligatorio"),
          //descripcion: Yup.string().required("Campo obligatorio"),
          //total: Yup.string().required("Campo obligatorio"),
        })
      ),
  });

  const getItemsAdaptados = (Items) => {
    return Items.map((item) => {
      // Transforma cada item a la nueva estructura
      const isDelivery =
        getInfoDelivery()?._id === item.identificador ? true : false;
      return {
        cantidad: item.cantidad,
        identificador: item.identificador,
        simboloMedida: item.simboloMedida,
        tipo: item.tipo,
        item: item.item,
        descripcion: item.descripcion,
        expanded: false, // Valor estático para el ejemplo
        price: item.precio,
        total: item.total, // Similar para 'total'
        disable: {
          cantidad: true,
          item: true,
          descripcion: isDelivery,
          total: true,
          action: true,
        },
      };
    });
  };

  const formik = useFormik({
    initialValues: {
      dni: iEdit ? iEdit.dni : "",
      name: iEdit
        ? iEdit.Nombre
        : mode === "Delivery" && nameDefault
        ? nameDefault
        : "",
      direccion: iEdit ? iEdit.direccion : "",
      phone: iEdit ? iEdit.celular : "",
      dateRecojo: iEdit?.dateRecepcion?.fecha
        ? moment(
            `${iEdit.dateRecepcion.fecha} ${iEdit.dateRecepcion.hora}`,
            "YYYY-MM-DD HH:mm"
          ).toDate()
        : new Date(),
      datePrevista: iEdit?.datePrevista?.fecha
        ? moment(iEdit.datePrevista.fecha, "YYYY-MM-DD").toDate()
        : new Date(),
      dayhour: iEdit?.datePrevista?.hora || "17:00",
      listPago: iEdit ? iEdit.ListPago : [],
      pago: iEdit
        ? handleGetInfoPago(iEdit.ListPago, iEdit.totalNeto).estado
        : "Pendiente",
      items: iEdit
        ? getItemsAdaptados(iEdit.Items)
        : mode === "Delivery"
        ? [
            {
              identificador: getInfoDelivery()?._id,
              tipo: "servicio",
              cantidad: 1,
              item: "Delivery",
              simboloMedida: "vj",
              descripcion: "Recojo y Entrega",
              price: getInfoDelivery()?.precioVenta,
              total: getInfoDelivery()?.precioVenta,
              disable: {
                cantidad: true,
                item: true,
                descripcion: true,
                total: false,
                action: true,
              },
            },
          ]
        : [],
      descuento: iEdit ? iEdit.descuento : 0,
      modoDescuento: iEdit ? iEdit.modoDescuento : "Puntos",
      factura: iEdit ? iEdit.factura : false,
      subTotal: iEdit ? iEdit.subTotal : 0,
      cargosExtras: iEdit
        ? iEdit.cargosExtras
        : {
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
      totalNeto: iEdit ? iEdit.totalNeto : 0,
      gift_promo: iEdit ? iEdit.gift_promo : [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      let correcciones = [];
      if (
        iEdit?.estado !== "registrado" &&
        values.modoDescuento === "Promocion"
      ) {
        correcciones = await validItems(
          values.cargosExtras.beneficios.promociones
        );
      }
      if (correcciones.length > 0) {
        alert(`La Promoción Exige:\n\n${correcciones.join("\n")}`);
      } else {
        if (iEdit?.estado === "registrado") {
          openModal([]);
        } else {
          const thereIsPromo = infoPromocion.length > 0;
          const thereIsPromoActiva = infoPromocion.some(
            (promocion) => promocion.state === "activo"
          );

          if (thereIsPromo && thereIsPromoActiva) {
            open();
          } else {
            openModal([]);
          }
        }
      }
    },
  });

  const openModal = async (cups) => {
    close();
    setIsPromocion(false);
    const values = {
      ...formik.values,
      gift_promo: cups.length > 0 ? cups : [],
    };

    modals.openConfirmModal({
      title: "Registro de Orden de Servicio",
      centered: true,
      children: (
        <Text size="sm">
          ¿Estás seguro de registrar esta Orden de Servicio?
        </Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      onCancel: () => formik.setFieldValue("gift_promo", []),
      onConfirm: () => handleGetInfo(values),
    });
  };

  const addRowGarment = (idServicio) => {
    const IService = InfoServicios.find(
      (service) => service._id === idServicio
    );
    const ICategory = InfoCategorias.find(
      (cat) => cat._id === IService.idCategoria
    );

    const isDelivery =
      ICategory.nivel === "primario" && IService.nombre === "Delivery"
        ? true
        : false;
    const isOtros =
      ICategory.nivel === "primario"
        ? IService.nombre === "Otros"
          ? true
          : false
        : false;
    const isEditSaved = iEdit?.estado === "registrado" ? true : false;

    const newRow = {
      cantidad: 1,
      item:
        IService.nombre === "Otros" && ICategory.name === "Unico"
          ? ""
          : IService.nombre,
      descripcion: "",
      expanded: false,
      price: IService.precioVenta,
      total: IService.precioVenta,
      tipo: "servicio",
      identificador: IService._id,
      simboloMedida: IService.simboloMedida,
      disable: {
        cantidad: isEditSaved ? true : isDelivery ? true : false,
        item: isEditSaved ? true : isDelivery ? true : isOtros ? false : true,
        descripcion: isDelivery,
        total: isEditSaved,
        action: isDelivery,
      },
    };

    return newRow;
  };

  function tFecha(fecha) {
    const fechaFormateada = moment(fecha).format("YYYY-MM-DD");
    return fechaFormateada;
  }

  function tHora(fecha) {
    const horaFormateada = moment(fecha).format("HH:mm");
    return horaFormateada;
  }

  const handlePago = (value) => {
    setIPago(value);
    let newListPago = [];
    let newStatePago;
    if (value) {
      const iPago = {
        date: {
          fecha: moment().format("YYYY-MM-DD"),
          hora: moment().format("HH:mm"),
        },
        ...value,
        isCounted: true,
        idUser: InfoUsuario._id,
      };

      if (iEdit && iEdit.modeEditAll === false && iPago._id) {
        console.log("gaa");
        dispatch(UpdatePago({ idPago: iPago._id, pagoUpdated: iPago }));

        navigate(
          `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
        );
      } else {
        if (
          action === "Guardar" ||
          (action === "Editar" && iEdit?.modeEditAll === true)
        ) {
          newListPago = [iPago];
        } else {
          newListPago = [...formik.values.listPago, iPago];
        }
      }
    } else {
      newListPago = [value];
      iEdit
        ? formik.values.listPago.filter((pago) => pago._id === value._id)
        : null;
    }

    formik.setFieldValue("listPago", newListPago);
    newStatePago = handleGetInfoPago(newListPago, formik.values.totalNeto);
    formik.setFieldValue("pago", newStatePago.estado);
  };

  const handleNoPagar = (id) => {
    if (iEdit && iEdit.modeEditAll === false && id) {
      modals.openConfirmModal({
        title: "Elimiancion de Pago",
        centered: true,
        children: <Text size="sm">¿Estás seguro de Eliminar este Pago?</Text>,
        labels: { confirm: "Si", cancel: "No" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("eliminacion de pago cancelado"),
        onConfirm: () => {
          dispatch(DeletePago(id));

          navigate(
            `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
          );
        },
      });
    } else {
      if (
        action === "Guardar" ||
        (action === "Editar" && iEdit?.modeEditAll === true)
      ) {
        formik.setFieldValue("listPago", []);
        formik.setFieldValue("pago", "Pendiente");
      }
    }
    setIPago();
  };

  const handleGetInfo = async (info) => {
    const infoIntem = info.items.map((p) => ({
      identificador: p.identificador,
      tipo: p.tipo,
      cantidad: p.cantidad,
      item: p.item,
      simboloMedida: p.simboloMedida,
      descripcion: p.descripcion,
      precio: p.price,
      total: p.total,
    }));

    let finalUpdatePromo = info.cargosExtras;
    if (info.modoDescuento === "Promocion" && !iEdit) {
      finalUpdatePromo.beneficios.promociones = listCupones;
    } else if (info.modoDescuento === "Puntos" && !iEdit) {
      finalUpdatePromo.beneficios.promociones = [];
      finalUpdatePromo.descuentos.promocion = 0;
    }
    !iEdit ||
      iEdit.dateRecepcion.fecha === DateCurrent().format4 ||
      iEdit?.estado === "reservado";

    const infoOrden = {
      codRecibo: iEdit ? iEdit.codRecibo : iCodigo,
      dateRecepcion: {
        fecha: tFecha(info.dateRecojo),
        hora: tHora(info.dateRecojo),
      },
      Modalidad: delivery ? "Delivery" : "Tienda",
      Nombre: info.name,
      Items: infoIntem,
      celular: info.phone,
      direccion: info.direccion,
      datePrevista: {
        fecha: tFecha(info.datePrevista),
        hora: info.dayhour,
      },
      dateEntrega: {
        fecha: "",
        hora: "",
      },
      descuento: info.descuento,
      estadoPrenda: iEdit ? iEdit.estadoPrenda : "pendiente",
      estado: "registrado",
      dni: info.dni,
      factura: info.factura,
      subTotal: info.subTotal,
      cargosExtras: finalUpdatePromo,
      totalNeto: info.totalNeto,
      modeRegistro: "nuevo",
      notas: iEdit ? iEdit.notas : [],
      modoDescuento: info.modoDescuento,
      gift_promo: iEdit
        ? iEdit.estado === "reservado"
          ? info.gift_promo
          : iEdit.gift_promo
        : info.gift_promo,
      attendedBy: iEdit
        ? iEdit.attendedBy
        : {
            name: InfoUsuario.name,
            rol: InfoUsuario.rol,
          },
      lastEdit: iEdit
        ? [
            ...iEdit.lastEdit,
            {
              name: InfoUsuario.name,
              date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            },
          ]
        : [],
      typeRegistro: "normal",
    };

    onAction({
      infoOrden,
      infoPago: info.listPago,
      rol: InfoUsuario.rol,
    });

    formik.handleReset();
    handleNoPagar();
  };

  const handleTextareaHeight = (textarea) => {
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
    textarea.style.padding = `10px`;
  };

  const handleGetClientes = async (dni) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-clientes/${dni}`
      );
      const data = response.data;
      setInfoClientes(data);
      return data;
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);
    }
  };

  const handleScrollTop = (id) => {
    const element = document.getElementById(id);
    if (element instanceof HTMLTextAreaElement) {
      element.scrollTop = 0;
    }
  };

  const validCupon = async (codigoCupon) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lava-ya/validar-cupon/${codigoCupon}`
      );
      const data = response.data;
      await setResValidCupon(data);
      return data;
    } catch (error) {
      // Captura errores y devuelve un mensaje de error genérico
      return {
        mensaje: "Error al hacer la solicitud: " + error.message,
      };
    }
  };

  const validItems = async (promociones) => {
    const listItems = formik.values.items;
    const ListCorrecciones = [];

    // si la promo es la misma reducirla a 1 sola
    const listP = promociones.reduce((result, item) => {
      const codigoPromocion = item.codigoPromocion;
      if (!result.some((r) => r.codigoPromocion === codigoPromocion)) {
        result.push(item);
      }

      return result;
    }, []);

    for (const p of listP) {
      const infoCupon = await validCupon(p.codigoCupon);

      const idServicios = infoCupon.promocion.prenda;

      let servicios = [];

      // Crear un arreglo con la información de los servicios asociados a cada identificador
      idServicios.forEach((serviceID) => {
        const infoService = InfoServicios.find((i) => i._id === serviceID);
        if (infoService) {
          // Verificar si se encontró la información del servicio
          servicios.push({
            identificador: infoService._id,
            servicio: infoService.nombre,
            simbolo: infoService.simboloMedida,
          });
        }
      });

      const identificadoresReferencia = servicios.map(
        (item) => item.identificador
      );

      // Filtrar los elementos de la lista base que coinciden con los identificadores de la lista de referencia
      const itemsValidos = listItems.filter((item) =>
        identificadoresReferencia.includes(item.identificador)
      );

      const cantMin = infoCupon.promocion.cantidadMin;

      const handleGetCaActual = (atributo) =>
        itemsValidos.reduce((total, item) => total + +item[atributo], 0);

      let infoFaltante = "";
      let cantActual = 0;
      if (infoCupon.promocion.tipoPromocion === "Varios") {
        // // console.log("Varios :");
        // Varios
        if (infoCupon.promocion.tipoDescuento === "Porcentaje") {
          // // console.log("Porcentaje :");
          // Pocentaje
          cantActual = handleGetCaActual("cantidad");
          // // console.log(cantActual);
        } else {
          // // console.log("Monto :");
          // Monto
          cantActual = handleGetCaActual("total");
          // // console.log(cantActual);
        }
      } else {
        // // console.log("Unico :");
        // Unico
        cantActual = handleGetCaActual("cantidad");
        // // if (infoCupon.promocion.tipoDescuento === "Porcentaje") {
        // //   console.log("Porcentaje :");
        // //   // Pocentaje
        // // } else {
        // //   console.log("Gratis :");
        // //   // Gratis
        // // }
        // // console.log(cantActual);
      }

      const res = cantActual >= cantMin;

      if (infoCupon.promocion.tipoPromocion === "Unico") {
        if (!res) {
          infoFaltante = `${`Minimo ${cantMin}${
            servicios[0].simbolo
          } del servicio "${servicios[0].servicio}" y ${
            cantActual === 0
              ? "no registraste ninguno"
              : `solo registraste : ${cantActual}${servicios[0].simbolo}`
          }`}`;
        }
      } else {
        if (!res) {
          if (infoCupon.promocion.tipoDescuento === "Monto") {
            infoFaltante = `${`Minimo ${simboloMoneda}${cantMin} en gastos de servicio y ${
              cantActual === 0
                ? "no registraste ninguno"
                : `solo registro : ${simboloMoneda}${cantActual}`
            }`}`;
          }
        }
      }

      if (infoFaltante) {
        ListCorrecciones.push(infoFaltante);
      }
    }

    return ListCorrecciones;
  };

  const sumaTotalesItems = (listItems) => {
    return listItems.reduce((total, item) => {
      const ItemTotal = parseFloat(item.total);
      return isNaN(ItemTotal) ? total : total + ItemTotal;
    }, 0);
  };

  const recalculatePromoDescuento = () => {
    let updateCupon = listCupones;

    const cupTypeDsc = listCupones.filter(
      (cupon) => cupon.tipoDescuento === "Porcentaje"
    );

    // Agrupacion de cupones segun codigo
    const groupCupon = [
      ...new Set(cupTypeDsc.map((item) => item.codigoPromocion)),
    ].map((codigoPromocion) =>
      cupTypeDsc.filter((item) => item.codigoPromocion === codigoPromocion)
    );

    // Iterar a través de grupos de cupones
    if (groupCupon.length > 0) {
      for (const grupo of groupCupon) {
        for (const dsc of grupo) {
          let itemsConsideradas;
          if (dsc.tipoPromocion === "Varios") {
            if (dsc.alcance === "Todos") {
              itemsConsideradas = formik.values.items;
            } else {
              itemsConsideradas = formik.values.items.filter((elemento) =>
                dsc.prenda.includes(elemento.identificador)
              );
            }

            let sumaTotales = sumaTotalesItems(itemsConsideradas);

            const dscFinal = +parseFloat(
              sumaTotales * (dsc.nMultiplicador / 100)
            ).toFixed(1);
            updateCupon = updateCupon.map((c) => {
              if (c.codigoCupon === dsc.codigoCupon) {
                return { ...c, descuento: dscFinal };
              }
              return c;
            });
            sumaTotales -= dscFinal;
          } else {
            const prenda = grupo[0].prenda[0];
            itemsConsideradas = formik.values.items.filter(
              (i) => i.identificador === prenda
            );
            if (itemsConsideradas.length > 0) {
              let sumaTotales = sumaTotalesItems(itemsConsideradas);

              // Calcular descuentos y actualizar sumaTotales

              const dscFinal = +parseFloat(
                sumaTotales * (dsc.nMultiplicador / 100)
              ).toFixed(1);
              // Actualizar el descuento en cada registro según su código de cupón
              updateCupon = updateCupon.map((c) => {
                if (c.codigoCupon === dsc.codigoCupon) {
                  return { ...c, descuento: dscFinal };
                }
                return c;
              });
              sumaTotales -= dscFinal;
            } else {
              updateCupon = updateCupon.map((c) => {
                if (c.codigoCupon === dsc.codigoCupon) {
                  return { ...c, descuento: 0 };
                }
                return c;
              });
            }
          }

          formik.setFieldValue(
            "cargosExtras.beneficios.promociones",
            updateCupon
          );
          setListCupones(updateCupon);
        }
      }
    }

    const LCupones = updateCupon.length > 0 ? updateCupon : listCupones;

    const sumaTotales = LCupones.reduce((total, cupon) => {
      const descuentoTotal = parseFloat(cupon.descuento);
      return isNaN(descuentoTotal) ? total : total + descuentoTotal;
    }, 0);

    formik.setFieldValue("cargosExtras.descuentos.promocion", sumaTotales);
    formik.setFieldValue("descuento", sumaTotales);
  };

  const handleGetDay = (date) => {
    const formattedDayOfWeek = moment(date).format("dddd");
    return `${formattedDayOfWeek} : `;
  };

  const MontoxPoints = (xpoints) => {
    const puntos = parseFloat(InfoPuntos.score);
    const valor = parseFloat(InfoPuntos.valor);
    const equivalenteEnSoles = (xpoints / puntos) * valor;

    return equivalenteEnSoles;
  };

  const calculateTotalNeto = (items) => {
    let subtotal = 0;

    if (items && items.length > 0) {
      subtotal = items.reduce((sum, item) => {
        const total = parseFloat(item.total) || 0;

        return sum + total;
      }, 0);
    }

    return subtotal;
  };

  const icoValid = (message) => {
    return (
      <div className="ico-req">
        <i className="fa-solid fa-circle-exclamation ">
          <div className="info-req" style={{ pointerEvents: "none" }}>
            <span>{message}</span>
          </div>
        </i>
      </div>
    );
  };

  useEffect(() => {
    dispatch(setLastRegister());
  }, []);

  useEffect(() => {
    if (mode === "Delivery") {
      setDelivery(true);
    }
  }, [mode]);

  useEffect(() => {
    formik.setFieldValue(
      "cargosExtras.descuentos.puntos",
      Number(
        MontoxPoints(formik.values.cargosExtras.beneficios.puntos).toFixed(2)
      )
    );

    formik.setFieldValue(
      "cargosExtras.igv.valor",
      iEdit && iEdit.factura ? iEdit.cargosExtras.igv.valor : InfoImpuesto.IGV
    );
  }, [InfoPuntos, InfoImpuesto]);

  useEffect(() => {
    const subtotal = Number(calculateTotalNeto(formik.values.items).toFixed(2));
    formik.setFieldValue("subTotal", subtotal);
  }, [formik.values.items]);

  useEffect(() => {
    if (!iEdit || iEdit?.estado === "reservado") {
      recalculatePromoDescuento();
    }
  }, [formik.values.items, listCupones.length, formik.values.modoDescuento]);

  useEffect(() => {
    const subTotal = formik.values.subTotal;
    let montoIGV = 0;
    if (formik.values.factura === true) {
      montoIGV = +(subTotal * formik.values.cargosExtras.igv.valor).toFixed(2);
    }
    formik.setFieldValue("cargosExtras.igv.importe", montoIGV);
    const total = subTotal + montoIGV;
    const descuento =
      formik.values.modoDescuento === "Puntos"
        ? formik.values.cargosExtras.descuentos.puntos
        : formik.values.cargosExtras.descuentos.promocion;
    formik.setFieldValue("descuento", descuento);
    const totalNeto = total - descuento;
    formik.setFieldValue(
      "totalNeto",
      (Math.floor(totalNeto * 10) / 10).toFixed(1)
    );
  }, [
    formik.values.cargosExtras.igv,
    formik.values.items,
    formik.values.modoDescuento,
    formik.values.cargosExtras.descuentos,
    formik.values.cargosExtras.descuento,
    formik.values.factura,
    formik.values.subTotal,
  ]);

  useEffect(() => {
    socket.on("server:orderUpdated:child", (data) => {
      if (iEdit && data._id === iEdit._id) {
        if (data.estadoPrenda === "anulado") {
          Notify("ORDERN DE SERVICIO ANULADO", "", "fail");
        } else {
          Notify("ORDERN DE SERVICIO ACTUALIZADO", "", "warning");
        }
        navigate(
          `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
        );
      }
    });

    socket.on("server:updateListOrder:child", (data) => {
      data.some((orden) => {
        if (iEdit && orden._id === iEdit._id) {
          if (orden.estadoPrenda === "donado") {
            Notify("ORDERN DE SERVICIO DONADO", "", "fail");
          } else {
            Notify("ORDERN DE SERVICIO ACTUALIZADO", "", "warning");
          }
          navigate(
            `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`
          );
          return true; // Detener la iteración
        }
        return false; // Continuar la iteración
      });
    });

    socket.on("server:cancel-delivery", (data) => {
      const { dni } = data;
      if (dni !== "") {
        const infoPuntos = handleGetClientes(dni);
        formik.setFieldValue("cargosExtras.descuentos.puntos", 0);
        formik.setFieldValue("cargosExtras.beneficios.puntos", 0);
        setDataScore(infoPuntos);
      }
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:cancel-delivery");
      socket.off("server:orderUpdated:child");
      socket.off("server:updateListOrder:child");
    };
  }, []);

  useEffect(() => {
    handleNoPagar();
  }, [formik.values.totalNeto]);

  return (
    <div className="content-recibo">
      <form onSubmit={formik.handleSubmit} className="container">
        <div className="body-form">
          <div className="c-title">
            <div className="info-t">
              <Logo className="ico-logo" />
              <div className="title">
                {/* {Object.keys(InfoNegocio).length > 0 ? (
                  <h3>
                    {DiasAttencion(InfoNegocio?.horario)} de &nbsp;
                    {HoraAttencion(InfoNegocio?.horario.horas)}
                  </h3>
                ) : null} */}
              </div>
            </div>
            <div className="n-recibo">
              <h2>RECIBO</h2>
              <h1>
                N° {String(iEdit ? iEdit.codRecibo : iCodigo).padStart(6, "0")}
              </h1>
            </div>
          </div>
          <div className="header-info">
            <div className="h-cli">
              <Autocomplete
                name="dni"
                onChange={(dni) => {
                  handleGetClientes(dni);
                  formik.setFieldValue("dni", dni);
                  setDataScore();
                  formik.setFieldValue("cargosExtras.descuentos.puntos", 0);
                  formik.setFieldValue("cargosExtras.beneficios.puntos", 0);
                }}
                tabIndex={"1"}
                autoFocus
                label={`${documento} :`}
                placeholder={`Ingrese ${documento}`}
                defaultValue={formik.values.dni}
                onItemSubmit={(selected) => {
                  const cliente = infoClientes.find(
                    (obj) => obj.dni === selected.value
                  );
                  formik.setFieldValue("name", cliente.nombre);
                  formik.setFieldValue("phone", cliente.phone);

                  setDataScore(cliente);
                }}
                data={
                  infoClientes.length > 0
                    ? infoClientes.map((obj) => obj.dni)
                    : []
                }
                disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
              />

              <InputText
                name={"name"}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                valueName={formik.values.name}
                tabI={"2"}
                text={"Señor(es):"}
                disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
                valid={{
                  errors: formik.errors.name && formik.touched.name,
                  req: formik.errors.name,
                }}
              />
              <InputText
                name="direccion"
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                tabI={"3"}
                valueName={formik.values.direccion}
                text={"Direccion:"}
              />
              <InputText
                name={"phone"}
                handleChange={formik.handleChange}
                handleBlur={formik.handleBlur}
                tabI={"4"}
                valueName={formik.values.phone}
                text={"Celular:"}
              />
              <SwitchModel
                title="Tipo de Descuento :"
                onSwitch="Puntos" // TRUE
                offSwitch="Promocion" // FALSE
                name="swModalidad"
                defaultValue={
                  formik.values.modoDescuento === "Puntos" ? true : false
                }
                disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
                onChange={(value) => {
                  formik.setFieldValue("descuento", 0);
                  if (value === true) {
                    formik.setFieldValue("modoDescuento", "Puntos");
                    formik.setFieldValue("cargosExtras.descuentos.puntos", 0);
                    formik.setFieldValue("cargosExtras.beneficios.puntos", 0);
                  } else {
                    formik.setFieldValue("modoDescuento", "Promocion");
                    formik.setFieldValue(
                      "cargosExtras.descuentos.promocion",
                      0
                    );
                    formik.setFieldValue(
                      "cargosExtras.beneficios.promociones",
                      []
                    );
                  }
                }}
              />
            </div>
            <div className="second-column">
              <div className="h-date">
                <div className="content-date">
                  <label htmlFor="">Ingreso:</label>
                  <DateInput
                    name="dateRecojo"
                    value={formik.values.dateRecojo}
                    onChange={(date) => {
                      formik.setFieldValue("dateRecojo", date);
                    }}
                    tabIndex={"5"}
                    disabled={
                      iEdit ? (iEdit.modeEditAll ? false : true) : false
                    }
                    placeholder="Ingrese Fecha"
                    style={{ pointerEvents: "none" }}
                    mx="auto"
                  />
                </div>
                <div className="content-date">
                  <label htmlFor="">Entrega:</label>
                  <div className="date-ma">
                    <DateInput
                      name="datePrevista"
                      value={formik.values.datePrevista}
                      onChange={(date) => {
                        formik.setFieldValue("datePrevista", date);
                      }}
                      disabled={
                        iEdit ? (iEdit.modeEditAll ? false : true) : false
                      }
                      placeholder="Ingrese Fecha"
                      minDate={new Date()}
                    />
                    <div className="actions-date">
                      <button
                        type="button"
                        className="btn-preview"
                        disabled={
                          iEdit ? (iEdit.modeEditAll ? false : true) : false
                        }
                        onClick={() => {
                          const currentDate = new Date();
                          const newDate = new Date(
                            Math.max(
                              formik.values.datePrevista.getTime() -
                                24 * 60 * 60 * 1000,
                              currentDate.getTime()
                            )
                          );
                          formik.setFieldValue("datePrevista", newDate);
                        }}
                      >
                        {"<"}
                      </button>
                      <button
                        type="button"
                        className="btn-next"
                        tabIndex="6"
                        disabled={
                          iEdit ? (iEdit.modeEditAll ? false : true) : false
                        }
                        onClick={() =>
                          formik.setFieldValue(
                            "datePrevista",
                            new Date(
                              formik.values.datePrevista.getTime() +
                                24 * 60 * 60 * 1000
                            )
                          )
                        }
                      >
                        {">"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="content-hour">
                  <label htmlFor=""></label>
                  <div className="date-dh">
                    <TimePicker
                      className="hour-date"
                      onChange={(newTime) => {
                        const timeMoment = moment(newTime, "HH:mm");
                        const timeString = timeMoment.format("HH:mm");
                        formik.setFieldValue("dayhour", timeString);
                      }}
                      value={
                        moment(formik.values.dayhour, "HH:mm").isValid()
                          ? moment(formik.values.dayhour, "HH:mm").toDate()
                          : null
                      }
                      amPmAriaLabel="Select AM/PM" // Aquí debe ir una cadena descriptiva
                      clockIcon={null} // Esto oculta el icono del reloj, si lo deseas
                      clearIcon={null} // Esto oculta el icono de limpieza, si lo deseas
                      disableClock={true}
                      format="h:mm a"
                    />
                    <label className="day-date">
                      {handleGetDay(formik.values.datePrevista)}
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="switches-container"
                style={{
                  pointerEvents:
                    !iEdit ||
                    iEdit.dateRecepcion.fecha === DateCurrent().format4 ||
                    iEdit?.estado === "reservado"
                      ? "painted"
                      : "none",
                }}
              >
                <label className="title-switch" htmlFor="">
                  Factura :
                </label>
                <div className="switches-body">
                  <input
                    type="radio"
                    id="sFactura"
                    name="factura"
                    value="SI"
                    checked={formik.values.factura === true}
                    onChange={() => {
                      formik.setFieldValue("factura", true);
                    }}
                  />
                  <label htmlFor="sFactura">SI</label>{" "}
                  <input
                    type="radio"
                    id="hFactura"
                    name="factura"
                    value="NO"
                    checked={formik.values.factura === false}
                    onChange={() => {
                      formik.setFieldValue("factura", false);
                    }}
                  />
                  <label htmlFor="hFactura">NO</label>{" "}
                  <div className="switch-wrapper">
                    <div className="switch">
                      <div>SI</div>
                      <div>NO</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="description-info">
            <div className="actions">
              <div className="button-actions">
                {InfoNegocio.itemsAtajos.length > 0
                  ? InfoNegocio.itemsAtajos.map((items, index) => {
                      const IService = InfoServicios.find(
                        (service) => service._id === items
                      );

                      return (
                        <BotonModel
                          key={index}
                          name={`Agregar ${IService?.nombre}`}
                          // tabI="7"
                          disabled={
                            iEdit ? (iEdit.modeEditAll ? false : true) : false
                          }
                          listenClick={() => {
                            formik.setFieldValue("items", [
                              ...formik.values.items,
                              addRowGarment(IService?._id),
                            ]);
                          }}
                        />
                      );
                    })
                  : null}
              </div>
              <InputSelectedPrendas
                listenClick={(info) => {
                  formik.setFieldValue("items", [
                    ...formik.values.items,
                    addRowGarment(info),
                  ]);
                }}
                disabled={iEdit ? (iEdit.modeEditAll ? false : true) : false}
                tabI={"7"}
              />
            </div>
            <table className="tb-prod">
              <thead>
                <tr>
                  <th>Cantidad</th>
                  <th>Item</th>
                  <th>Descripción</th>
                  <th>Total</th>
                  <th>{""}</th>
                </tr>
              </thead>
              <tbody>
                {formik.values.items.map((row, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        pointerEvents:
                          !iEdit || (iEdit.modeEditAll ? "painted" : "none"),
                      }}
                    >
                      <input
                        type="text"
                        className="txtCantidad"
                        name={`items.${index}.cantidad`}
                        autoComplete="off"
                        disabled={row.disable.cantidad}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Permitir solo dígitos y un único punto decimal
                          const validInput = inputValue.replace(/[^0-9.]/g, "");
                          // Garantizar que no haya más de un punto decimal
                          const validQuantity = validInput.replace(
                            /\.(?=.*\.)/g,
                            ""
                          );

                          const newQuantity =
                            validQuantity !== "" ? validQuantity : "";

                          const price =
                            parseFloat(formik.values.items[index].price) || 0;
                          const newTotal =
                            newQuantity !== "" ? newQuantity * price : "";

                          formik.setFieldValue(
                            `items.${index}.cantidad`,
                            newQuantity
                          );
                          formik.setFieldValue(
                            `items.${index}.total`,
                            newTotal !== "" && newTotal !== 0
                              ? newTotal.toFixed(1)
                              : ""
                          );
                        }}
                        autoFocus={true}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === "0") {
                            // Si el usuario ingresa "0", establece el valor del campo a una cadena vacía
                            formik.setFieldValue(`items.${index}.cantidad`, "");
                            formik.setFieldValue(`items.${index}.total`, "");
                          }
                        }}
                        value={formik.values.items[index].cantidad || ""}
                        required
                      />
                      {formik.values.items[index].cantidad < 0.1 &&
                        icoValid("La cantidad debe ser mayor a 0.1")}
                    </td>
                    <td>
                      <input
                        type="text"
                        className="txtProducto"
                        disabled={row.disable.item}
                        name={`items.${index}.item`}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (newValue.length <= 15) {
                            formik.handleChange(e);
                          }
                        }}
                        autoComplete="off"
                        onBlur={formik.handleBlur}
                        value={formik.values.items[index].item}
                        required
                      />
                    </td>
                    <td className="tADescription">
                      <div className="contentDes">
                        <div className="textarea-container">
                          <textarea
                            rows={1}
                            id={`items.${index}.descripcion`}
                            name={`items.${index}.descripcion`}
                            onChange={(e) => {
                              const inputValue = e.target.value;

                              // Verifica si el valor actual contiene el check "✔"
                              const hasCheck = inputValue.includes("✔ ");

                              // Si no hay un check y hay un texto, agrega el check automáticamente
                              const updatedValue = hasCheck
                                ? inputValue
                                : inputValue
                                ? "✔ " + inputValue
                                : "";

                              formik.setFieldValue(
                                `items.${index}.descripcion`,
                                updatedValue
                              );
                              formik.setFieldValue(
                                `items.${index}.expanded`,
                                true
                              );

                              handleTextareaHeight(e.target);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();

                                // Añade el check de "✔" al texto existente
                                const updatedValue = `${formik.values.items[index].descripcion}\n✔ `;
                                formik.setFieldValue(
                                  `items.${index}.descripcion`,
                                  updatedValue
                                );

                                formik.setFieldValue(
                                  `items.${index}.expanded`,
                                  true
                                );
                                const scrollHeight = event.target.scrollHeight;
                                event.target.style.height = `${
                                  scrollHeight + 30
                                }px`;
                              }
                            }}
                            disabled={row.disable.descripcion}
                            value={formik.values.items[index].descripcion}
                            className={`${
                              formik.values.items[index].expanded
                                ? "expanded"
                                : ""
                            }`}
                          />
                          <Tag
                            ELement="div"
                            className={"expand-button"}
                            onClick={() => {
                              formik.setFieldValue(
                                `items.${index}.expanded`,
                                !formik.values.items[index].expanded
                              );

                              handleScrollTop(`items.${index}.descripcion`);
                            }}
                          >
                            {formik.values.items[index].expanded ? (
                              <i className="fa-solid fa-chevron-up" />
                            ) : (
                              <i className="fa-solid fa-chevron-down" />
                            )}
                          </Tag>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="txtTotal"
                        name={`items.${index}.total`}
                        autoComplete="off"
                        onDragStart={(e) => e.preventDefault()}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const validInput = inputValue
                            ? inputValue.replace(/[^0-9.]/g, "")
                            : "";

                          formik.setFieldValue(
                            `items.${index}.total`,
                            validInput
                          );
                        }}
                        disabled={row.disable.total}
                        value={formik.values.items[index].total}
                        required
                      />
                    </td>
                    <Tag
                      Etiqueta="td"
                      className="space-action"
                      onClick={() => {
                        if (
                          (!iEdit || iEdit?.estado === "reservado") &&
                          formik.values.items[index].identificador !==
                            getInfoDelivery()?._id
                        ) {
                          const updatedItems = [...formik.values.items];
                          updatedItems.splice(index, 1);
                          formik.setFieldValue("items", updatedItems);
                        }
                      }}
                    >
                      {row.disable.action ? null : (
                        <Eliminar className="delete-row" />
                      )}
                    </Tag>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ marginTop: "10px" }}>
                  <td>
                    {dataScore && Object.keys(dataScore).length > 0
                      ? `Total de Puntos : ${dataScore.scoreTotal}`
                      : null}
                  </td>
                  <td>Subtotal :</td>
                  <td>
                    {simboloMoneda} {formik.values.subTotal}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    {dataScore &&
                    Object.keys(dataScore).length > 0 &&
                    formik.values.modoDescuento === "Puntos" ? (
                      <div className="input-number dsc">
                        <label>Dsc x Puntos</label>
                        <NumberInput
                          value={formik.values.cargosExtras.beneficios.puntos}
                          max={parseInt(dataScore.scoreTotal)}
                          min={0}
                          step={1}
                          hideControls={true}
                          onChange={(e) => {
                            const data =
                              dataScore.scoreTotal < e ? false : true;
                            formik.setFieldValue(
                              "cargosExtras.descuentos.puntos",
                              data ? Number(MontoxPoints(e).toFixed(2)) : 0
                            );
                            formik.setFieldValue(
                              "cargosExtras.beneficios.puntos",
                              e
                            );
                          }}
                        />
                      </div>
                    ) : null}
                  </td>
                  {formik.values.factura ? (
                    <>
                      <td>
                        {nameImpuesto} (
                        {formik.values.cargosExtras.igv.valor * 100} %) :
                      </td>
                      <td>
                        {simboloMoneda} {formik.values.cargosExtras.igv.importe}
                      </td>
                    </>
                  ) : (
                    <>
                      <td></td>
                      <td></td>
                    </>
                  )}

                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Descuento :</td>
                  <td>
                    {simboloMoneda} {formik.values.descuento}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>Total :</td>
                  <td>
                    {simboloMoneda} {formik.values.totalNeto}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            {formik.errors.items && formik.touched.items && (
              <div className="error-message">{formik.errors.items}</div>
            )}
          </div>
          <div className="footer">
            {!iEdit || iEdit.modeEditAll ? (
              <div className="f-Pay">
                <div className="content-sb">
                  <div className="input-pay ">
                    <label htmlFor="">Pago :</label>
                    <button
                      className="btn-switch"
                      type="button"
                      onClick={() => setIsPortalPago(!isPortalPago)}
                    >
                      <ButtonSwitch pago={formik.values.pago} />
                    </button>
                  </div>
                  {iPago ? (
                    <img
                      tabIndex="-1"
                      className={
                        iPago.metodoPago === "Efectivo"
                          ? "ico-efect"
                          : iPago.metodoPago === ingresoDigital
                          ? "ico-tranf"
                          : "ico-card"
                      }
                      src={
                        iPago.metodoPago === "Efectivo"
                          ? Efectivo
                          : iPago?.metodoPago === ingresoDigital
                          ? Tranferencia
                          : Tarjeta
                      }
                      alt=""
                    />
                  ) : null}
                </div>
                {iPago ? (
                  <div className="info-pago">{`${iPago.metodoPago} ${simboloMoneda}${iPago.total} : ${formik.values.pago}`}</div>
                ) : null}
              </div>
            ) : null}
          </div>
          {iEdit && iEdit?.modeEditAll === false ? (
            formik.values.listPago.length > 0 ? (
              <div className="list-pagos">
                <table>
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Metodo</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formik.values.listPago.map((pago, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{pago.metodoPago}</td>
                        <td>{pago.date.fecha}</td>
                        <td>{pago.total}</td>
                        <td className="space-action">
                          {DateCurrent().format4 === pago.date.fecha &&
                          pago.idUser === InfoUsuario._id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setIPago(pago);
                                  setIsPortalPago(!isPortalPago);
                                }}
                                className="btn-action btn-edit"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleNoPagar(pago._id);
                                }}
                                className="btn-action btn-delete"
                              >
                                <i className="fa-solid fa-delete-left"></i>
                              </button>
                            </>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="input-pay">
                <label htmlFor="">Pago :</label>
                <span>Pendiente</span>
              </div>
            )
          ) : null}
          {isPortalPago === true && (
            <Portal
              onClose={() => {
                setIsPortalPago(false);
              }}
            >
              <MetodoPago
                handlePago={handlePago}
                infoPago={iPago}
                totalToPay={
                  iEdit && iEdit.modeEditAll === false
                    ? parseFloat(formik.values.totalNeto) -
                      (formik.values.listPago?.reduce(
                        (total, pago) => total + parseFloat(pago.total),
                        0
                      ) -
                        parseFloat(iPago.total))
                    : formik.values.totalNeto
                }
                handleNoPagar={handleNoPagar}
                onClose={setIsPortalPago}
                modeUse={
                  iEdit ? (iEdit.modeEditAll ? "Reserved" : "Edit") : "New"
                }
              />
            </Portal>
          )}
        </div>
        <div className="target-descuento">
          {!iEdit || iEdit?.estado === "reservado" ? (
            <>
              {dataScore &&
              Object.keys(dataScore).length > 0 &&
              formik.values.modoDescuento === "Puntos" ? (
                <div className="card-score">
                  <div className="info">
                    <div className="insignia">
                      <img src={Coins} alt="" />
                    </div>
                    <div className="data">
                      <table className="info-table">
                        <tbody>
                          <tr>
                            <td>NOMBRE :</td>
                            <td>{dataScore.nombre}</td>
                          </tr>
                          <tr>
                            <td>DOCUMENTO :</td>
                            <td>{dataScore.dni}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="visitas">
                    <table>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Orden de Servicio</th>
                          <th>Fecha</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataScore.infoScore.map((row, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{row.codigo}</td>
                            <td>
                              <span>{row.dateService.fecha}</span>
                              <>&nbsp;&nbsp;-&nbsp;&nbsp;</>
                              <span>{row.dateService.hora}</span>
                            </td>
                            <td
                              style={{
                                background: `${
                                  row.score > 0 ? "#60eba8" : "#ff8383"
                                }`,
                              }}
                            >
                              {row.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="footer-info">
                      <div className="text-info">
                        <span>Total de Puntos :</span>
                        <label htmlFor="">{dataScore.scoreTotal}</label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : formik.values.modoDescuento === "Promocion" ? (
                <div className="card-promocion">
                  <button
                    className="btn-add-promo"
                    onClick={() => {
                      setPortalValiPromocion(true);
                      setResValidCupon(null);
                      setCupon();
                    }}
                    type="button"
                  >
                    Agregar Promocion
                  </button>
                  {listCupones.length > 0 ? (
                    <div className="list-promociones">
                      <table className="tb-promo">
                        <thead>
                          <tr>
                            <th>Codigo</th>
                            <th>Promociones</th>
                            <th>Descuento</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {listCupones.map((cupon, index) => (
                            <tr key={index}>
                              <td>{cupon.codigoCupon}</td>
                              <td>{cupon.descripcion}</td>
                              <td>{cupon.descuento}</td>
                              <Tag
                                Etiqueta="td"
                                className="space-action"
                                onClick={() => {
                                  const updatedCupones = [...listCupones];
                                  updatedCupones.splice(index, 1);
                                  setListCupones(updatedCupones);
                                  const sumarDescuentos = updatedCupones.reduce(
                                    (total, cupon) => total + cupon.descuento,
                                    0
                                  );
                                  formik.setFieldValue(
                                    "cargosExtras.descuentos.promocion",
                                    sumarDescuentos
                                  );
                                  formik.setFieldValue(
                                    "cargosExtras.beneficios.promociones",
                                    updatedCupones
                                  );
                                }}
                              >
                                <Eliminar className="delete-row" />
                              </Tag>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td></td>
                            <td></td>
                            <td>Total :</td>
                            <td>
                              {simboloMoneda}{" "}
                              {listCupones.reduce(
                                (total, cupon) => total + cupon.descuento,
                                0
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
          <div className="buttons-external">
            <button
              type="button"
              className="b-cancelar"
              onDoubleClick={() => {
                mode === "Delivery" && action === "Editar"
                  ? onReturn()
                  : mode === "Delivery" && action === "Guardar"
                  ? onReturn(false)
                  : navigate(
                      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}/`
                    );
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              /*disabled={isPortalPago ? true : false}*/ className="b-saved"
            >
              {action}
            </button>
          </div>
        </div>
        {PortalValidPromocion ? (
          <Portal
            onClose={() => {
              setPortalValiPromocion(false);
            }}
          >
            <div className="valid-promocion">
              <h2>Ingresar codigo de Promocion</h2>
              <TextInput
                label="Codigo de Promocion :"
                className="input-promotion"
                radius="md"
                onChange={(e) => {
                  setCupon(e.target.value);
                  setResValidCupon(null);
                }}
                autoComplete="off"
              />
              <button
                type="button"
                className="btn-valid"
                onClick={() => validCupon(cupon)}
              >
                Validar
              </button>

              {resValidCupon ? (
                <>
                  <textarea
                    style={
                      resValidCupon?.validacion === true
                        ? { borderColor: "#00e676" }
                        : { borderColor: "#f5532f" }
                    }
                    className="description-info"
                    defaultValue={
                      resValidCupon?.validacion === true
                        ? resValidCupon?.promocion.descripcion
                        : resValidCupon?.respuesta
                    }
                    readOnly
                  />
                  {resValidCupon?.validacion === true ? (
                    <button
                      type="button"
                      className="btn-add"
                      onClick={() => {
                        // Buscar si ya existe un registro en la lista
                        const exists = listCupones.some(
                          (c) => c.codigoCupon === cupon
                        );
                        if (!exists) {
                          let dscFinal = 0;
                          if (
                            resValidCupon.promocion.tipoPromocion === "Varios"
                          ) {
                            if (
                              resValidCupon.promocion.tipoDescuento ===
                              "Porcentaje"
                            ) {
                              dscFinal = 0;
                            } else {
                              dscFinal = resValidCupon.promocion.descuento;
                            }
                          } else {
                            // tipoPromocion es Unico
                            if (
                              resValidCupon.promocion.tipoDescuento ===
                                "Gratis" &&
                              resValidCupon.promocion.tipoPromocion === "Unico"
                            ) {
                              const prendaEncontrada = InfoServicios.find(
                                (p) =>
                                  p._id === resValidCupon.promocion.prenda[0]
                              );
                              dscFinal =
                                prendaEncontrada.precioVenta *
                                resValidCupon.promocion.descuento;
                            }
                          }

                          const cuponActual = {
                            codigoCupon: cupon,
                            codigoPromocion: resValidCupon.promocion.codigo,
                            descripcion: resValidCupon.promocion.descripcion,
                            prenda: resValidCupon.promocion.prenda,
                            alcance: resValidCupon.promocion.alcance,
                            nMultiplicador: resValidCupon.promocion.descuento,
                            descuento: dscFinal,
                            tipoDescuento:
                              resValidCupon.promocion.tipoDescuento,
                            tipoPromocion:
                              resValidCupon.promocion.tipoPromocion,
                          };

                          setListCupones([...listCupones, cuponActual]);
                          formik.setFieldValue(
                            "cargosExtras.beneficios.promociones",
                            [
                              ...formik.values.cargosExtras.beneficios
                                .promociones,
                              cuponActual,
                            ]
                          );

                          alert("¡Se agregó correctamente!");
                          setPortalValiPromocion(false);
                          setResValidCupon(null);
                          setCupon();
                        } else {
                          // Si ya existe un registro con el mismo codigoPromocion, puedes manejarlo como desees
                          alert("¡El registro ya existe!");
                        }
                      }}
                    >
                      Agregar
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </Portal>
        ) : null}
      </form>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setIsPromocion(false);
          formik.setFieldValue("gift_promo", []);
        }}
        size={650}
        scrollAreaComponent={ScrollArea.Autosize}
        title="¿ Deseas entregar uno o mas cupones de Promocion ?"
        centered
      >
        {isPromocion === true ? (
          <Promocion onAddCupon={openModal} />
        ) : (
          <div className="opcion">
            <button
              className="btn-action acp"
              type="button"
              onClick={() => {
                setIsPromocion(true);
              }}
            >
              Si
            </button>
            <button
              className="btn-action neg"
              type="submit"
              onClick={() => openModal([])}
            >
              No
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdenServicio;
