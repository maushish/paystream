import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from "@solana/actions";
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
export async function GET(request: Request) {
  const response : ActionGetResponse = {
    icon: "https://raw.githubusercontent.com/maushish/paystream/main/web/public/paystream.png",
    description: "trustless-escrow",
    label: "pay via streams",
    title: "PayStream",
    error: {
     message: "this blink is work in progress!!"
    },
  }
    return Response.json(response , {headers: ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
  const postRequest: ActionPostRequest = await request.json();
  const userPublicKey = postRequest.account;
  console.log(userPublicKey);
  const response : ActionPostResponse = {
    transaction: "serialTX",
    message: "work in progress,"+userPublicKey,
  };
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = new Transaction();
  tx.feePayer = new PublicKey(userPublicKey);
  tx.recentBlockhash = (await connection.getLatestBlockhash({commitment: "finalized"})).blockhash;
  const serialTX = tx.serialize({requireAllSignatures:false, verifySignatures:false,}).toString("base64");


  return Response.json(response , {headers: ACTIONS_CORS_HEADERS});
}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}