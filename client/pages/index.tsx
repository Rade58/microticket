/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent, useEffect } from "react";
import { GetServerSideProps } from "next";
// OVO CE MI TREBATI JER CU DATA UZETI SERVER SIDE
import { buildApiClient } from "../utils/buildApiClient";
//
import { InitialPropsI } from "../types/initial-props";
// UVESCU I TYPE, KOJI SAM MALOCAS NAPRAVIO
import { allTicketsType } from "../types/data/all-tickets";

// SADA MOGU TYPE-OVATI DA CU ALL TICKETS PROSLEDITI KAO PROP
interface PropsI extends InitialPropsI {
  tickets: allTicketsType;
}

// ---------------------------------------------------
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  // BUILD-UJEMO CLIENT-A
  const client = buildApiClient(ctx);

  try {
    const { data } = await client.get("/api/tickets");

    return {
      props: {
        tickets: data as allTicketsType,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        tickets: [],
      },
    };
  }
};
// ---------------------------------------------------

const IndexPage: FunctionComponent<PropsI> = (props) => {
  // SADA BI MEDJU PROPSIMA TREBAL IDA SE NADJU ALL TICKETS

  return <pre>{JSON.stringify({ tickets: props.tickets }, null, 2)}</pre>;
};

export default IndexPage;
