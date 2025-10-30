import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';

export default function Page({
    searchParams,
}: {
    searchParams?: Promise<{ query?: string; page?: string }>;
}) {
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search invoices..." />
                <CreateInvoice />
            </div>

            {/* Suspense for table + pagination data */}
            <Suspense fallback={<InvoicesTableSkeleton />}>
                <InvoicesSection searchParamsPromise={searchParams} />
            </Suspense>
        </div>
    );
}

async function InvoicesSection({
    searchParamsPromise,
}: {
    searchParamsPromise?: Promise<{ query?: string; page?: string }>;
}) {
    const sp = (await searchParamsPromise) ?? {};
    const query = sp.query ?? '';
    const currentPage = Number(sp.page ?? '1') || 1;

    // ✅ Fetch total pages safely here
    const totalPages = await fetchInvoicesPages(query);

    return (
        <>
            <Table query={query} currentPage={currentPage} />
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </>
    );
}
