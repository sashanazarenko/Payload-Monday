import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('../app/App'), { ssr: false });

export default function SalesCatchAllPage() {
  return <ClientApp />;
}
