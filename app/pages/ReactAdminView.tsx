import { useMemo } from 'react';
import {
  AdminContext,
  AdminUI,
  AppBar,
  DataProvider,
  Layout,
  Edit,
  List,
  Menu,
  NumberField,
  NumberInput,
  Resource,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  Datagrid,
  SearchInput,
  TopToolbar,
  FilterButton,
  CreateButton,
  ExportButton,
  TitlePortal,
} from 'react-admin';
import { createTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
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

const raTheme = createTheme({
  palette: {
    primary: { main: '#1F5C9E' },
    secondary: { main: '#B8D4EE' },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#555555',
    },
    divider: '#DCDFE6',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #DCDFE6',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F2F2F2',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

const listFilters = [
  <SearchInput key="q" source="q" alwaysOn placeholder="Search by name, SKU, supplier..." />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
    <CreateButton />
  </TopToolbar>
);

const BrandAppBar = () => (
  <AppBar
    sx={{
      '& .RaAppBar-toolbar': {
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #DCDFE6',
        color: '#1A1A1A',
      },
    }}
  >
    <TitlePortal />
    <Typography variant="subtitle1" fontWeight={700} color="#1F5C9E">
      Jolly Catalogue Admin
    </Typography>
  </AppBar>
);

const BrandMenu = () => (
  <Menu
    sx={{
      '& .RaMenu-open': { backgroundColor: '#EBF3FB' },
      '& .RaMenuItemLink-active': {
        borderRight: '3px solid #1F5C9E',
      },
    }}
  >
    <Menu.DashboardItem />
    <Menu.ResourceItem name="products" />
  </Menu>
);

const BrandLayout = (props: any) => (
  <Layout
    {...props}
    appBar={BrandAppBar}
    menu={BrandMenu}
    sx={{
      '& .RaLayout-contentWithSidebar': { backgroundColor: '#F5F7FA' },
      '& .RaLayout-sidebar': {
        width: 240,
        '& .RaSidebar-fixed': {
          width: 240,
          borderRight: '1px solid #DCDFE6',
          backgroundColor: '#FFFFFF',
        },
      },
    }}
  />
);

const ProductList = () => (
  <List
    title="Product Catalogue"
    perPage={10}
    sort={{ field: 'name', order: 'ASC' }}
    filters={listFilters}
    actions={<ListActions />}
  >
    <Datagrid
      rowClick="edit"
      bulkActionButtons={false}
      sx={{
        '& .column-name': { fontWeight: 600 },
      }}
    >
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
  <Edit title="Edit Product">
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
    <Box sx={{ height: '100vh' }}>
      <AdminContext dataProvider={dataProvider}>
        <AdminUI theme={raTheme} layout={BrandLayout}>
          <Resource name="products" list={ProductList} edit={ProductEdit} />
        </AdminUI>
      </AdminContext>
    </Box>
  );
}
