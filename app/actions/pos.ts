// app/actions/pos.ts
'use server';

import { checkoutAction as runCheckout } from './checkout';
import { CheckoutPayload, CheckoutResponse } from '@/types/database';

export async function checkoutAction(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return runCheckout(payload);
}
