import * as payosModule from "@payos/node";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PayOS = (payosModule as any).PayOS ?? payosModule;

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export default payos;
