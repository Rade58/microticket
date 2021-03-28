import { Router } from "express";

const router = Router();

router.post("/api/users/signup", (req, res) => {
  const { email, password } = req.body;
});

export { router as signUpRouter };
