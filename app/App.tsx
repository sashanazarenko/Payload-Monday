import { RouterProvider } from 'react-router';
import { FilterProvider } from './context/FilterContext';
import { RoleProvider } from './context/RoleContext';
import { StorefrontProvider } from './context/StorefrontContext';
import { DecoratorReviewProvider } from './context/DecoratorReviewContext';
import { router } from './routes';

export default function App() {
  return (
    <RoleProvider>
      <DecoratorReviewProvider>
        <StorefrontProvider>
          <FilterProvider>
            <RouterProvider router={router} />
          </FilterProvider>
        </StorefrontProvider>
      </DecoratorReviewProvider>
    </RoleProvider>
  );
}