// app/dashboard/invoices/create/page.tsx
import { Suspense } from 'react';
import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';

export default function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    { label: 'Create Invoice', href: '/dashboard/invoices/create', active: true },
                ]}
            />

            <Suspense fallback={null}>
                <Editor />
            </Suspense>
        </main>
    );
}

// Keep the uncached reads inside Suspense
async function Editor() {
    const customers = await fetchCustomers(); // can be no-store here
    return <Form customers={customers} />;
}
