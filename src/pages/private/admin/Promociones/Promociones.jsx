/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import {
  Box,
  Button,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  Table,
  Textarea,
} from "@mantine/core";
import * as Yup from "yup";
import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import React, { useEffect, useState, useRef } from "react";
import { Formik, useFormik } from "formik";
import { useDisclosure } from "@mantine/hooks";
import { ScrollArea } from "@mantine/core";
import "./promocion.scss";
import SwitchModel from "../../../../components/SwitchModel/SwitchModel";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as Eliminar } from "../../../../utils/img/OrdenServicio/eliminar.svg";
import {
  DeletePromocion,
  addPromocion,
} from "../../../../redux/actions/aPromociones";
import {
  codigoPhonePais,
  nameMoneda,
  simboloMoneda,
} from "../../../../services/global";
import giftcupon from "./gift.png";
import {
  WSendMessage,
  handleRegisterCupon,
} from "../../../../services/default.services";
import { Notify } from "../../../../utils/notify/Notify";
import whatsappApp from "./whatsappApp.png";
import Cupon from "../../../../components/PRIVATE/Cupon/Cupon";
import axios from "axios";
import moment from "moment";
import { DateDetail, calcularFechaFutura } from "../../../../utils/functions";
import { useMemo } from "react";
import { MantineReactTable } from "mantine-react-table";
import Portal from "../../../../components/PRIVATE/Portal/Portal";
import Maintenance from "./Accion/Maintenance";

