'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import postgres from 'postgres';



export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}


const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});


// UPDATE INVOICE //
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, formData: FormData): Promise<void> {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        console.error(error);
        // Throw (keeps return type Promise<void>), don't return an object
        throw new Error('Database Error: Failed to update Invoice.');
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


// DELETE INVOICE //
export async function deleteInvoice(id: string): Promise<void> {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch (error) {
        console.error(error);
        // Throw, don't return an object — keeps type as Promise<void>
        throw new Error('Database Error: Failed to delete invoice.');
    }
    revalidatePath('/dashboard/invoices');
}


// CREATE INVOICE //
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(
    _prevState: State,
    formData: FormData
): Promise<State> {
    const validated = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validated.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (err) {
        console.error(err);
        return { message: 'Database Error: Failed to Create Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    // redirect throws (type `never`), so we don't need to return a State here
    redirect('/dashboard/invoices');
}