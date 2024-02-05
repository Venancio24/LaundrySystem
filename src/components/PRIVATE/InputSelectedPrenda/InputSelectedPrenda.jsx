/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { useCallback } from 'react';
import Prendas from '../../../utils/img/Prendas/index';

import { Avatar, Group, Select, Text } from '@mantine/core';
import { forwardRef, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

const {
  Abrigo,
  // Alfombra,
  Almohada,
  Camisa,
  Casaca,
  Alfombra,
  Terno,
  Cobertor,
  Cortinas,
  Cubrecama,
  Otro,
  Frazada,
  Jean,
  Manta,
  Pantalon,
  Polo,
  Saco,
  Tapete,
  Zapatillas,
} = Prendas;

const SelectItem = forwardRef(({ image, label, ...others }, ref) => (
  <div ref={ref} {...others}>
    <Group noWrap={true}>
      <Avatar src={image} />
      <div>
        <Text>{label}</Text>
      </div>
    </Group>
  </div>
));

const InputSelectedPrenda = ({ listenClick, tabI, disabled }) => {
  const infoProductos = useSelector((state) => state.prenda.infoPrendas);
  const [data, setData] = useState([]);
  const [defaultValue, setDefaultValue] = useState(null);

  const getPricePrenda = useCallback((productos, nombre) => {
    const product = productos.find((producto) => producto.name.toLowerCase() === nombre.toLowerCase());

    if (product) {
      return product.price;
    }

    return 0;
  }, []);

  useEffect(() => {
    const productosDB = infoProductos;
    // Producto - precio - stado
    const info = [
      // {
      //   image: Edredon,
      //   label: 'Edredon',
      //   value: ['Edredon', getPricePrenda(productosDB, 'Edredon'), false],
      // },
      {
        image: Cobertor,
        label: 'Cobertor',
        value: ['Cobertor', getPricePrenda(productosDB, 'Cobertor'), false],
      },
      {
        image: Cubrecama,
        label: 'Cubrecama',
        value: ['Cubrecama', getPricePrenda(productosDB, 'Cubrecama'), false],
      },

      {
        image: Frazada,
        label: 'Frazada',
        value: ['Frazada', getPricePrenda(productosDB, 'Frazada'), false],
      },
      {
        image: Manta,
        label: 'Manta',
        value: ['Manta', getPricePrenda(productosDB, 'Manta'), false],
      },
      {
        image: Casaca,
        label: 'Casaca',
        value: ['Casaca', getPricePrenda(productosDB, 'Casaca'), false],
      },
      {
        image: Terno,
        label: 'Terno',
        value: ['Terno', getPricePrenda(productosDB, 'Terno'), false],
      },
      {
        image: Saco,
        label: 'Saco',
        value: ['Saco', getPricePrenda(productosDB, 'Saco'), false],
      },
      {
        image: Camisa,
        label: 'Camisa',
        value: ['Camisa', getPricePrenda(productosDB, 'Camisa'), false],
      },
      {
        image: Polo,
        label: 'Polo',
        value: ['Polo', getPricePrenda(productosDB, 'Polo'), false],
      },
      {
        image: Abrigo,
        label: 'Abrigo',
        value: ['Abrigo', getPricePrenda(productosDB, 'Abrigo'), false],
      },
      {
        image: Pantalon,
        label: 'Pantalon',
        value: ['Pantalon', getPricePrenda(productosDB, 'Pantalon'), false],
      },
      {
        image: Zapatillas,
        label: 'Zapatillas',
        value: ['Zapatillas', getPricePrenda(productosDB, 'Zapatillas'), false],
      },
      {
        image: Jean,
        label: 'Jean',
        value: ['Jean', getPricePrenda(productosDB, 'Jean'), false],
      },
      {
        image: Alfombra,
        label: 'Alfombra',
        value: ['Alfombra', getPricePrenda(productosDB, 'Alfombra'), false],
      },
      {
        image: Cortinas,
        label: 'Cortinas',
        value: ['Cortinas', getPricePrenda(productosDB, 'Cortinas'), false],
      },

      {
        image: Almohada,
        label: 'Almohada',
        value: ['Almohada', getPricePrenda(productosDB, 'Almohada'), false],
      },
      {
        image: Tapete,
        label: 'Tapete',
        value: ['Tapete', getPricePrenda(productosDB, 'Tapete'), false],
      },
      {
        image: Otro,
        label: 'Otros',
        value: ['Otros', '', false], // Producto - precio - stado - Categoria
      },
    ];

    setData(info);
  }, [infoProductos]);

  return (
    <Select
      label="Escoga Prenda :"
      placeholder="Escoga para agregar"
      itemComponent={SelectItem}
      data={data}
      value={defaultValue}
      size="lg"
      searchable={true}
      tabIndex={tabI}
      disabled={disabled}
      dropdownPosition="bottom"
      maxDropdownHeight={270}
      nothingFound="No encontrado"
      filter={(value, item) => item.label.toLowerCase().includes(value.toLowerCase().trim())}
      hoverOnSearchChange={true}
      onChange={(value) => {
        listenClick(value[0], value[1], value[2]);
        setDefaultValue(null);
      }}
    />
  );
};

export default InputSelectedPrenda;
