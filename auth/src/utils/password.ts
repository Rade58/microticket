import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scriptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scriptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  // EVO DEFINISEM I POMENUTU LOGIKU
  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");

    // SADA POONOVO PRAVIS HASH OD PASSWORD-A KOJI SALJE CLIENT
    // KAKO BI GA COMPARE-OVAO

    const buf = (await scriptAsync(suppliedPassword, salt, 64)) as Buffer;

    const hexedPass = buf.toString("hex");

    return hashedPassword === hexedPass;
  }
}
