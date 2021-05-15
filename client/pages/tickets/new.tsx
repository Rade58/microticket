/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM useState I useCallback
import { FunctionComponent, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
//
import { buildApiClient } from "../../utils/buildApiClient";
//

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  // ZA KREIRANJE TICKETA TI NE TREBA I userId
  const { currentUser } = props;
  // ZATO STO JE CURRENT USER DEO COOKIE-A

  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  console.log(typeof price, price);

  const createTicket = useCallback(async () => {
    const client = buildApiClient();

    try {
      const response = await client.post("/tickets/new", {
        title,
        price,
      });

      console.log(response.data);

      return response.data;
    } catch (err) {
      console.error(err);

      return err;
    }
  }, [title, price]);

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log(price);
          // createTicket();
        }}
      >
        <div className="form-group">
          <label htmlFor="title-input">Title</label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="form-control"
            id="title-input"
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price-input">Price</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => setPrice("69")}
            value={price}
            className="form-control"
            type="number"
            id="price-input"
          />
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