const Promociones = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const dispatch = useDispatch();
  const [listPrendas, setListPrendas] = useState([]);
  const [promoSelected, setPromoSelected] = useState();
  const [phoneA, setPhoneA] = useState("");
  const [sCuponSaved, setSCuponSaved] = useState(false);
  const [lPrendasInicial, setLPrendasInicial] = useState([]);

  const inputRef = useRef();

  const [listPromociones, setListPromociones] = useState([]);

  const [rowPick, setRowPick] = useState(null);
  const [PActions, setPActions] = useState(false);
  const [action, setAction] = useState("");

  const InfoServicios = useSelector((state) => state.servicios.listServicios);
  const InfoCategorias = useSelector(
    (state) => state.categorias.listCategorias
  );

  const infoPromocion = useSelector((state) => state.promocion.infoPromocion);
  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const columns = useMemo(
    () => [
      {
        header: "Codigo",
        accessorKey: "codigo",
        size: 120,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Descripcion",
        accessorKey: "descripcion",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        Cell: ({ cell }) => (
          <Textarea value={cell.getValue()} minRows={3} maxRows={5} readOnly />
        ),
        size: 250,
      },
      {
        header: "Descuento",
        accessorKey: "descuento",
        size: 70,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Items",
        accessorKey: "Items",
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        Cell: ({ cell }) => {
          // const data = cell.getValue();

          const infoData = InfoServicios.map((service) => ({
            value: service._id,
            label: service.nombre,
          }));

          infoData.push({ label: "Todos", value: "Todos" });

          return (
            <MultiSelect value={cell.getValue()} data={infoData} readOnly />
          );
        },
        size: 250,
      },
      {
        header: "Cantidad Minima",
        accessorKey: "cantidadMin",
        size: 100,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Vigencia",
        accessorKey: "vigencia",
        size: 30,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
      },
      {
        header: "Estado",
        accessorKey: "state",
        size: 30,
        mantineFilterTextInputProps: {
          placeholder: "",
        },
        Cell: ({ cell }) => (
          <Box>
            {cell.getValue() === "activo" ? (
              <i style={{ color: "#2260ff" }} className="fa-solid fa-eye" />
            ) : (
              <i
                style={{ color: "#686868" }}
                className="fa-solid fa-eye-slash"
              />
            )}
          </Box>
        ),
      },
    ],
    []
  );

  const validDeletePromocion = (id) =>
    modals.openConfirmModal({
      title: "Eliminar Promocion",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro de eliminar esta promocion ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "red" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => {
        dispatch(DeletePromocion(id));
        handleCloseAction();
      },
    });

  const handleAddPromocion = async (promo) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/generate-codigo-cupon`
      );

      if (response.data) {
        const codigoCupon = response.data;
        setPromoSelected({ codigoCupon, ...promo });
        open();
        setTimeout(() => {
          inputRef.current.focus();
        }, 1000);
      } else {
        alert("No se pudo generar promocion");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const handleSavedSendCup = async () => {
    const promociones = [
      {
        codigoPromocion: promoSelected.codigo,
        codigoCupon: promoSelected.codigoCupon,
      },
    ];
    await handleRegisterCupon(promociones).then((responses) => {
      const res = responses[0];
      if (res.status === 201) {
        Notify("Cupon Creado Existosamente", res.data.mensaje, "success");
        handleSendMessage();
      }
    });
  };

  const handleSendMessage = () => {
    const number = phoneA;
    const mensaje = `¡Hola le saluda la *Lavanderia ${
      InfoNegocio.name
    }*, enviandole esta *promocion* de *regalo* : *${
      promoSelected.descripcion
    }*, puede cangearlo con el siguiente codigo: *${
      promoSelected.codigoCupon
    }* hasta el día ${calcularFechaFutura(promoSelected.vigencia)}`;
    for (let index = 0; index < 2; index++) {
      WSendMessage(mensaje, number);
    }
  };

  const handleGetValuesServices = (ids) => {
    const resultado = [];

    ids.forEach((id) => {
      const productoEncontrado = InfoServicios.find(
        (service) => service._id === id
      );
      if (productoEncontrado) {
        resultado.push(productoEncontrado._id);
      }
    });

    return resultado;
  };

  const handleCloseAction = () => {
    setRowPick(null);
    setPActions(false);
    setAction("");
  };

  useEffect(() => {
    const transformData = (ListPromos) => {
      return ListPromos.map((promo) => {
        const newAtrr =
          promo.alcance === "Parte"
            ? handleGetValuesServices(promo.prenda)
            : ["Todos"];

        let CantidadMinima;
        if (promo.tipoPromocion === "Unico") {
          if (
            promo.tipoDescuento === "Porcentaje" ||
            promo.tipoDescuento === "Gratis"
          ) {
            CantidadMinima =
              promo.tipoPromocion === "Unico"
                ? `${promo.cantidadMin} ${
                    InfoServicios.find(
                      (service) => service._id === promo.prenda[0]
                    ).simboloMedida
                  }`
                : promo.cantidadMin;
          } else {
            CantidadMinima = `${simboloMoneda} ${promo.cantidadMin}`;
          }
        } else {
          if (promo.tipoDescuento === "Monto") {
            CantidadMinima = `${simboloMoneda}${promo.cantidadMin}`;
          } else {
            CantidadMinima = promo.cantidadMin;
          }
        }

        let Descuento;
        if (promo.tipoDescuento === "Monto") {
          Descuento = `${simboloMoneda} ${promo.descuento}`;
        } else if (promo.tipoDescuento === "Gratis") {
          Descuento = `${promo.descuento} VU`;
        } else {
          Descuento = `${promo.descuento} %`;
        }

        return {
          ...promo,
          cantidadMin: CantidadMinima,
          descuento: Descuento,
          Items: newAtrr,
          vigencia: `${promo.vigencia} ${
            promo.vigencia === 1 ? "dia" : "dias"
          }`,
        };
      });
    };

    const transformedPromociones = transformData(infoPromocion);
    setListPromociones(transformedPromociones);
  }, [infoPromocion]);

  return (
    <div className="content-promos">
      <div className="action-h">
        <Button
          type="button"
          onClick={() => {
            setPActions(true);
            setAction("Add");
          }}
        >
          Agregar Promocion
        </Button>
      </div>
      <MantineReactTable
        columns={columns}
        data={listPromociones}
        initialState={{
          density: "xs",
          pagination: {},
        }}
        enableToolbarInternalActions={false}
        enableColumnActions={false}
        enableSorting={false}
        enableTopToolbar={false}
        enableExpandAll={false}
        enablePagination={false}
        enableBottomToolbar={false}
        enableStickyHeader
        mantineTableContainerProps={{
          sx: {
            maxHeight: "400px",
          },
        }}
        mantineTableBodyRowProps={({ row }) => ({
          onDoubleClick: () => {
            const iPromo = infoPromocion.find(
              (pr) => pr._id === row.original._id
            );

            const newAtrr =
              iPromo.alcance === "Parte"
                ? handleGetValuesServices(iPromo.prenda)
                : ["Todos"];
            setRowPick({ ...iPromo, prenda: newAtrr });
            setPActions(true);
          },
        })}
      />
      <Modal
        opened={opened}
        closeOnClickOutside={false}
        // closeOnEscape={false}
        // withCloseButton={false}
        onClose={() => {
          close();
          handleCloseAction();
        }}
        size={450}
        title={"Cupon de Promociones Manual"}
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
                  const validInput = inputValue
                    ? inputValue.replace(/[^0-9.]/g, "")
                    : "";
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
            gradient={{ from: "indigo", to: "cyan" }}
          >
            {sCuponSaved === false ? "Guardar y Enviar" : "Reenviar"}
          </Button>
        </form>
      </Modal>
      {PActions && (
        <Portal onClose={handleCloseAction}>
          {action === "Add" ? (
            <Maintenance onClose={handleCloseAction} />
          ) : action === "Edit" ? (
            <Maintenance info={rowPick} onClose={handleCloseAction} />
          ) : (
            <div className="portal-action-promocion">
              <span>codigo : {rowPick.codigo}</span>
              <div className="action">
                <Button
                  type="submit"
                  style={{ background: "#339af0" }}
                  onClick={() => {
                    setAction("Edit");
                  }}
                >
                  Actualizar Servicio
                </Button>

                <Button
                  type="submit"
                  style={{ background: "#1ec885" }}
                  onClick={() => {
                    handleAddPromocion(rowPick);
                  }}
                >
                  Generar Cupon
                </Button>

                <Button
                  type="submit"
                  style={{ background: "#e76565" }}
                  onClick={() => validDeletePromocion(rowPick._id)}
                >
                  Eliminar Servicio
                </Button>
              </div>
            </div>
          )}
        </Portal>
      )}
    </div>
  );
};

export default Promociones;
