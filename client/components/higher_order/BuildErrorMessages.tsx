import React, { FC } from "react";

// OVO CE BITI HIGHER ORDER COMPONENT

const BuildErrorMessages = (errors: { message: string; field?: string }[]) => {
  // OVA FUNKCIJA RETURN-UJE KOMPONENTU
  // OVO SAM URADIO ZATO STO NE ZELIM DA KOMPONENTA KORISTI
  // ERRORS IZ PROPS-A VEC, DA TAKORECI ONI BUDU HARDCODED
  const ErrorMessages: FC = () => {
    return (
      errors.length > 0 && (
        <div className="alert alert-danger">
          <h4>Oooops...</h4>
          <ul className="my-0">
            {errors.map(({ message, field }) => {
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )
    );
  };

  return ErrorMessages;
};

export default BuildErrorMessages;
