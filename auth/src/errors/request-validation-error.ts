import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super();
    this.errors = errors;

    // NE ZNAM DA LI JE OVO SUVISNO ILI NE, ALI AUTOR WORKSHOP-A
    //  JE OVO STAVIO

    // ZADAO JE DA PROTOTIP OVE KLASE KOJU BUILD-UJEM UPRAVO Error
    // NE ZNAM ZASTO JE OVO MORALO, ALI ON KAZE DA JE TO
    // SAMO ZATO STO SE extend-uje BUILT IN CLASS
    Object.setPrototypeOf(this, RequestValidationError.prototype);
    // NIJE MI JASNO OVO GORE JER JA VIDIM CIRCULAR REFERENCE
    // MEDJUTIM AUTOR WORKSHOPA JE REKAO DA JE TO SAM OZATO STO
    // EXTEND-UJEM BUILT IN CLASS
  }
}
