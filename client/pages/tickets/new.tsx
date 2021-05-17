/* eslint react/react-in-jsx-scope: 0 */
/* eslint jsx-a11y/anchor-is-valid: 1 */
// TREBA NAM useState I useCallback
import { FunctionComponent, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { InitialPropsI } from "../../types/initial-props";
import { TicketDataI } from "../../types/data/ticket-data";
import useRequest from "../../hooks/useRequestHook";

interface PropsI extends InitialPropsI {
  foo: false;
}

const CreateNewTicketPage: FunctionComponent<PropsI> = (props) => {
  // const { currentUser } = props;

  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("0.00");

  // NE TREBAM NISTA POSEBNO RADITI, JER SAM DEFINISAO
  // DA SE REDIRECTING MOZE DESITI KADA PROVIDE-UJEM
  // REDIRECT PATH, ODNOSNO URL
  const {
    makeRequest: makeRequestToCreateTicket,
    // data,
    ErrorMessagesComponent,
    errors,
  } = useRequest<{ title: string; price: number }, TicketDataI>(
    "/api/tickets",
    {
      method: "post",
      // EVO OVDE PODESAVAM TAJ URL
      redirectSuccessUrl: "/",
    }
  );

  const sanitizePriceOnBlur = useCallback(() => {
    const priceValue = parseFloat(price);
    const fixedDecimals = priceValue.toFixed(2);

    if (!isNaN(priceValue)) {
      setPrice(fixedDecimals);
      return;
    }

    setPrice("0.00");
    return;
  }, [price]);

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const priceNumber = parseFloat(price);

          makeRequestToCreateTicket({
            price: priceNumber,
            title,
          })
            // OVDE MOGU RESETOVATI
            .then(() => {
              setPrice("0.00");
              setTitle("");
            });
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
            onBlur={sanitizePriceOnBlur}
            value={price}
            className="form-control"
            type="text"
            id="price-input"
          />
        </div>
        <ErrorMessagesComponent errors={errors} />
        <button className="btn btn-primary" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

// (OD RANIJE)
// OVO MI MOZDA NECE NI TREBATI ALI NEMA VEZE ,UKLONICU GA NA KRAJU
export const getServerSideProps: GetServerSideProps<PropsI> = async (ctx) => {
  return {
    props: {
      foo: false,
    },
  };
};

export default CreateNewTicketPage;
