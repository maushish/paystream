import { 
  ActionGetResponse, 
  ActionPostRequest, 
  ActionPostResponse, 
  ACTIONS_CORS_HEADERS, 
  createPostResponse 
} from "@solana/actions";
import { 
  clusterApiUrl,
  Connection, 
  PublicKey, 
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";

export const GET = async (request: Request) => {
  const actionMetdata: ActionGetResponse = {
    title: "PaystreamV0",
    icon: "https://gcdnb.pbrd.co/images/eIQVKCT500av.png?o=1",
    description: "An on-chain streams based blink that provides user and client a secure and trustless way to pay for services.",
    label: "Create Stream",
    links: {
      actions: [
        {
          href: "/api/actions/stream",
          label: "Create Payment Stream",
          type: "post",
          parameters: [
            {
              name: 'duration',
              label: 'Stream Duration (in seconds)',
              required: true,
            },
            {
              name: 'amount',
              label: 'Amount in SOL',
              required: true,
            },
            {
              name: 'receiverAddress',
              label: 'Receiver Solana Address',
              required: true,
            },
          ],
        }
      ]
    }
  };
  const headers = {
    ...ACTIONS_CORS_HEADERS,   // CORS headers from ACTIONS_CORS_HEADERS
    "X-Action-Version": "1.0", // Custom header for action version
    "X-Blockchain-Ids": "solana", // Custom header for blockchain IDs
  };
  return new Response(JSON.stringify(actionMetdata), {
    headers: headers,
  });};

export const OPTIONS = GET;

export async function POST(request: Request) {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const body: ActionPostRequest = await request.json();
    
    if (!body.account) {
      return Response.json(
        { error: "Account is required" }, 
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const userPublicKey = new PublicKey(body.account);
    const { amount, receiverAddress, duration } = (body.data as { 
      amount?: number; 
      receiverAddress?: string;
      duration?: number;
    }) || {};

    if (!amount || !receiverAddress || !duration) {
      return Response.json(
        { error: "Missing amount, receiver address, or duration" }, 
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const programId = new PublicKey("GHsd2cgzpaoyFQ9hoQkhcXmAegbLaVh2zLFCjBFdotNn");

    const data = Buffer.alloc(24); // 8 bytes for amount + 8 bytes for duration + 8 bytes for receiver
    data.writeBigUInt64LE(BigInt(amount * 1e9), 0); // Convert SOL to lamports
    data.writeBigUInt64LE(BigInt(duration), 8);
    Buffer.from(receiverAddress).copy(data, 16);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: programId, isSigner: false, isWritable: true }, // Program gets the SOL
      ],
      programId,
      data
    });

    const blockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = userPublicKey;
    transaction.lastValidBlockHeight = blockhash.lastValidBlockHeight;

    transaction.add(instruction);

    // Generate a random stream ID
    const streamId = Math.floor(Math.random() * 1000000);

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    }).toString('base64');

    const response: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Stream created successfully! Stream ID: " + streamId,
        type: "transaction", // Add the required type property
      },
    });
    return new Response(JSON.stringify(response), { headers: ACTIONS_CORS_HEADERS });
    
  } catch (error: unknown) {
    console.error("Error in POST handler:", error);
    return Response.json(
      { 
        error: "Internal server error",
        details: (error as Error).message // Type assertion to Error
      }, 
      { 
        status: 500, 
        headers: ACTIONS_CORS_HEADERS 
      }
    );
  }
}
