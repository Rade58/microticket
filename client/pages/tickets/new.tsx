/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
import { FunctionComponent } from "react";
import { GetServerSideProps } from "next";
// UVOZIM ONAJ INTERFACE KOJI DESCRIBE-UJE INITIAL PROPS
import { InitialPropsI } from "../../types/initial-props";
//

interface PropsI extends InitialPropsI {
  foo: false;
}

// OVO MI MOZDA NECE NI TREBATI ALI NEMA VEZE
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: false,
    },
  };
};

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  //

  console.log(props);

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form>
        <div className="form-group">
          <label htmlFor="title-input">Title</label>
          <input id="title-input" type="text" />
        </div>
        <div className="form-group">
          <label htmlFor="price-input">Price</label>
          <input type="number" id="price-input" />
        </div>
        <button className="btn btn-primary" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateNewTicketPage;
