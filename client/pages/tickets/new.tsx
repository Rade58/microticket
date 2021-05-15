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
  // const { currentUser } = props;

  const [title, setTitle] = useState<string>("");
  // DEFAULT MOZE BITI 0.00
  const [price, setPrice] = useState<string>("0.00");

  // NAPRAVICU FUNKCIJU KOJA CE SANITIZE-OVATI PRICE
  // I SAMO CU JE KORISTITI ON BLUR
  const sanitizePriceOnBlur = useCallback(() => {
    const priceValue = parseFloat(price);

    // TO FIXED DVE DECIMALE JE JER JE TO FORMAT NOVCA
    const fixedDecimals = priceValue.toFixed(2);

    if (!isNaN(priceValue)) {
      setPrice(fixedDecimals);
      return;
    }
    // AKO VREDNOST JESTE NaN ZADAJEM DA BUDE 0.00
    setPrice("0.00");
    return;
  }, [price]);

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
            // EVO DODAJEM JE OVDE
            onBlur={sanitizePriceOnBlur}
            //
            value={price}
            className="form-control"
            // NAMERNO SAM STAVIO DA JE TEXT, DA BI SE
            // PRIKAZIVALO .00 ON BLUR
            type="text"
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
