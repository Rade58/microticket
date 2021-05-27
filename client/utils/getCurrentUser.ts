import { GetServerSidePropsContext, NextPageContext } from "next";
import { buildApiClient } from "./buildApiClient";

export const getCurrentUser = async (
  ctx?: GetServerSidePropsContext | NextPageContext
) => {
  console.log({ctx})

  const client = buildApiClient(ctx);

  try {
    const response = await client.get("/api/users/current-user");

    return { currentUser: response.data.currentUser };
  } catch (err) {
    console.error({err});

    return { currentUser: null };
  }
};
