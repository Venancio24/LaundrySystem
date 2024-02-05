/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import './prices.scss';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { GetPrendas, updatePrenda } from '../../../../../redux/actions/aPrenda';
import { modals } from '@mantine/modals';
import { Button, Text } from '@mantine/core';

import { useNavigate } from 'react-router-dom';
import { PrivateRoutes } from '../../../../../models';

const MAX_ROW_HEIGHT = 230;

const Prices = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const infoPrendas = useSelector((state) => state.prenda.infoPrendas);

  const formik = useFormik({
    initialValues: {
      prendas: infoPrendas,
    },
    //validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      modals.openConfirmModal({
        title: 'Actualizacion de Precios',
        centered: true,
        children: <Text size="sm">¿ Estas seguro de realizar cambios de precios ?</Text>,
        labels: { confirm: 'Si', cancel: 'No' },
        confirmProps: { color: 'green' },
        onCancel: () => console.log('Cancelado'),
        onConfirm: () => handleUpdatePrices(values),
      });
      setSubmitting(false);
    },
  });

  const handleUpdatePrices = (data) => {
    dispatch(updatePrenda(data));
    navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`);
  };

  useEffect(() => {
    formik.setFieldValue('prendas', infoPrendas);
  }, [infoPrendas]);

  return (
    <div className="content-setting-price">
      {formik.values.prendas.length > 0 ? (
        <form onSubmit={formik.handleSubmit}>
          <h1>Cambios de Precio</h1>
          <div className="tables-info-prendas">
            {formik.values.prendas
              .reduce((tables, prenda, index) => {
                const lastTable = tables[tables.length - 1];

                if (!lastTable || lastTable.height + 30 > MAX_ROW_HEIGHT) {
                  tables.push({ data: [prenda], height: 30 });
                } else {
                  lastTable.data.push(prenda);
                  lastTable.height += 30;
                }

                return tables;
              }, [])
              .map((tableData, tableIndex) => (
                <div className="cash-counter" key={tableIndex}>
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.data.map((p, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>{p.name}</td>
                          <td>
                            <input
                              autoComplete="off"
                              name={`prendas.${formik.values.prendas.indexOf(p)}.price`}
                              className="txtCantidad"
                              value={p.price}
                              onChange={(e) => {
                                const { value } = e.target;
                                const numericValue = value.replace(/[^0-9.]/g, '');
                                formik.setFieldValue(`prendas.${formik.values.prendas.indexOf(p)}.price`, numericValue);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>

          <Button type="submit" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            Guardar Cambios
          </Button>
        </form>
      ) : (
        <div>Cargando...</div>
      )}
    </div>
  );
};

export default Prices;
