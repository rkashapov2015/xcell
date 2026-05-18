import './style.css'
import XCell from './xcell.js';

const data = [
  ['Январь', 10, 11],
  ['Февраль', 22, 22],
  ['Март', 1, 13],
  ['Апрель', 2, 13],
  ['Май', 3, 13],
  ['Июнь', 4, 13],
  ['Июль', 5, 13],
  ['Август', 6, 13],
  ['Сентябрь', 7, 13],
  ['Октябрь', 8, 13],
  ['Ноябрь', 9, 13],
  ['Декабрь', 10, 13],
];

const xcell = new XCell(
  document.querySelector('#app'), 
  data,
  [
    { title: '', type: 'readonly' },
    { title: 'План', type: 'number' },
    { title: 'Факт', type: 'number' },
  ],
);

