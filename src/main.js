import './style.css'
import XCell from './xcell.js';

const data = [
  [10, 11, 1],
  [22, 22, 1],
  [1, 13, 1],
  [2, 13, 1],
  [3, 13, 1],
  [4, 13, 1],
  [5, 13, 1],
  [6, 13, 1],
  [7, 13, 1],
  [8, 13, 1],
  [9, 13, 1],
  [10, 13, 1],
];

const rowHeaders = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

const xcell = new XCell(
  document.querySelector('#app'), 
  data,
  [
    { title: 'Первый', type: 'number' },
    { title: 'Второй', type: 'number' },
    { title: 'Третий', type: 'number' },
    { title: 'Комментарий', type: 'text' },
  ],
  rowHeaders,
);

document.querySelector('#app').addEventListener('changeData', (event) => { 
  console.log(event);
});

