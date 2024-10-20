import {
    ActionPostResponse,
    createActionHeaders,
    ActionGetResponse,
    ActionPostRequest,
  } from "@solana/actions";
  import { 
    Connection, 
    clusterApiUrl, 
    PublicKey, 
    Transaction 
  } from "@solana/web3.js";
//   import {IDL } from "@/data/idl";
  
  export const GET = async (req: Request) => {
    const payload: ActionGetResponse = {
      title: "PaystreamV0",
      icon: "https://gcdnb.pbrd.co/images/eIQVKCT500av.png?o=1",
      description: "An on-chain streams based blink that provides user and client a secure and trustless way to pay for services.",
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
      const duration = postRequest.params?.duration;
      const amount = postRequest.params?.amount;
      const receiverAddress = postRequest.params?.receiverAddress;
  
      console.log("User Public Key:", userPublicKey);
      console.log("Duration:", duration);
      console.log("Amount:", amount);
      console.log("Receiver Address:", receiverAddress);
  
      // Validate inputs
      if (!duration || !amount || !receiverAddress) {
        return Response.json({ error: "Missing required parameters" }, { status: 400 });
      }
  
      const connection = new Connection(clusterApiUrl("devnet"), "finalized");
      const tx = new Transaction();
      tx.feePayer = new PublicKey(userPublicKey);
      tx.recentBlockhash = (await connection.getLatestBlockhash({commitment: "finalized"})).blockhash;
  
      // tx.add(createStreamInstruction(new PublicKey(userPublicKey), new PublicKey(receiverAddress), amount, duration));
  
      const serialTX = tx.serialize({requireAllSignatures:false, verifySignatures:false}).toString("base64");
  
      const responseBody: ActionPostResponse = {
        transaction: serialTX,
        message: `Payment stream created: ${amount} SOL to ${receiverAddress} for ${duration} seconds`,
      };
  
      if (postRequest.account) {
        responseBody.links = {
          next: {
            type: "inline",
            action: {
              type: "action",
              label: "Choose your next action:",
              icon: "https://raw.githubusercontent.com/maushish/paystream/main/web/public/paystream.png",
              title: "Next Actions",
              description: "Select an action to proceed.",
              links: {
                actions: [
                  {
                    label: "Check stream status",
                    href: `${request.url}/checkStatus`,
                    type: "POST",
                  },
                  {
                    label: "Cancel stream",
                    href: `${request.url}/cancelStream`,
                    type: "POST",
                  },
                  {
                    label: "Complete action",
                    href: `${request.url}/complete`,
                    type: "POST",
                  },
                ],
              },
            },
          },
        };
      }
  
      return Response.json(responseBody, {
        headers: createActionHeaders({ chainId: "devnet", actionVersion: "2.2.1" }),
      });
    } catch (error) {
      console.error("Error in POST handler:", error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }