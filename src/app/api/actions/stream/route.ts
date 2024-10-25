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
  import { Program, Idl } from "@coral-xyz/anchor";
  import { IDL, PaystreamMvp as ImportedPaystreamMvp } from "../../../data/idl"; 
  import BN from "bn.js"; 
  
  interface PaystreamMvp extends Idl {
    version: "0.1.0"; 
    name: "paystreamMvp";    
  }

  export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
      title: "PaystreamV0",
      icon: "https://gcdnb.pbrd.co/images/eIQVKCT500av.png?o=1  ",
      description: "An on-chain streams based blink that provides user and client a secure and trustless way to pay for services.",
      label: "Paystream Mvp", // {{ edit_1 }} Added label property
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
      const { duration, amount, receiverAddress } = (postRequest.params as { duration?: number; amount?: number; receiverAddress?: string }) || {}; // Type assertion for params
  
      console.log("User Public Key:", userPublicKey);
      console.log("Duration:", duration);
      console.log("Amount:", amount);
      console.log("Receiver Address:", receiverAddress);
  
      // Validate inputs
      if (!duration || !amount || !receiverAddress) {
        return Response.json({ error: "Missing required parameters" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
      }
  
      const connection = new Connection(clusterApiUrl("devnet"), "finalized");
      const program: Program<PaystreamMvp> = new Program<PaystreamMvp>(IDL as unknown as PaystreamMvp, { connection }); // Ensure IDL is correctly typed
      const tx = new Transaction();
      tx.feePayer = new PublicKey(userPublicKey);
      tx.recentBlockhash = (await connection.getLatestBlockhash({commitment: "finalized"})).blockhash;
  
  
      const serialTX = tx.serialize({requireAllSignatures:false, verifySignatures:false}).toString("base64");
  
      const responseBody: ActionPostResponse = {
        transaction: serialTX,
        message: `Payment stream created: ${amount} SOL to ${receiverAddress} for ${duration} seconds`,
        type: "transaction", // Add the required 'type' property
      };
  
      const [streamAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stream"), new PublicKey(postRequest.account).toBuffer()], // Convert to PublicKey
        program.programId
      );
      
      // Use streamAccountPDA in the createStreamInstruction
      const createStreamInstruction = await program.methods.createStream(new BN(duration), new BN(amount), new PublicKey(receiverAddress)).accounts({
        streamAccount: streamAccountPDA, // Use the declared variable here
        authority: postRequest.account,
        systemProgram: SystemProgram.programId,
      }).instruction();
  
      return Response.json(responseBody, {
        headers: createActionHeaders({ chainId: "devnet", actionVersion: "2.2.1" }),
      });
    } catch (error) {
      console.error("Error in POST handler:", error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }
