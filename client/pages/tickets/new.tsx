/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM use
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  return (
    <div>
      <h1>Create A Ticket</h1>
      <form>
        <div className="form-group">
          <label htmlFor="title-input">Title</label>
          <input className="form-control" id="title-input" type="text" />
        </div>
        <div className="form-group">
          <label htmlFor="price-input">Price</label>
          <input className="form-control" type="number" id="price-input" />
        </div>
        <button className="btn btn-primary" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

// OVO MI MOZDA NECE NI TREBATI ALI NEMA VEZE ,UKLONICU GA NA KRAJU
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: false,
    },
  };
};

export default CreateNewTicketPage;
