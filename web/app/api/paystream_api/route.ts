import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS,BLOCKCHAIN_IDS } from "@solana/actions";
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {Response} from "node-fetch";
export async function GET(request: Request) {
  const response : ActionGetResponse = {
    icon: "https://raw.githubusercontent.com/maushish/paystream/main/web/public/paystream.png",
    description: "An on-chain streams based blink that provides user and client a secure and trustless way to pay for services **PayStream** is a work in progress and is not yet ready for production use.",
    label: "pay via streams",
    title: "PayStream",
    error: {
     message: "this blink is work in progress!!"
    },
  }
    return Response.json(response ,   {headers: {...ACTIONS_CORS_HEADERS, "X-Action-Version": "1.0", "X-Blockchain-Ids": "solana"}});
}

export async function POST(request: Request) {
  const postRequest: ActionPostRequest = await request.json();
  const userPublicKey = postRequest.account;
  console.log(userPublicKey);

  const connection = new Connection(clusterApiUrl("devnet"), "finalized");
  const tx = new Transaction();
  tx.feePayer = new PublicKey(userPublicKey);
  tx.recentBlockhash = (await connection.getLatestBlockhash({commitment: "finalized"})).blockhash;
  const serialTX = tx.serialize({requireAllSignatures:false, verifySignatures:false,}).toString("base64");
  const responseBody : ActionPostResponse = {
    transaction: serialTX,
    message: "work in progress,"+userPublicKey,
  };



  return Response.json(responseBody , {headers: ACTIONS_CORS_HEADERS});
}


export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS, });
}