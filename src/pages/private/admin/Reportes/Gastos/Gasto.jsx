/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';

import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MonthPickerInput } from '@mantine/dates';
import './gasto.scss';
import { Notify } from '../../../../../utils/notify/Notify';
import moment from 'moment';
import { simboloMoneda } from '../../../../../services/global';

const Gasto = ({ onClose }) => {
  const [datePrincipal, setDatePrincipal] = useState(new Date());

  const openModal = () => {
    onClose();
    const month = moment.utc(datePrincipal).format('MMMM');
    modals.openConfirmModal({
      title: 'Reporte de Gasto Mensual',
      centered: true,
      children: <Text size="sm">¿ Desea Generar Reporte de : {month.toUpperCase()} ?</Text>,
      labels: { confirm: 'Si', cancel: 'No' },
      confirmProps: { color: 'green' },
      onConfirm: () => exportToExcel(),
    });
  };

  const exportToExcel = async () => {
    const mes = String(datePrincipal.getMonth() + 1).padStart(2, '0');
    const anio = datePrincipal.getFullYear();

    const nombreMes = moment(datePrincipal).format('MMMM');

    const fileName = `Reporte de Gastos : ${nombreMes}, del ${anio}`;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lava-ya/get-reporte-gasto?mes=${mes}&anio=${anio}`
      );

      if (response.data) {
        // Crear un nuevo libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Datos');

        const trasformeDate = (date) => {
          return moment(date).format('dddd, D [de] MMMM [del] YYYY');
        };

        // Calcular el ancho máximo basado en los datos
        let maxWidth = 10;
        response.data.forEach((item) => {
          const length = Math.max(trasformeDate(item.fecha).length, item.hora.length);
          maxWidth = Math.max(maxWidth, length);
        });

        // Configurar las columnas
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Fecha', key: 'fecha', width: maxWidth },
          { header: 'Descripcion', key: 'descripcion', width: 30 },
          { header: 'Monto', key: 'monto', width: 15 },
        ];

        // Estilos para el encabezado
        const headerStyle = {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '333333' },
          },
          font: {
            color: { argb: 'FFFFFF' },
            bold: true,
          },
          alignment: {
            horizontal: 'center',
            vertical: 'middle',
          },
        };

        // Agregar los datos
        response.data.forEach((item, index) => {
          const row = worksheet.addRow([
            index + 1,
            trasformeDate(item.fecha) + '\n' + item.hora,
            item.descripcion,
            `${simboloMoneda}${item.monto}`,
          ]);

          // Aplicar estilos a cada celda de la fila
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            // cell.style = cellStyle;
            if (colNumber !== 2) {
              // Centrar todas las celdas excepto la descripción
              cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            }
            if (colNumber === 2) {
              // Asegurar que la celda de fecha tenga el 'padding'
              cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
            }
          });
        });

        // Aplicar estilos al encabezado
        worksheet.getRow(1).eachCell((cell) => {
          cell.fill = headerStyle.fill;
          cell.font = headerStyle.font;
          cell.alignment = headerStyle.alignment;
        });

        worksheet.getColumn('fecha').width = maxWidth + 2;

        // Guardar el archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName + '.xlsx';
        a.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      Notify('Error', 'No se pudo Generar reporte EXCEL', 'fail');
      console.log(error.response.data.mensaje);
    }
  };

  return (
    <div className="cr_monthly">
      <h1 className="title">Exportar Reporte de Gastos Mensual</h1>
      <MonthPickerInput
        style={{ position: 'relative' }}
        label="Ingrese Fecha"
        placeholder="Pick date"
        value={datePrincipal}
        onChange={(date) => {
          setDatePrincipal(date);
        }}
        mx="auto"
        maw={400}
      />
      <button className="xport-xsls" onClick={openModal}>
        Exportar a Excel
      </button>
    </div>
  );
};

export default Gasto;
