import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const {items,Type,SuccessURL,CancelURL} = await req.json();
   console.log(items,Type)
     
    const product = await stripe.products.create({
      name:items.name
    })
    const amountincents = Math.round(items.price*100)
    let price 
    if (Type == "subscription"){
      price = await stripe.prices.create({
        unit_amount:amountincents,
        currency:"cad",
        product:product.id ,
        recurring:{interval:"month"}
      })
    }
    else{
      price = await stripe.prices.create({
        unit_amount:amountincents,
        currency:"cad",
        product:product.id
      })
    }
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price:price.id,quantity:1
      }],
      mode: Type,
      success_url: SuccessURL,
      cancel_url: CancelURL,
    });
    
    return new Response(JSON.stringify({ id: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
