import React, { FC } from "react";

const ErrorMessages: FC<{
  errors: { message: string; field?: string }[];
}> = ({ errors }) => {
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

export default ErrorMessages;
