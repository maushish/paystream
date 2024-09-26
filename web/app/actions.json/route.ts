import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      
      {
        "pathPattern": "/**",
        "apiPath": "/api/paystream_api"
      },
     

    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
 
export const OPTIONS = GET;