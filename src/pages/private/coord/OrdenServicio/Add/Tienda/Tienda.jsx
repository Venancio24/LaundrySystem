/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import OrdenServicio from "../../../../../../components/PRIVATE/OrdenServicio/OrdenServicio";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { AddOrdenServices } from "../../../../../../redux/actions/aOrdenServices";
import LoaderSpiner from "../../../../../../components/LoaderSpinner/LoaderSpiner";
import { setLastRegister } from "../../../../../../redux/states/service_order";

import "./tienda.scss";
import { PrivateRoutes } from "../../../../../../models";

const Tienda = () => {
  const [redirect, setRedirect] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lastRegister } = useSelector((state) => state.orden);

  const handleRegistrar = async (infoOrden) => {
    dispatch(AddOrdenServices(infoOrden)).then((res) => {
      if ("error" in res) {
        setRedirect(false);
      } else {
        setRedirect(true);
      }
    });
  };

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
        <div className="content-tienda">
          <div className="title-action">
            <h1 className="elegantshadow">Agregando Factura</h1>
            <h1 className="elegantshadow">- TIENDA -</h1>
          </div>
          <OrdenServicio
            mode={"Tienda"}
            action={"Guardar"}
            onAction={handleRegistrar}
          />
        </div>
      ) : (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      )}
    </>
  );
};

export default Tienda;
