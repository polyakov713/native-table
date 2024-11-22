interface Address {
  city: string
  street: string
  geo: { lat: string, lng: string }
  suite: string
  zipcode: string
}

interface Company {
  bs: string
  catchPhrase: string
  name: string
}

interface LoginData {
  username: string
  uuid: string
}

interface User {
  address: Address
  birthDate: string
  company: Company
  email: string
  firstname: string
  id: number
  lastname: string
  login: LoginData
  phone: string
  website: string
}

interface UserTransformed {
  address: string
  email: string
  firstname: string
  id: number
  lastname: string
  phone: string
}

interface ColumnConfig {
  name: string
  title: string
}

const ui: Record<string, HTMLElement | null> = {
  tableHeader: null,
  tableBody: null,
  filterForm: null,
};

let usersList: User[] = [];
let usersListFiltered: User[] = [];

const COLUMNS: ColumnConfig[] = [
  {
    name: 'id',
    title: 'ID',
  },
  {
    name: 'firstname',
    title: 'Firstname',
  },
  {
    name: 'lastname',
    title: 'Lastname',
  },
  {
    name: 'email',
    title: 'E-mail',
  },
  {
    name: 'phone',
    title: 'Phone',
  },
  {
    name: 'address',
    title: 'Address',
  },
  {
    name: 'actions',
    title: 'Actions',
  },
];

async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch('https://jsonplaceholder.org/users');

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }

    const json = await res.json();

    return json;
  } catch (err) {
    console.error(err);
  }
}

function transformUser(user: User): UserTransformed {
  const { address } = user;

  return {
    ...user,
    address: `${address.city}, ${address.street}`
  };
}

async function initPage() {
  usersList = await fetchUsers();

  renderTableBody<User, UserTransformed>(COLUMNS, usersList, transformUser);
}

function initUI() {
  ui.tableHeader = document.querySelector('#table-header');
  ui.tableBody = document.querySelector('#table-body');
  ui.filterForm = document.querySelector('#filter-form');
}

// Render start
function renderTableHeader(config: ColumnConfig[]) {
  let thColumns: string = '';

  config.forEach((col) => {
    thColumns += `<th>${col.title}</th>`;
  });

  ui.tableHeader.innerHTML = `<tr>${thColumns}</tr>`;
}

function renderTableBody<T, K>(config: ColumnConfig[], data: Array<T>, transformer?: (dateItem: T) => K) {
  function renderRow(dataItem: T | K): string {
    let tdColumns: string = '';

    config.forEach((col) => {
      if (col.name === 'actions') {
        tdColumns += '<td><button class="base-button base-button--small">&#x2715;</button></td>';
      } else {
        tdColumns += `<td>${dataItem[col.name]}</td>`;
      }
    });

    return `<tr>${tdColumns}</tr>`;
  }

  let tbodyContent: string = '';

  if (!data.length) {
    tbodyContent = `<tr class="base-smart-table__no-data">
              <td colspan="${config.length}" class="base-table__no-data-col">
                NO DATA
              </td>
            </tr>`;
  } else {
    data.forEach((dataItem) => {
      const dataItemTransformed = transformer ? transformer(dataItem) : dataItem;
      tbodyContent += renderRow(dataItemTransformed);
    });
  }

  ui.tableBody.innerHTML = tbodyContent;
}

// Render End

// Filtering start
function filterUsers(filterValue: string): User[] {
  const filterValuePrepared = filterValue.toLowerCase();

  return usersList.filter(({ firstname, lastname }) => firstname.toLowerCase().includes(filterValuePrepared)
    || lastname.toLowerCase().includes(filterValuePrepared));
}

function onFilter(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const filterInput = form.elements[0] as HTMLInputElement;
  const filterValue = filterInput.value;

  usersListFiltered = filterUsers(filterValue);
  renderTableBody<User, UserTransformed>(COLUMNS, usersListFiltered, transformUser);
}
// Filtering end

function onDocumentReady() {
  initUI();

  renderTableHeader(COLUMNS);
  renderTableBody<User, UserTransformed>(COLUMNS, usersList, transformUser);

  ui.filterForm.addEventListener('submit', onFilter);
}

document.addEventListener('DOMContentLoaded', onDocumentReady);

initPage();
