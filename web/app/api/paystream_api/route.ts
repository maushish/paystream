import { ActionGetResponse, ActionPostRequest, ActionPostResponse, ACTIONS_CORS_HEADERS } from "@solana/actions";

export async function GET(request: Request) {
  const response : ActionGetResponse = {
    icon: "https://ibb.co/CQKm1Pp",
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
    transaction: "",
    message: "work in progress,"+userPublicKey,
  };
  return Response.json(response , {headers: ACTIONS_CORS_HEADERS});
}
