import { GetServerSidePropsContext, NextPageContext } from "next";
import { buildApiClient } from "./buildApiClient";

export const getCurrentUser = async (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {

  // console.log({headers: ctx.req.headers})

  const client = buildApiClient(ctx);

  console.log({ctx})
  console.log(client.getUri)

  try {
    const response = await client.get("/api/users/current-user");

    return { currentUser: response.data.currentUser };
  } catch (err) {
    console.error({err});

    return { currentUser: null };
  }
};
