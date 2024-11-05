const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const { User } = require('../models/user');
const { Product } = require('../models/product');
const { request } = require('express');
const orderController = require('./orders');

const emailSender = require('../helper/email_sender');
const emailBuilder = require('../helper/order_complete_email_builder');



exports.checkout = async function (req, res) {
    const accessToken = req.header('Authorization').replace('Bearer', '').trim();
    const tokenData = jwt.decode(accessToken);

    const user = await User.findById(tokenData.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    for (const cartItem of req.body.cartItem) {
        const product = await Product.findById(cartItem.product);
        if (!product) {
            return res
                .status(404)
                .json({ message: `${cartItem.name} not found` });

        } else if (!cartItem.reserved && product.countInStock < cartItem.quantity) {
            const message = `${product.name}\nOrder for ${cartItem.quantity}, but only ${product.countInStock} left in stock.`;
            return res.status(400).json({ message });
        }
    }


    let customerId;
    if (user.paymentCustomerId) {
        customerId = user.paymentCustomerId;
    } else {
        const customer = await stripe.customers.create({
            metadata: { userId: tokenData.id },
        });
        customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
        line_items: req.body.cartItem.map((item) => {
            return {
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: item.name,
                        image: item.images,
                        metadata: {
                            productId: item.productId,
                            cartProductId: item.cartProductId,
                            selectedSize: item.selectedSize ?? undefined,
                            selectedColour: item.selectedColour ?? undefined,
                        },
                    },
                    unit_amount: (item.price * 100).toFixed(0),
                },
                quantity: item.quantity,
            };
        }),
        payment_method_optionss: {
            card: { setup_future_usage: 'on_session' },
        },
        billing_address_collection: 'auto',
        shipping_address_collection: {
            allowed_countries: [
                "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
                "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BA", "BW", "BV", "BR", "IO",
                "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO",
                "KM", "CG", "CD", "CK", "CR", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO",
                "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
                "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
                "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM",
                "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY",
                "LI", "LT", "LU", "MO", "MK", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT",
                "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ",
                "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH",
                "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
                "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS",
                "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK",
                "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU",
                "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"
            ],
        },
        phone_number_collection: { enabled: true },
        customer: customerId,
        mode: 'payment',
        success_url: 'http://HoangPhuc.biz/payment-success',
        cancel_url: 'http://HoangPhuc.biz/cart'
    });
    res.status(201).json({ url: session.url });

};


exports.webhook = function (req, res) {
    const sig = request.headers['stripe-signature'];
    const endPorintSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhook.constructEvent(req.body, sig, endPorintSecret)
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'checkout.session.complete') {
        const session = event.data.object;

        stripe.customers.retrieve(session.customer)
            .then(async (customer) => {
                const lineItems = await stripe.checkout.sessions.listLineItems(
                    session.id,
                    { expand: ['data.price.product'] }
                );

                const orderItems = lineItems.data.map((item) => {
                    return {
                        quantity: item.quantity,
                        product: item.price.product.metadata.productId,
                        cartProductId: item.price.product.metadata.cartProductId,
                        productPrice: item.price.unit_amount / 100,
                        productName: item.price.product.name,
                        productImage: item.price.product.images[0],
                        selectedSize: item.price.product.metadata.selectedSize ?? undefined,
                        selectedColour: item.price.product.metadata.selectedColour ?? undefined,
                    }
                });

                const address = session.shipping_detail?.address ?? session.customer_detail_address;
                const order = await orderController.addOrder({
                    orderItems: orderItems,
                    shippingAddress: address.line1 === 'N/A' ? address.line2 : address.line1,
                    city: address.city,
                    postalCode: address.postal_code,
                    country: address.country,
                    phone: session.customer_detail.phone,
                    totalPrice: session.amount_total / 100,
                    user: customer.metadata.userId,
                    paymentId: session.payment_intent,
                });


                let user = await User.findById(customer.metadata.userId);
                if (user && !user.paymentCustomerId) {
                    user = await User.findByIdAndUpdate(
                        customer.metadata.userId,
                        { paymentCustomerId: session.customer },
                        { new: true },
                    );
                }

                const leanOrder = order.toObject();
                leanOrder['orderItems'] = orderItems;


                await emailSender.sendMail(
                    session.customer_detail.email ?? user.email,
                    'Your Purchase Order',
                    emailBuilder.buildEmail(
                        user.name,
                        leanOrder,
                        session.customer_detail.name
                    )
                );
            }).catch((error) => console.error('WEBHOOK ERROR CATCHER: ', error.message));
    } else {
        console.log(`Unhandled event type ${event.type} `);
    }
    res.send().end();
};
