import {
  ActionPostResponse,
  createActionHeaders,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { 
  Connection, 
  clusterApiUrl, 
  PublicKey, 
  Transaction,
  SystemProgram, 
} from "@solana/web3.js";
import { Program, AnchorProvider, type AnchorError } from "@coral-xyz/anchor";
import { PaystreamMvp, IDL } from "../../../data/idl"; // Import the correct types
import BN from "bn.js"; 

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
      title: "PaystreamV0",
      icon: "https://gcdnb.pbrd.co/images/eIQVKCT500av.png?o=1",
      description: "An on-chain streams based blink that provides user and client a secure and trustless way to pay for services.",
      label: "Paystream Mvp",
      links: {
          actions: [
              {
                  href: `/api/actions/stream`,
                  label: 'Create Payment Stream',
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
              },
          ],
      },
  };

  const headers = createActionHeaders({
      chainId: "devnet",
      actionVersion: "2.2.1",
  });

  return Response.json(payload, {
      headers: headers,
  });
}

export const OPTIONS = GET;

export async function POST(request: Request) {
  try {
      const postRequest: ActionPostRequest = await request.json();

      const userPublicKey = postRequest.account;
      const { duration, amount, receiverAddress } = (postRequest.data as { duration?: number; amount?: number; receiverAddress?: string }) || {};

      console.log("User Public Key:", userPublicKey);
      console.log("Duration:", duration);
      console.log("Amount:", amount);
      console.log("Receiver Address:", receiverAddress);

      if (!duration || !amount || !receiverAddress) {
          return Response.json({ error: "Missing required parameters" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
      }

      const connection = new Connection(clusterApiUrl("devnet"), "finalized");
      
      // Create wallet object
      const wallet = {
          publicKey: new PublicKey(userPublicKey),
          signTransaction: async () => { throw new Error("Signing not available"); },
          signAllTransactions: async () => { throw new Error("Signing not available"); },
      };

      // Create provider
      const provider = new AnchorProvider(connection, wallet, {
          commitment: "finalized",
          preflightCommitment: "finalized",
      });

      const programId = new PublicKey("GHsd2cgzpaoyFQ9hoQkhcXmAegbLaVh2zLFCjBFdotNn");
      const program = new Program<PaystreamMvp>(
          IDL,
          programId,
          provider // Ensure 'provider' is correctly defined as an AnchorProvider
      );

      const tx = new Transaction();
      tx.feePayer = new PublicKey(userPublicKey);
      tx.recentBlockhash = (await connection.getLatestBlockhash({commitment: "finalized"})).blockhash;

      const [streamAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("stream"), new PublicKey(userPublicKey).toBuffer()],
          program.programId
      );
      const initializeInstruction= await program.methods.initialize().accounts({
        streamAccount: streamAccountPDA,
        authority: userPublicKey,
        systemProgram: SystemProgram.programId,
      }).instruction();
      console.log("Initialize Instruction:", initializeInstruction);
      // Create the instruction using the program's methods
      const createStreamInstruction = await program.methods
          .createStream(
              new PublicKey(receiverAddress), // Changed order: receiverAddress first
              new BN(duration), 
              new BN(amount)
          )
          .accounts({
              streamAccount: streamAccountPDA,
              authority: userPublicKey,
              systemProgram: SystemProgram.programId,
          })
          .instruction();
          
      tx.add(initializeInstruction, createStreamInstruction);

      const serialTX = tx.serialize({requireAllSignatures: false, verifySignatures: false}).toString("base64");

      const responseBody: ActionPostResponse = {
          transaction: serialTX,
          message: `Payment stream created: ${amount} SOL to ${receiverAddress} for ${duration} seconds`,
          type: "transaction",
      };

      return Response.json(responseBody, {
          headers: createActionHeaders({ chainId: "devnet", actionVersion: "2.2.1" }),
      });
  } catch (error) {
      console.error("Error in POST handler:", error);
      if ((error as AnchorError).program) {
          // Handle Anchor program errors
          return Response.json({ 
              error: `Program error: ${(error as AnchorError).error.errorMessage}` 
          }, { status: 400 });
      }
      return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
