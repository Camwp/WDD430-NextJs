// app/dashboard/invoices/[id]/edit/page.tsx
import { Suspense } from 'react';
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    { label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true },
                ]}
            />

            <Suspense fallback={null}>
                <Editor id={id} />
            </Suspense>
        </main>
    );
}

// Async child kept in the SAME FILE, runs inside Suspense
async function Editor({ id }: { id: string }) {
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),   // OK to be uncached here
        fetchCustomers(),
    ]);

    return <Form invoice={invoice} customers={customers} />;
}
