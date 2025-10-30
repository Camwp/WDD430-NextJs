// app/dashboard/invoices/[id]/edit/page.tsx
import { Suspense } from 'react';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import Form from '@/app/ui/invoices/edit-form';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default function Page({
    params,
}: {
    // if your Next version sometimes gives a Promise here, keep it as Promise
    params: Promise<{ id: string }>;
}) {
    return (
        <main>
            {/* You can render static chrome outside Suspense if it doesn't block */}
            <Suspense fallback={<div className="h-10 w-40 rounded bg-gray-100" />}>
                <HeaderCrumbs paramsPromise={params} />
            </Suspense>

            <Suspense fallback={<div className="mt-6 rounded-lg border p-6">Loading…</div>}>
                <EditSection paramsPromise={params} />
            </Suspense>
        </main>
    );
}

async function HeaderCrumbs({
    paramsPromise,
}: {
    paramsPromise: Promise<{ id: string }>;
}) {
    const { id } = await paramsPromise;
    return (
        <Breadcrumbs
            breadcrumbs={[
                { label: 'Invoices', href: '/dashboard/invoices' },
                { label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true },
            ]}
        />
    );
}

async function EditSection({
    paramsPromise,
}: {
    paramsPromise: Promise<{ id: string }>;
}) {
    // ✅ All awaits happen inside Suspense
    const { id } = await paramsPromise;

    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);

    if (!invoice) notFound();

    return <Form invoice={invoice} customers={customers} />;
}
