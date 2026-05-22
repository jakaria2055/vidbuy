import { Router } from "express";


const checkoutRouter = Router();

checkoutRouter.post("/", createCheckout)


export default checkoutRouter;
