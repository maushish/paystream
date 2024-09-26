import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS, } from "@solana/actions";
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
export async function GET(request: Request) {
  const response : ActionGetResponse = {
    icon: "https://raw.githubusercontent.com/maushish/paystream/main/web/public/paystream.png",
    description: "An on-chain streams based blink that provides user and client a secure and trustless way to pay for services **PayStream** is a work in progress and is not yet ready for production use.",
    label: "pay via streams",
    links: {
      actions: [
        {
          label:"Sender's address",
          href:"request.url",
        },
        {
          label:"Receiver's address",
          href:"request.url",
        },
        {
          label:"Amount",
          href:"request.url",
          parameters:[
            {
              name:"amount",
              label:"Amount for stream",
              required:true,
            }
          ]
        },
      ]
    },
    title: "PayStream",
    error: {
     message: "this blink is work in progress!!"
    },
  }

  const headers = {
    ...ACTIONS_CORS_HEADERS,   // CORS headers from ACTIONS_CORS_HEADERS
    "X-Action-Version": "1.0", // Custom header for action version
    "X-Blockchain-Ids": "solana", // Custom header for blockchain IDs
  };
  return new Response(JSON.stringify(response), {
    headers: headers,
  });}

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
  



  const headers = {
    ...ACTIONS_CORS_HEADERS,   
    "X-Action-Version": "1.0", 
    "X-Blockchain-Ids": "solana",
  };
  return new Response(JSON.stringify(responseBody), {
    headers: headers,
  });}
  // export interface ActionPostResponse< extends ActionType = ActionType> {
  //   /** base64 encoded serialized transaction */
  //   transaction: string;
  //   /** describes the nature of the transaction */
  //   message?: string;
  //   links?: {
  //     /**
  //      * The next action in a successive chain of actions to be obtained after
  //      * the previous was successful.
  //      */
  //     next: NextActionLink;
  //   };
  // }
  
  // export type NextActionLink = PostNextActionLink | InlineNextActionLink;
  
  // /** @see {NextActionPostRequest} */
  // export interface PostNextActionLink {
  //   /** Indicates the type of the link. */
  //   type: "post";
  //   /** Relative or same origin URL to which the POST request should be made. */
  //   href: string;
  // }
  
  // /**
  //  * Represents an inline next action embedded within the current context.
  //  */
  // export interface InlineNextActionLink {
  //   /** Indicates the type of the link. */
  //   type: "inline";
  //   /** The next action to be performed */
  //   action: NextAction;
  // }

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS, });
}