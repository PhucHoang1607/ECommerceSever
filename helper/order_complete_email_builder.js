exports.buildEmail = (userName, order, shippingDetailsUserName) => {
    const orderTemplates = [];

    // Loop through each item in the order and create HTML for each item
    for (const orderItem of order.orderItems) {
        orderTemplates.push(
            orderItemTemplate(
                orderItem.productImage,
                orderItem.productName,
                orderItem.productPrice,
                orderItem.quantity,
                orderItem.selectedColour,
                orderItem.selectedSize
            )
        );
    }

    // Combine the order item templates into a single string
    const orderRows = orderTemplates.join('');

    // Build the email HTML structure
    const emailHtml = `
        <html>
            <body>
                <h2>Hello ${userName},</h2>
                <p>Thank you for your order! Here are the details:</p>
                <h3>Shipping Details:</h3>
                <p>Name: ${shippingDetailsUserName}</p>
                
                <h3>Order Summary:</h3>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Color</th>
                            <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderRows}
                    </tbody>
                </table>
                <p>We hope you enjoy your purchase!</p>
            </body>
        </html>
    `;

    return emailHtml;

    // Helper function to generate HTML for each order item
    function orderItemTemplate(
        itemImage,
        itemName,
        itemPrice,
        itemQuantity,
        selectedColour,
        selectedSize
    ) {
        // Generate color and size cells only if the values are provided
        const colorTemplate = selectedColour ? `<td>${selectedColour}</td>` : `<td>N/A</td>`;
        const sizeTemplate = selectedSize ? `<td>${selectedSize}</td>` : `<td>N/A</td>`;

        return `
            <tr>
                <td><img src="${itemImage}" alt="${itemName}" width="50" height="50"></td>
                <td>${itemName}</td>
                <td>${itemPrice}</td>
                <td>${itemQuantity}</td>
                ${colorTemplate}
                ${sizeTemplate}
            </tr>
        `;
    }
};


//// ====================> Another

// exports.buildEmail = (userName, order, shippingDetailsUserName) => {
//     const orderTemplates = [];
//     for (const orderItem of order.orderItems) {
//         orderTemplates.push(
//             orderItemTemplates(
//                 orderItem.productImage,
//                 orderItem.productName,
//                 orderItem.productPrice,
//                 orderItem.quantity,
//                 orderItem.selectedColour,
//                 orderItem.selectedSize,

//             )
//         );
//     }

//     const orderRows = orderTemplates.json('');
//     return `

//     `;

//     function orderItemTemplates(
//         itemImage,
//         itemName,
//         itemPrice,
//         itemQuantity,
//         selectedColour,
//         selectedSize
//     ) {
//         let colorTemplate = '';
//         let sizeTemplate = '';
//         if (selectedColour) {
//             colorTemplate = ``
//         }
//         if (selectedSize) {
//             sizeTemplate = ``
//         }
//         return ``;
//     }
// }


