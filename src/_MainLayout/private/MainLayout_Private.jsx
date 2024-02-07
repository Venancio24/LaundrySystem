/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { HeaderAdmin, HeaderCoord } from '../../components/PRIVATE/Header/index';
import { PrivateRoutes, PublicRoutes, Roles } from '../../models/index';
import { GetCodigos } from '../../redux/actions/aCodigo';
import { GetOrdenServices_DateRange } from '../../redux/actions/aOrdenServices';
import { GetPrendas } from '../../redux/actions/aPrenda';
import { GetMetas } from '../../redux/actions/aMetas';
import { DateCurrent, GetFirstFilter } from '../../utils/functions';
import {
  LS_newOrder,
  LS_updateListOrder,
  LS_updateOrder,
  LS_updateRegisteredDay,
  setOrderServiceId,
} from '../../redux/states/service_order';

import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

import Portal from '../../components/PRIVATE/Portal/Portal';

import './mainLayout_Private.scss';
import Gasto from '../../pages/private/coord/Gastos/Gasto';
import { ReporteDiario } from '../../pages/private/coord/Reporte/index';

import { LS_nextCodigo } from '../../redux/states/codigo';

import { LS_updatePrendas } from '../../redux/states/prenda';
import { GetImpuesto, GetPuntos } from '../../redux/actions/aModificadores';
import { LS_updateImpuestos, LS_updatePuntos } from '../../redux/states/modificadores';
import { GetPromocion } from '../../redux/actions/aPromociones';
import { LS_updatePromociones } from '../../redux/states/promociones';
import { GetInfoNegocio } from '../../redux/actions/aNegocio';
import { LS_updateNegocio } from '../../redux/states/negocio';
import { LS_FirtsLogin } from '../../redux/states/user';
import { useDisclosure } from '@mantine/hooks';
import { ScrollArea } from '@mantine/core';
import { Modal } from '@mantine/core';

import Trash from './trash.png';
import CloseEmergency from './close-emergency.png';
import DoubleLogin from './double-login.png';
import UpdateUser from './update-user.png';
import TimeOut from '../out-of-time.png';
import moment from 'moment';
import LoaderSpiner from '../../components/LoaderSpinner/LoaderSpiner';
import { useRef } from 'react';
import { socket } from '../../utils/socket/connect';
import { LS_newDelivery, LS_updateDelivery } from '../../redux/states/delivery';
import { GetLastCuadre } from '../../redux/actions/aCuadre';
import { updateLastCuadre } from '../../redux/states/cuadre';

