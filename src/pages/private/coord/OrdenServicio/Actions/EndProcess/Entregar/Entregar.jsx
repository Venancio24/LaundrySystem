/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';

import { NumberInput } from '@mantine/core';
import { formatValue } from '../../../../../../../utils/functions';
import { ReactComponent as Moto } from '../../../../../../../utils/img/Delivery/moto.svg';
import { ReactComponent as Taxi } from '../../../../../../../utils/img/Delivery/taxi-lateral.svg';
import { ReactComponent as Tienda } from '../../../../../../../utils/img/Delivery/tienda.svg';
import { simboloMoneda } from '../../../../../../../services/global';

const Entregar = ({ setFieldValue, errors, touched, values }) => {
  const inputRef = useRef(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  useEffect(() => {
    if (shouldFocusInput) {
      inputRef.current.focus();
      setShouldFocusInput(false);
    }
  }, [shouldFocusInput]);

  return (
    <>
      <fieldset className="checkbox-group">
        <legend className="checkbox-group-legend">Entregar por :</legend>
        <div className="checkbox">
          <label className="checkbox-wrapper">
            <input
              className="checkbox-input"
              type="radio"
              name="tipoTrasporte"
              value="Taxi"
              onChange={(e) => {
                setFieldValue('tipoTrasporte', e.target.value);
                // setFieldValue('mDevolucion', 6);
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
            <input
              className="checkbox-input"
              type="radio"
              name="tipoTrasporte"
              value="Moto"
              onChange={(e) => {
                setFieldValue('tipoTrasporte', e.target.value);
                setFieldValue('mDevolucion', '');
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
        <div className="checkbox">
          <label className="checkbox-wrapper">
            <input
              className="checkbox-input"
              type="radio"
              name="tipoTrasporte"
              value="Tienda"
              onClick={(e) => {
                setFieldValue('tipoTrasporte', e.target.value);
                setFieldValue('mDevolucion', 0);
                setShouldFocusInput(true);
              }}
            />
            <span className="checkbox-tile">
              <span className="checkbox-icon">
                <Tienda className="custom-icon" />
              </span>
              <span className="checkbox-label">Tienda</span>
            </span>
          </label>
        </div>
        {errors.tipoTrasporte && touched.tipoTrasporte && (
          <div className="ico-req">
            <i className="fa-solid fa-circle-exclamation ">
              <div className="info-req" style={{ pointerEvents: 'none' }}>
                <span>{errors.tipoTrasporte}</span>
              </div>
            </i>
          </div>
        )}
      </fieldset>
      <div className="data-prices">
        <NumberInput
          name="mDevolucion"
          value={values.mDevolucion}
          ref={inputRef}
          disabled={values.tipoTrasporte === 'Tienda' ? true : false}
          // parser={(value) => value.replace(/S\/\s?|(,*)/g, '')}
          parser={(value) => value.replace(new RegExp(`${simboloMoneda}\\s?|(,*)`, 'g'), '')}
          formatter={formatValue}
          placeholder="Ingrese Monto"
          precision={2}
          step={0.05}
          hideControls={true}
          autoComplete="off"
          onChange={(value) => setFieldValue('mDevolucion', value)}
        />
        {errors.mDevolucion && touched.mDevolucion && (
          <div className="ico-req">
            <i className="fa-solid fa-circle-exclamation ">
              <div className="info-req" style={{ pointerEvents: 'none' }}>
                <span>{errors.mDevolucion}</span>
              </div>
            </i>
          </div>
        )}
      </div>
    </>
  );
};

export default Entregar;
