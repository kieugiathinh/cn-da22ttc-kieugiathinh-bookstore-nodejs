import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
dotenv.config();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_KEY);
let cart;
let name;
let email;
let userID;

router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userID: req.body.userID,
    },
  });

  userID = req.body.userID;
  email = req.body.email;
  name = req.body.name;
  cart = req.body.cart;

  const line_items = req.body.cart.products.map((product) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          images: [product.img],
          description: product.desc,
          metadata: {
            id: product._id,
          },
        },
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    };
  });
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/myorders`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.send({ url: session.url });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// web hook
let endpointSecret;
// This is your Stripe CLI webhook secret for testing your endpoint locally.
//let endpointSecret = "whsec_6937b9a6f28503c82f9ee84dc862521ec39dd69868aa6a3d2d649033b7df6e99";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let data;
    let eventType;

    if (endpointSecret) {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("webhook verified ");
      } catch (err) {
        console.log("webhook error", err.message);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the event
    if (eventType === "checkout.session.completed") {
      console.log("=== WEBHOOK DEBUG ===");
      console.log("Event type:", eventType);
      console.log("Customer ID:", data.customer);
      console.log("User ID:", userID);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Cart products:", cart?.products);
      console.log("Cart total:", cart?.total);
      
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          console.log("Creating new order...");
          const newOrder = Order({
            name,
            userID,
            products: cart.products,
            total: cart.total,
            email,
          });
          const savedOrder = await newOrder.save();
          console.log("Order created successfully:", savedOrder._id);
        })
        .catch((err) => {
          console.log("Error creating order:", err.message);
        });
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send().end();
  }
);

export default router;