const PrivateMasterLayout = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const InfoUsuario = useSelector((store) => store.user.infoUsuario);
  const [data, setData] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mGasto, setMGasto] = useState(false);
  // const [mInformeDiario, setMInformeDiario] = useState(false);

  const { reserved } = useSelector((state) => state.orden);
  const { lastCuadre } = useSelector((state) => state.cuadre);

  const infoCodigo = useSelector((state) => state.codigo.infoCodigo);
  const infoMetas = useSelector((state) => state.metas.infoMetas);
  const infoPrendas = useSelector((state) => state.prenda.infoPrendas);
  const infoImpuesto = useSelector((state) => state.modificadores.InfoImpuesto);
  const infoPuntos = useSelector((state) => state.modificadores.InfoPuntos);
  const infoPromocion = useSelector((state) => state.promocion.infoPromocion);
  const infoNegocio = useSelector((state) => state.negocio.infoNegocio);

  const [loading, setLoading] = useState(true);

  const _handleShowModal = (title, message, ico) => {
    setData({ title, message, ico });
    open();
    setTimeout(() => {
      close();
      navigate(`/${PublicRoutes.LOGIN}`, { replace: true });
    }, 5000);
  };

  let intentosActuales = useRef(1);

  useEffect(() => {
    const fetchData = async () => {
      let success = false;
      while (intentosActuales.current <= 3 && !success) {
        try {
          const promises = [];

          if (GetFirstFilter().formatoD[0] && GetFirstFilter().formatoD[1]) {
            promises.push(
              dispatch(
                GetOrdenServices_DateRange({
                  dateInicio: GetFirstFilter().formatoD[0],
                  dateFin: GetFirstFilter().formatoD[1],
                })
              )
            );
          }

          if (infoCodigo.length === 0) {
            promises.push(dispatch(GetCodigos()));
          }

          if (lastCuadre === null) {
            promises.push(dispatch(GetLastCuadre()));
          }

          if (infoPrendas.length === 0) {
            promises.push(dispatch(GetPrendas()));
          }

          if (infoMetas.length === 0) {
            promises.push(dispatch(GetMetas()));
          }

          if (infoPromocion.length === 0) {
            promises.push(dispatch(GetPromocion()));
          }

          if (Object.keys(infoImpuesto).length === 0) {
            promises.push(dispatch(GetImpuesto()));
          }

          if (Object.keys(infoPuntos).length === 0) {
            promises.push(dispatch(GetPuntos()));
          }

          if (Object.keys(infoNegocio).length === 0) {
            promises.push(dispatch(GetInfoNegocio()));
          }

          // Esperar a que todas las promesas se resuelvan
          const responses = await Promise.all(promises);

          // Si todas las promesas se resolvieron con éxito, marcar como éxito y salir del bucle
          if (responses.every((response) => response && !response.error)) {
            success = true;
            setLoading(false);
          }
        } catch (error) {
          if (intentosActuales.current >= 3) {
            setLoading(true);
            _handleShowModal('Advertencia', 'Error de sistema comunicarse con el Soporte Técnico', 'close-emergency');
          }
          intentosActuales.current++;
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    notifications.clean();
    if (reserved.length === 0) return;

    const reservedIds = reserved.map((r) => r._id);
    const existingNotifications = new Set(); // Conjunto para almacenar los IDs de las notificaciones existentes

    // Mostrar notificaciones para nuevas facturas reservadas y agregar sus IDs al conjunto
    reserved.forEach((r) => {
      if (!existingNotifications.has(r.Id)) {
        notifications.show({
          id: r._id,
          autoClose: false,
          withCloseButton: false,
          withBorder: true,
          title: `Delivery Pendiente - ${r.Nombre}`,
          message: 'Falta registrar datos!',
          styles: () => ({
            root: {
              backgroundColor: '#5161ce',
              width: '250px',
              '&::before': { backgroundColor: '#fff' },
              '&:hover': { backgroundColor: '#1e34c3' },
            },
            title: { color: '#fff' },
            description: { color: '#fff' },
          }),
          onClick: () => {
            const currentPath = new URL(window.location.href).pathname;
            const dir = `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.FINISH_ORDEN_SERVICE_PENDING}/${r._id}`;
            if (dir !== currentPath) {
              dispatch(setOrderServiceId(false));
              navigate(dir);
            }
          },
        });
        existingNotifications.add(r._id);
      }
    });

    // Eliminar notificaciones correspondientes a elementos eliminados
    existingNotifications.forEach((notificationId) => {
      if (!reservedIds.includes(notificationId)) {
        notifications.remove(notificationId);
        existingNotifications.delete(notificationId);
      }
    });
  }, [reserved]);

  useEffect(() => {
    // ORDER
    socket.on('server:newOrder', (data) => {
      dispatch(LS_newOrder(data));
      // if (data.datePago.fecha === DateCurrent().format4) {
      //   dispatch(LS_updateRegisteredDay(data));
      // }
      dispatch(LS_updateRegisteredDay(data));
    });
    socket.on('server:orderUpdated', (data) => {
      dispatch(LS_updateOrder(data));
      dispatch(LS_updateRegisteredDay(data));
    });
    socket.on('server:updateListOrder', (data) => {
      dispatch(LS_updateListOrder(data));
    });
    socket.on('server:changeCuadre', (data) => {
      dispatch(updateLastCuadre(data));
    });
    // DELIVERY
    //-- New
    socket.on('server:newDelivery', (data) => {
      dispatch(LS_newDelivery(data));
    });
    //-- Update
    socket.on('server:updateDelivery', (data) => {
      dispatch(LS_updateDelivery(data));
    });
    // CODIGO
    socket.on('server:newCodigo', (data) => {
      dispatch(LS_nextCodigo(data));
    });
    // PRENDAS
    socket.on('server:cPricePrendas', (data) => {
      dispatch(LS_updatePrendas(data));
    });
    // PUNTOS
    socket.on('server:cPuntos', (data) => {
      dispatch(LS_updatePuntos(data));
    });
    // IMPUESTOS
    socket.on('server:cImpuesto', (data) => {
      dispatch(LS_updateImpuestos(data));
    });
    // PROMOCIONES
    socket.on('server:cPromotions', (data) => {
      dispatch(LS_updatePromociones(data));
    });
    // NEGOCIO
    socket.on('server:cNegocio', (data) => {
      const { dias, horas, estado } = data.horario;
      if (estado === false) {
        _handleShowModal('Emergencia', 'Cierre total del sistema', 'close-emergency');
      } else {
        if (InfoUsuario.rol !== Roles.ADMIN) {
          const currentDay = moment().isoWeekday();
          const currentHour = moment();

          if (dias.includes(currentDay)) {
            const startTime = moment(horas.inicio, 'HH:mm');
            const endTime = moment(horas.fin, 'HH:mm');

            if (currentHour.isBetween(startTime, endTime)) {
              dispatch(LS_updateNegocio(data));
            } else {
              _handleShowModal('Comunicado', 'Se encuentra fuera del Horario de Atencion', 'time-out');
            }
          } else {
            _handleShowModal('Comunicado', 'Se encuentra fuera de Dias Laborables', 'time-out');
          }
        } else {
          dispatch(LS_updateNegocio(data));
        }
      }
    });
    // LOGIN
    socket.on('server:onLogin', (data) => {
      if (InfoUsuario._id === data) {
        _handleShowModal('Comunicado', 'Se registro otro inicio de sesion con esta cuenta', 'double-login');
      }
    });
    // 1er LOGIN
    socket.on('server:onFirtLogin', (data) => {
      dispatch(LS_FirtsLogin(data));
    });
    // Cambio en los datos de usuario
    socket.on('server:onChangeUser', (data) => {
      if (InfoUsuario._id === data) {
        _handleShowModal(
          'Administracion',
          'Hubo una Actualizacion en sus datos, vuelva a ingresar nuevamente',
          'update-user'
        );
      }
    });
    // Elimancion de Usuario
    socket.on('server:onDeleteAccount', (data) => {
      if (InfoUsuario._id === data) {
        _handleShowModal('Administracion', 'Su cuenta ha sido ELIMINADA', 'delete');
      }
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off('server:newOrder');
      socket.off('server:orderUpdated');
      socket.off('server:updateListOrder');

      socket.off('server:newDelivery');
      socket.off('server:updateDelivery');

      socket.off('server:cPricePrendas');
      socket.off('server:cPuntos');
      socket.off('server:cImpuesto');
      socket.off('server:cPromotions');
      socket.off('server:cNegocio');
      socket.off('server:onLogin');
      socket.off('server:onFirtLogin');
      socket.off('server:onDeleteAccount');
      socket.off('server:onChangeUser');
    };
  }, []);

  return (
    <div className={`principal_container_private ${loading ? 'space-total' : null}`}>
      {loading === true ? (
        <LoaderSpiner />
      ) : (
        <>
          <div className="header_pcp">
            <HeaderCoord />
            {InfoUsuario.rol === Roles.ADMIN ? <HeaderAdmin /> : null}
          </div>
          <section className="body_pcp">{props.children}</section>

          <div id="btn-extra" className="btn-action-extra">
            {InfoUsuario.rol !== Roles.PERS ? (
              <button
                id="btn-gasto"
                className="add-gasto"
                onClick={() => {
                  setMGasto(true);
                }}
              >
                Agregar Gasto
              </button>
            ) : null}
            {/* <button
              id="btn-gasto"
              className="add-gasto"
              onClick={() => {
                setMInformeDiario(true);
              }}
            >
              Informe Diario
            </button> */}
          </div>
          {/* {mInformeDiario ? (
            <Portal
              onClose={() => {
                setMInformeDiario(false);
              }}
            >
              <ReporteDiario onClose={setMInformeDiario} />
            </Portal>
          ) : null} */}
          {mGasto ? (
            <Portal
              onClose={() => {
                setMGasto(false);
              }}
            >
              <Gasto onClose={setMGasto} />
            </Portal>
          ) : null}
        </>
      )}
      <Modal
        opened={opened}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        onClose={close}
        size={350}
        title={false}
        scrollAreaComponent={ScrollArea.Autosize}
        centered
      >
        <div className="content-message-general">
          <div className="body-ms">
            <div className="logo">
              <img
                className="ico"
                src={
                  data &&
                  (data.ico === 'delete'
                    ? Trash
                    : data.ico === 'close-emergency'
                    ? CloseEmergency
                    : data.ico === 'double-login'
                    ? DoubleLogin
                    : data.ico === 'update-user'
                    ? UpdateUser
                    : data.ico === 'time-out'
                    ? TimeOut
                    : null)
                }
                alt=""
              />
            </div>
            <div className="header-mg">
              <h2>{data?.title}</h2>
              <p>{data?.message}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivateMasterLayout;
