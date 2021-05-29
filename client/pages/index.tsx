/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
// UVESCU, NEKE TYPE-OVE KOJI SE TICU getServerSideProps-A
import { GetServerSideProps } from "next";
import Link from "next/link";

interface PropsI {
  placeholder: boolean;
}

const IndexPage: FunctionComponent<PropsI> = (props) => {
  //

  // console.log(props);

  return (
    <div>
      <div>
        <Link href="/microticket">
          <a>microticket</a>
        </Link>
      </div>
      <div>
        <Link href="/premium">
          <a>premium</a>
        </Link>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      placeholder: true,
    },
  };
};

export default IndexPage;
