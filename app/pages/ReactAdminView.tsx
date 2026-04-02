import { useMemo } from 'react';
import {
  AdminContext,
  AdminUI,
  DataProvider,
  Edit,
  List,
  NumberField,
  NumberInput,
  Resource,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  Datagrid,
} from 'react-admin';
import { mockProducts } from '../data/mockProducts';

type AdminRecord = Record<string, unknown> & { id: string | number };

const productStore: AdminRecord[] = mockProducts.map((p) => ({
  ...p,
  id: p.id,
}));

const notImplemented = async () => {
  throw new Error('Operation not implemented in stage mock provider.');
};

function sortAndPaginate(data: AdminRecord[], field = 'id', order = 'ASC', page = 1, perPage = 25) {
  const sorted = [...data].sort((a, b) => {
    const aValue = a[field] ?? '';
    const bValue = b[field] ?? '';
    if (aValue < bValue) return order === 'ASC' ? -1 : 1;
    if (aValue > bValue) return order === 'ASC' ? 1 : -1;
    return 0;
  });

  const start = (page - 1) * perPage;
  return {
    data: sorted.slice(start, start + perPage),
    total: sorted.length,
  };
}

function buildDataProvider(): DataProvider {
  return {
    getList: async (resource, params) => {
      if (resource !== 'products') return { data: [], total: 0 };
      const { field, order } = params.sort;
      const { page, perPage } = params.pagination;
      return sortAndPaginate(productStore, field, order, page, perPage);
    },
    getOne: async (resource, params) => {
      if (resource !== 'products') throw new Error('Unknown resource');
      const row = productStore.find((item) => String(item.id) === String(params.id));
      if (!row) throw new Error('Record not found');
      return { data: row };
    },
    getMany: async (resource, params) => {
      if (resource !== 'products') return { data: [] };
      return { data: productStore.filter((item) => params.ids.includes(item.id)) };
    },
    getManyReference: async () => ({ data: [], total: 0 }),
    create: notImplemented,
    delete: notImplemented,
    deleteMany: notImplemented,
    update: async (resource, params) => {
      if (resource !== 'products') throw new Error('Unknown resource');
      const index = productStore.findIndex((item) => String(item.id) === String(params.id));
      if (index === -1) throw new Error('Record not found');
      productStore[index] = { ...productStore[index], ...params.data };
      return { data: productStore[index] };
    },
    updateMany: notImplemented,
  };
}

const ProductList = () => (
  <List perPage={10} sort={{ field: 'name', order: 'ASC' }}>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="supplier" />
      <TextField source="category" />
      <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
      <TextField source="sku" />
      <TextField source="status" />
      <TextField source="storefrontStatus" />
    </Datagrid>
  </List>
);

const ProductEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" fullWidth />
      <TextInput source="supplier" />
      <TextInput source="category" />
      <NumberInput source="price" />
      <TextInput source="sku" />
      <SelectInput
        source="status"
        choices={[
          { id: 'active', name: 'active' },
          { id: 'proposal', name: 'proposal' },
          { id: 'non-public', name: 'non-public' },
        ]}
      />
      <SelectInput
        source="storefrontStatus"
        choices={[
          { id: 'published', name: 'published' },
          { id: 'unpublished', name: 'unpublished' },
        ]}
      />
    </SimpleForm>
  </Edit>
);

export function ReactAdminView() {
  const dataProvider = useMemo(() => buildDataProvider(), []);

  return (
    <div style={{ height: '100vh' }}>
      <AdminContext dataProvider={dataProvider}>
        <AdminUI>
          <Resource name="products" list={ProductList} edit={ProductEdit} />
        </AdminUI>
      </AdminContext>
    </div>
  );
}
