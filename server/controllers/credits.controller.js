import Stripe from "stripe"
import dotenv from "dotenv"
import UserModel from "../models/user.model.js";
dotenv.config()


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key missing in .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const credit_map = {
    100 : 50,
    200 : 120,
    500 : 300
}

export const createCreditsOrder = async ( req, res ) => {

    try {
        
        const userID = req.userID
        const {amount} = req.body

        if(!credit_map[amount]){
            return res.status(400).json({
                success : false,
                message : "Invalid credit plan"
            })
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            success_url: `${process.env.CLIENT_URL}/payment-success`,
            cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
            line_items: [
                {
                price_data: {
                    currency: "inr",
                    product_data: {
                    name: `${credit_map[amount]} Credits`,
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1,
                },
            ],
            metadata: {
                userID,
                credits: credit_map[amount],
            },
        })

    res.status(200).json({ url: session.url });

    
    } catch (error) {
         res.status(500).json({ message: "Stripe error" });
    }

        
} 


export const stripeWebhook = async (req,res) => {
    const sig = req.headers["stripe-signature"]
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )   
    } catch (error) {
         console.log("❌ Webhook signature error:", error.message);
    return res.status(400).send("Webhook Error");
    }

  if(event.type === "checkout.session.completed"){
    const session = event.data.object;

    const userId = session.metadata.userId;
    const creditsToAdd = Number(session.metadata.credits);

    if (!userId || !creditsToAdd) {
    return res.status(400).json({ message: "Invalid metadata" });
  }

  const user = await UserModel.findByIdAndUpdate(userId , {
    $inc: { credits: creditsToAdd },
      $set: { isCreditAvailable: true },
  },{new:true})

  }

   res.json({ received: true });
}